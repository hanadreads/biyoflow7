import { createActor } from "@/backend";
import { Layout } from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { StepIndicator } from "@/components/StepIndicator";
import { useLocalOrder } from "@/hooks/useLocalOrder";
import { usePolling } from "@/hooks/usePolling";
import {
  useCreateOrder,
  useProcessPayment,
  useZones,
} from "@/hooks/useQueries";
import { useLang } from "@/i18n/index";
import type { Order, Zone } from "@/types/backend";
import { OrderStatus, TankSize } from "@/types/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
// CustomerPage: 7-step button-driven customer ordering flow.
// Steps: zone → size → phone → note → payment → finding → tracking
// Plus: manual order lookup collapsible section at the bottom.
import { useEffect, useMemo, useRef, useState } from "react";

// ── Constants ────────────────────────────────────────────────────────────────
const ZONE_LAST_KEY = "biyo_last_zone";
const TOTAL_STEPS = 7;

const _SIZE_OPTIONS: {
  value: TankSize;
  labelKey: "size_small" | "size_medium" | "size_large";
}[] = [
  { value: TankSize.small, labelKey: "size_small" },
  { value: TankSize.medium, labelKey: "size_medium" },
  { value: TankSize.large, labelKey: "size_large" },
];

// Active statuses: when matched or beyond, show tracking
const MATCHED_OR_BEYOND: OrderStatus[] = [
  OrderStatus.matched,
  OrderStatus.accepted,
  OrderStatus.en_route,
  OrderStatus.pumping,
  OrderStatus.completed,
];

// Format elapsed seconds as mm:ss
function fmtElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Sub-components (flat, no separate files) ─────────────────────────────────

/** Shared input style */
const inputCls =
  "w-full bg-background border border-input rounded-lg px-4 py-3 text-foreground text-lg font-mono focus:outline-none focus:ring-2 focus:ring-ring";

/** Container card for each step */
function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
      {children}
    </div>
  );
}

/** Back button (only show pre-payment) */
function BackBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      data-ocid="customer.back_button"
      onClick={onClick}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
    </button>
  );
}

/** Primary action button */
function PrimaryBtn({
  onClick,
  disabled,
  children,
  dataOcid,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  dataOcid?: string;
}) {
  return (
    <button
      type="button"
      data-ocid={dataOcid ?? "customer.primary_button"}
      disabled={disabled}
      onClick={onClick}
      className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl text-base transition-smooth active:scale-95 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerPage() {
  const { t } = useLang();
  const { actor } = useActor(createActor);
  const navigate = useNavigate();

  // ── Auth guard ───────────────────────────────────────────────────────────
  const rcSession = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("rc_session") || "");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!rcSession) {
      void navigate({ to: "/auth" });
    }
  }, [rcSession, navigate]);

  // -- Step state --
  const [step, setStep] = useState(1);

  // Pre-populate phone from RC session when entering step 3
  useEffect(() => {
    if (step === 3) {
      setPhone(rcSession?.phone ?? "");
    }
  }, [step, rcSession]);

  // -- Zone data --
  const zonesQuery = useZones();
  const zones: Zone[] = zonesQuery.data ?? [];

  // -- Step 1: zone --
  const [zoneError, setZoneError] = useState("");
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // -- Step 2: size --
  const [sizeError, setSizeError] = useState("");
  const [selectedSize, setSelectedSize] = useState<TankSize | null>(null);

  // -- Step 3: phone --
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // -- Step 4: note --
  const [note, setNote] = useState("");
  const NOTE_MAX = 120;

  // -- Step 5: payment --
  const idempotencyKey = useRef(crypto.randomUUID());
  const [payState, setPayState] = useState<"idle" | "processing" | "failed">(
    "idle",
  );
  const [payError, setPayError] = useState("");

  const createOrder = useCreateOrder();
  const processPayment = useProcessPayment();

  // -- Step 6/7: order tracking --
  const { localOrder, saveOrder, clearOrder } = useLocalOrder();
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [pollingActive, setPollingActive] = useState(false);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -- Lookup collapsible --
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupOrderId, setLookupOrderId] = useState("");
  const [lookupLast4, setLookupLast4] = useState("");
  const [lookupResult, setLookupResult] = useState<
    Order | null | "not_found" | "loading"
  >(null);

  // Restore active order from localStorage on mount
  useEffect(() => {
    if (localOrder) {
      setStep(6);
      setPollingActive(true);
    }
  }, [localOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore last zone
  useEffect(() => {
    const lastId = localStorage.getItem(ZONE_LAST_KEY);
    if (lastId && zones.length > 0) {
      const found = zones.find((z) => String(z.id) === lastId);
      if (found) setSelectedZone(found);
    }
  }, [zones]);

  // Elapsed timer while tracking
  useEffect(() => {
    if (step === 7) {
      elapsedRef.current = setInterval(
        () => setElapsedSecs((s) => s + 1),
        1000,
      );
    } else {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
      setElapsedSecs(0);
    }
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, [step]);

  // ── Poll order status ──────────────────────────────────────────────────────
  const activeOrderId = localOrder?.orderId ?? null;
  const activeLast4 = localOrder?.phone.slice(-4) ?? "";

  usePolling(
    async () => {
      if (!actor || !activeOrderId) return;
      const order = await actor.getOrder(activeOrderId, activeLast4);
      if (!order) return;
      setTrackedOrder(order);
      // Advance to tracking when driver matched/accepted/en_route/pumping
      if (MATCHED_OR_BEYOND.includes(order.status) && step === 6) {
        setStep(7);
      }
    },
    { active: pollingActive && !!actor && !!activeOrderId },
  );

  // Stop polling on terminal states
  useEffect(() => {
    if (!trackedOrder) return;
    const terminal: OrderStatus[] = [
      OrderStatus.completed,
      OrderStatus.expired,
      OrderStatus.cancelled,
    ];
    if (terminal.includes(trackedOrder.status)) {
      setPollingActive(false);
    }
  }, [trackedOrder]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handlePhoneSubmit() {
    if (phone.trim().length < 6) {
      setPhoneError(t("phone_invalid"));
      return;
    }
    setPhoneError("");
    setStep(4);
  }

  function handleNoteSubmit(skip: boolean) {
    if (!skip && note.length > NOTE_MAX) return;
    setStep(5);
  }

  async function handlePay() {
    if (!actor || !selectedZone || !selectedSize) return;
    setPayState("processing");
    setPayError("");
    try {
      // 1. Create order
      const createRes = await createOrder.mutateAsync({
        zone_id: selectedZone.id,
        size: selectedSize,
        customer_phone: phone.trim(),
        address_note: note.trim(),
        idempotency_key: idempotencyKey.current,
        customer_id: rcSession ? BigInt(rcSession.customerId) : null,
      });
      const orderId = createRes.order_id;

      // 2. Process payment
      const payRes = await processPayment.mutateAsync({
        order_id: orderId,
        idempotency_key: idempotencyKey.current,
      });

      if (
        payRes.status === "failed" ||
        (payRes as { status: string }).status === "failed"
      ) {
        setPayState("failed");
        setPayError(t("payment_failed"));
        return;
      }

      // 3. Save to localStorage and start polling
      saveOrder(orderId, phone.trim());
      setPayState("idle");
      setStep(6);
      setPollingActive(true);
    } catch {
      setPayState("failed");
      setPayError(t("payment_failed"));
    }
  }

  async function handleLookup() {
    if (!actor || !lookupOrderId.trim() || lookupLast4.length < 4) return;
    setLookupResult("loading");
    try {
      const order = await actor.getOrder(
        BigInt(lookupOrderId.trim()),
        lookupLast4.trim(),
      );
      setLookupResult(order ?? "not_found");
    } catch {
      setLookupResult("not_found");
    }
  }

  // ── Rendering helpers ─────────────────────────────────────────────────────

  const sizeLabelFor = (size: TankSize) => {
    if (size === TankSize.small) return t("size_small");
    if (size === TankSize.medium) return t("size_medium");
    return t("size_large");
  };

  // ── Step renders ──────────────────────────────────────────────────────────

  function renderStep1() {
    return (
      <StepCard>
        <h2 className="font-display font-bold text-xl text-foreground">
          {t("zone_title")}
        </h2>
        {zonesQuery.isLoading && (
          <div className="py-4 flex justify-center">
            <LoadingSpinner label={t("zone_loading")} />
          </div>
        )}
        {zonesQuery.isError && (
          <p className="text-sm text-destructive">{t("zone_error")}</p>
        )}
        {/* Zone button grid */}
        <div className="grid grid-cols-2 gap-3">
          {zones.map((zone) => (
            <button
              key={String(zone.id)}
              type="button"
              data-ocid={`customer.zone_button.${zone.name.toLowerCase().replace(/\s+/g, "_")}`}
              onClick={() => {
                setSelectedZone(zone);
                localStorage.setItem(ZONE_LAST_KEY, String(zone.id));
                setZoneError("");
                setStep(2);
              }}
              className={`p-3 rounded-xl border-2 text-left font-medium transition-all ${
                selectedZone?.id === zone.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {zone.name}
            </button>
          ))}
        </div>
        {selectedZone && (
          <p className="text-xs text-muted-foreground">
            {t("zone_remembered", { name: selectedZone.name })}
          </p>
        )}
        {zoneError && (
          <p
            data-ocid="customer.zone_error"
            className="text-sm text-destructive"
          >
            {zoneError}
          </p>
        )}
      </StepCard>
    );
  }

  function renderStep2() {
    const sizeCards = [
      {
        value: TankSize.small,
        label: t("size_small"),
        liters: "1,000L",
        icon: "🪣",
      },
      {
        value: TankSize.medium,
        label: t("size_medium"),
        liters: "2,000L",
        icon: "🛢️",
      },
      {
        value: TankSize.large,
        label: t("size_large"),
        liters: "5,000L",
        icon: "🚛",
      },
    ];
    return (
      <StepCard>
        <h2 className="font-display font-bold text-xl text-foreground">
          {t("size_title")}
        </h2>
        <div className="space-y-3">
          {sizeCards.map((size) => (
            <button
              key={size.value}
              type="button"
              data-ocid={`customer.size_button.${size.value}`}
              onClick={() => {
                setSelectedSize(size.value);
                setSizeError("");
                setStep(3);
              }}
              className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                selectedSize === size.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="text-3xl">{size.icon}</span>
              <div>
                <p className="font-semibold text-foreground">{size.label}</p>
                <p className="text-sm text-muted-foreground">{size.liters}</p>
              </div>
            </button>
          ))}
        </div>
        {sizeError && (
          <p
            data-ocid="customer.size_error"
            className="text-sm text-destructive"
          >
            {sizeError}
          </p>
        )}
        <BackBtn onClick={() => setStep(1)} label={t("btn_back")} />
      </StepCard>
    );
  }

  function renderStep3() {
    return (
      <StepCard>
        <h2 className="font-display font-bold text-xl text-foreground">
          {t("phone_title")}
        </h2>
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="phone-input"
        >
          {t("phone_label")}
        </label>
        <input
          id="phone-input"
          data-ocid="customer.phone_input"
          type="tel"
          className={inputCls}
          placeholder={t("phone_placeholder")}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setPhoneError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handlePhoneSubmit()}
        />
        {phoneError && (
          <p
            data-ocid="customer.phone_error"
            className="text-sm text-destructive"
          >
            {phoneError}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Changes apply to this order only. We strongly encourage using your
          registration number (the number you signed up with).
        </p>
        <PrimaryBtn
          dataOcid="customer.phone_next_button"
          onClick={handlePhoneSubmit}
        >
          {t("btn_next")}
        </PrimaryBtn>
        <BackBtn onClick={() => setStep(2)} label={t("btn_back")} />
      </StepCard>
    );
  }

  function renderStep4() {
    return (
      <StepCard>
        <h2 className="font-display font-bold text-xl text-foreground">
          {t("note_title")}
        </h2>
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="note-input"
        >
          {t("note_label")}
        </label>
        <textarea
          id="note-input"
          data-ocid="customer.note_input"
          className="w-full bg-background border border-input rounded-lg px-4 py-3 text-foreground text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={3}
          maxLength={NOTE_MAX}
          placeholder={t("note_placeholder")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <p className="text-xs text-muted-foreground text-right">
          {t("note_hint", { remaining: NOTE_MAX - note.length })}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            data-ocid="customer.note_skip_button"
            onClick={() => handleNoteSubmit(true)}
            className="flex-1 bg-muted text-foreground font-semibold py-3 rounded-xl text-sm"
          >
            {t("note_skip")}
          </button>
          <PrimaryBtn
            dataOcid="customer.note_next_button"
            onClick={() => handleNoteSubmit(false)}
          >
            {t("note_next")}
          </PrimaryBtn>
        </div>
        <BackBtn onClick={() => setStep(3)} label={t("btn_back")} />
      </StepCard>
    );
  }

  function renderStep5() {
    return (
      <StepCard>
        <h2 className="font-display font-bold text-xl text-foreground">
          {t("payment_title")}
        </h2>

        {/* Order summary */}
        <div
          data-ocid="customer.payment_summary"
          className="bg-background border border-border rounded-lg p-4 space-y-2 text-sm"
        >
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("payment_summary_zone")}
            </span>
            <span className="font-semibold text-foreground">
              {selectedZone?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("payment_summary_size")}
            </span>
            <span className="font-semibold text-foreground">
              {selectedSize ? sizeLabelFor(selectedSize) : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {t("payment_summary_phone")}
            </span>
            <span className="font-semibold text-foreground">{phone}</span>
          </div>
        </div>

        {payError && (
          <p
            data-ocid="customer.payment_error"
            className="text-sm text-destructive"
          >
            {payError}
          </p>
        )}

        {payState === "processing" ? (
          <div className="flex justify-center py-2">
            <LoadingSpinner label={t("payment_processing")} />
          </div>
        ) : payState === "failed" ? (
          <PrimaryBtn
            dataOcid="customer.payment_retry_button"
            onClick={handlePay}
          >
            {t("payment_retry")}
          </PrimaryBtn>
        ) : (
          <PrimaryBtn
            dataOcid="customer.payment_confirm_button"
            onClick={handlePay}
            disabled={!actor}
          >
            {t("payment_confirm_btn")}
          </PrimaryBtn>
        )}
        {/* No back button after pay attempt starts */}
        {payState === "idle" && (
          <BackBtn onClick={() => setStep(4)} label={t("btn_back")} />
        )}
      </StepCard>
    );
  }

  function renderStep6() {
    // Finding driver — poll until matched or terminal
    const isExpired = trackedOrder?.status === OrderStatus.expired;
    const isException = trackedOrder?.status === OrderStatus.exception;

    return (
      <StepCard>
        <h2 className="font-display font-bold text-xl text-foreground">
          {t("matching_title")}
        </h2>

        {isExpired ? (
          <div
            data-ocid="customer.finding_expired"
            className="text-center space-y-3 py-4"
          >
            <p className="text-4xl">⏱</p>
            <p className="text-destructive text-sm font-medium">
              {t("matching_expired")}
            </p>
            <button
              type="button"
              data-ocid="customer.start_over_button"
              onClick={() => {
                clearOrder();
                setStep(1);
                setTrackedOrder(null);
              }}
              className="text-sm text-primary underline"
            >
              {t("btn_back")}
            </button>
          </div>
        ) : isException ? (
          <div data-ocid="customer.finding_exception" className="space-y-2">
            <p className="text-destructive text-sm">
              {t("matching_exception")}
            </p>
          </div>
        ) : (
          <div className="text-center space-y-4 py-4">
            <LoadingSpinner size="md" />
            <p className="text-base font-medium text-foreground">
              {t("matching_searching")}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {localOrder
                ? t("tracking_order_id", { id: String(localOrder.orderId) })
                : ""}
            </p>
          </div>
        )}
      </StepCard>
    );
  }

  function renderStep7() {
    const order = trackedOrder;
    if (!order) {
      return (
        <div className="flex justify-center py-8">
          <LoadingSpinner label={t("loading")} />
        </div>
      );
    }

    const isCompleted = order.status === OrderStatus.completed;
    const isException = order.status === OrderStatus.exception;
    const phone4 = localOrder?.phone.slice(-4) ?? "";

    // Timeline steps for tracking
    const timelineSteps: { status: OrderStatus; label: string }[] = [
      { status: OrderStatus.matched, label: t("status_matched") },
      { status: OrderStatus.accepted, label: t("status_accepted") },
      { status: OrderStatus.en_route, label: t("status_en_route") },
      { status: OrderStatus.pumping, label: t("status_pumping") },
      { status: OrderStatus.completed, label: t("status_completed") },
    ];
    const statusOrder = [
      OrderStatus.matched,
      OrderStatus.accepted,
      OrderStatus.en_route,
      OrderStatus.pumping,
      OrderStatus.completed,
    ];
    const currentIdx = statusOrder.indexOf(order.status);

    return (
      <StepCard>
        {/* Check available trucks link */}
        <div className="flex items-center justify-between mb-1">
          <Link
            data-ocid="customer.availability_link"
            to="/availability"
            className="text-xs text-primary hover:underline transition-colors flex items-center gap-1"
          >
            🚛 {t("availability_title")}
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-foreground">
            {t("tracking_title")}
          </h2>
          <StatusBadge status={order.status} />
        </div>

        <p className="text-xs font-mono text-muted-foreground">
          {t("tracking_order_id", { id: String(order.id) })}
        </p>

        {isCompleted && !order.customer_confirmed && (
          <div
            data-ocid="customer.tracking_complete"
            className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-3"
          >
            <div className="text-center">
              <p className="text-2xl mb-1">🚛</p>
              <p className="font-semibold text-primary text-sm">
                The driver has confirmed delivery. Have you received your water?
              </p>
            </div>
            <Link
              data-ocid="customer.confirm_receipt_button"
              to="/confirm"
              search={{
                orderId: String(order.id),
                role: "customer",
                phone: phone4,
              }}
              className="block w-full text-center bg-primary text-primary-foreground font-bold py-3 rounded-xl text-sm transition-smooth active:scale-95"
            >
              {t("confirm_customerBtn")}
            </Link>
          </div>
        )}

        {isCompleted && order.customer_confirmed && (
          <div
            data-ocid="customer.tracking_complete"
            className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-center"
          >
            <p className="text-2xl mb-1">✅</p>
            <p className="font-semibold text-primary">
              {t("tracking_completed")}
            </p>
          </div>
        )}

        {isException && (
          <div
            data-ocid="customer.tracking_exception"
            className="bg-destructive/10 border border-destructive/30 rounded-lg p-3"
          >
            <p className="text-sm text-destructive">
              {t("tracking_exception")}
            </p>
          </div>
        )}

        {!isCompleted && !isException && (
          <p className="text-sm text-muted-foreground">
            {t("tracking_elapsed", { time: fmtElapsed(elapsedSecs) })}
          </p>
        )}

        {/* Status timeline */}
        <div className="space-y-2 pt-1">
          {timelineSteps.map((ts, i) => {
            const done = i <= currentIdx;
            return (
              <div key={ts.status} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span
                  className={`text-sm ${
                    done
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {ts.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Driver info */}
        {order.driver_id && (
          <div
            data-ocid="customer.driver_info"
            className="bg-background border border-border rounded-lg p-3 text-sm space-y-1"
          >
            <p className="font-semibold text-foreground text-xs uppercase tracking-wide text-muted-foreground">
              {t("tracking_driver_info")}
            </p>
            {order.help_flagged && (
              <p className="text-xs text-destructive">
                {t("tracking_help_flagged")}
              </p>
            )}
          </div>
        )}

        {isCompleted && (
          <button
            type="button"
            data-ocid="customer.new_order_button"
            onClick={() => {
              clearOrder();
              setStep(1);
              setTrackedOrder(null);
              setPollingActive(false);
            }}
            className="w-full bg-muted text-foreground font-semibold py-3 rounded-xl text-sm"
          >
            {t("btn_continue")}
          </button>
        )}
      </StepCard>
    );
  }

  // ── Lookup section ────────────────────────────────────────────────────────
  function renderLookup() {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          data-ocid="customer.lookup_toggle"
          className="w-full flex items-center justify-between px-5 py-4 text-left"
          onClick={() => setLookupOpen((o) => !o)}
        >
          <span className="font-medium text-foreground text-sm">
            {t("lookup_title")}
          </span>
          <span className="text-muted-foreground text-xs">
            {lookupOpen ? "▲" : "▼"}
          </span>
        </button>

        {lookupOpen && (
          <div className="px-5 pb-5 space-y-3 border-t border-border">
            <div className="space-y-1 pt-3">
              <label
                htmlFor="lookup-order-id"
                className="text-xs font-medium text-foreground"
              >
                {t("lookup_order_id_label")}
              </label>
              <input
                id="lookup-order-id"
                data-ocid="customer.lookup_order_id_input"
                type="number"
                inputMode="numeric"
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t("lookup_order_id_placeholder")}
                value={lookupOrderId}
                onChange={(e) => setLookupOrderId(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="lookup-phone4"
                className="text-xs font-medium text-foreground"
              >
                {t("lookup_phone4_label")}
              </label>
              <input
                id="lookup-phone4"
                data-ocid="customer.lookup_phone4_input"
                type="number"
                inputMode="numeric"
                maxLength={4}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t("lookup_phone4_placeholder")}
                value={lookupLast4}
                onChange={(e) => setLookupLast4(e.target.value.slice(0, 4))}
              />
            </div>
            <button
              type="button"
              data-ocid="customer.lookup_submit_button"
              onClick={handleLookup}
              disabled={!actor || lookupResult === "loading"}
              className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {lookupResult === "loading"
                ? t("lookup_loading")
                : t("lookup_btn")}
            </button>

            {lookupResult === "not_found" && (
              <p
                data-ocid="customer.lookup_not_found"
                className="text-sm text-destructive"
              >
                {t("lookup_not_found")}
              </p>
            )}

            {lookupResult !== null &&
              lookupResult !== "not_found" &&
              lookupResult !== "loading" && (
                <div
                  data-ocid="customer.lookup_result"
                  className="bg-background border border-border rounded-lg p-3 text-sm space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("tracking_order_id", { id: String(lookupResult.id) })}
                    </span>
                    <StatusBadge status={lookupResult.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(Number(lookupResult.created_at)).toLocaleString()}
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    );
  }

  const currentStep = step;

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="max-w-[480px] mx-auto px-4 py-6 space-y-4">
        {/* Session header — greeting + logout */}
        {rcSession && (
          <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-foreground">
              👋 {t("auth_hello", { name: rcSession.name ?? "Guest" })}
            </span>
            <button
              type="button"
              data-ocid="customer.logout_button"
              onClick={() => {
                localStorage.removeItem("rc_session");
                void navigate({ to: "/auth" });
              }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              {t("auth_logout")}
            </button>
          </div>
        )}

        {/* Step indicator — show for steps 1–7 */}
        {step <= 7 && (
          <StepIndicator current={currentStep} total={TOTAL_STEPS} />
        )}

        {/* See Available Trucks — visible on step 1 */}
        {step === 1 && (
          <div className="flex justify-end">
            <Link
              to="/availability"
              data-ocid="customer.see_trucks_link"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/8 border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary/15 transition-colors"
            >
              🚛 {t("availability_title")}
            </Link>
          </div>
        )}

        {/* Step content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
        {step === 7 && renderStep7()}

        {/* Manual lookup — always visible */}
        {renderLookup()}
      </div>
    </Layout>
  );
}
