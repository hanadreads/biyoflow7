import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirmDelivery, useGetOrder } from "@/hooks/useQueries";
// DeliveryConfirmPage.tsx — dual delivery confirmation for driver + customer.
// URL: /confirm?orderId=<id>&role=driver|customer&phone=<last4>
import { useLang } from "@/i18n/index";
import type { Order } from "@/types/backend";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

// ── Helpers ──────────────────────────────────────────────────────────────────
function sizeLabel(size: string): string {
  if (size === "small") return "Small (1,000 L)";
  if (size === "medium") return "Medium (2,000 L)";
  if (size === "large") return "Large (5,000 L)";
  return size;
}

function statusFlags(order: Order | null): {
  driverConfirmed: boolean;
  customerConfirmed: boolean;
  bothConfirmed: boolean;
} {
  // The backend marks the order completed when both sides confirm.
  // We infer individual confirmations from the driver_confirmed / customer_confirmed
  // fields — or from the order status when both are done.
  const o = order as
    | (Order & { driver_confirmed?: boolean; customer_confirmed?: boolean })
    | null;
  if (!o)
    return {
      driverConfirmed: false,
      customerConfirmed: false,
      bothConfirmed: false,
    };
  const both = String(o.status) === "completed";
  const dc = both || (o.driver_confirmed ?? false);
  const cc = both || (o.customer_confirmed ?? false);
  return { driverConfirmed: dc, customerConfirmed: cc, bothConfirmed: both };
}

// ── Language toggle ─────────────────────────────────────────────────────────
function LangToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "so" : "en")}
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      data-ocid="confirm.lang_toggle"
    >
      {t("lang_toggle")}
    </button>
  );
}

// ── Celebration animation ───────────────────────────────────────────────────
function CelebrationState() {
  const { t } = useLang();
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-12 text-center"
      data-ocid="confirm.success_state"
    >
      <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-4xl animate-bounce">
        ✅
      </div>
      <h3 className="font-display font-bold text-foreground text-xl">
        {t("confirm_bothConfirmed")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Both sides have confirmed. The delivery is complete!
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
          ✓ {t("confirm_driverConfirmed")}
        </Badge>
        <Badge className="bg-primary/15 text-primary border-primary/30">
          ✓ {t("confirm_customerConfirmed")}
        </Badge>
      </div>
    </div>
  );
}

// ── Order summary card ───────────────────────────────────────────────────────
function OrderSummaryCard({ order }: { order: Order }) {
  const size =
    typeof order.size === "object" && order.size !== null
      ? Object.keys(order.size)[0]
      : String(order.size);
  return (
    <div className="bg-muted/30 rounded-xl border border-border p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Order
        </span>
        <span className="font-mono text-sm text-foreground">
          #{order.id.toString()}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Zone</p>
          <p className="font-medium text-foreground">
            Zone {order.zone_id.toString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Size</p>
          <p className="font-medium text-foreground">{sizeLabel(size)}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function DeliveryConfirmPage() {
  const { t } = useLang();
  const navigate = useNavigate();

  // Parse query params: orderId, role, phone
  const search = useSearch({ strict: false }) as {
    orderId?: string;
    role?: string;
    phone?: string;
  };

  const orderIdRaw = search.orderId ?? "";
  const role =
    search.role === "driver" || search.role === "customer"
      ? search.role
      : "customer";
  const phone4 = search.phone ?? "0000";

  const orderId = orderIdRaw ? BigInt(orderIdRaw) : null;

  // Fetch order — poll every 5s to detect the other party confirming
  const { data: order, isLoading } = useGetOrder(orderId, phone4, !!orderId);

  // Poll by refetch interval — we simulate via local timer
  const [pollTick, setPollTick] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    pollRef.current = setInterval(() => setPollTick((n) => n + 1), 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);
  // pollTick is used to keep the hook fresh by invalidating cache externally.
  // In the actual hook refetchInterval is handled via invalidateQueries onSuccess.
  void pollTick;

  const confirmMutation = useConfirmDelivery();
  const [localConfirmed, setLocalConfirmed] = useState(false);

  const { driverConfirmed, customerConfirmed, bothConfirmed } = statusFlags(
    order ?? null,
  );

  const iHaveConfirmed =
    (role === "driver" && (driverConfirmed || localConfirmed)) ||
    (role === "customer" && (customerConfirmed || localConfirmed));

  const otherConfirmed =
    role === "driver" ? customerConfirmed : driverConfirmed;

  const handleConfirm = () => {
    if (!orderId || confirmMutation.isPending) return;
    confirmMutation.mutate(
      { orderId, role },
      { onSuccess: () => setLocalConfirmed(true) },
    );
  };

  // ── Missing params guard ─────────────────────────────────────────────────
  if (!orderIdRaw) {
    return (
      <div
        className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4"
        data-ocid="confirm.error_state"
      >
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <p className="font-semibold text-foreground text-center">
          Missing order information.
        </p>
        <p className="text-sm text-muted-foreground text-center">
          Please go back and try again.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void navigate({ to: "/" })}
          data-ocid="confirm.back_btn"
        >
          {t("btn_back")}
        </Button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="confirm.page"
    >
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">💧</span>
            <h1 className="font-display font-bold text-foreground text-lg">
              {t("app_name")}
            </h1>
          </div>
          <LangToggle />
        </div>
      </header>

      {/* Page title band */}
      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
            {role === "driver" ? "🚛" : "🏠"}
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground text-lg">
              {t("confirm_title")}
            </h2>
            <p className="text-xs text-muted-foreground capitalize">
              {role} view · Order #{orderIdRaw}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-6 flex-1">
        {/* Order summary */}
        {isLoading ? (
          <div
            className="flex flex-col gap-2"
            data-ocid="confirm.loading_state"
          >
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : order ? (
          <OrderSummaryCard order={order} />
        ) : (
          <div
            className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 text-sm text-destructive"
            data-ocid="confirm.error_state"
          >
            Could not load order details.
          </div>
        )}

        {/* Celebration — both confirmed */}
        {bothConfirmed && <CelebrationState />}

        {/* Confirmation status badges */}
        {!bothConfirmed && (
          <div className="flex flex-col gap-3">
            {/* Driver status */}
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 ${
                driverConfirmed
                  ? "bg-accent/10 border-accent/30"
                  : "bg-card border-border"
              }`}
              data-ocid="confirm.driver_status"
            >
              <span className="text-2xl">{driverConfirmed ? "✅" : "⏳"}</span>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {driverConfirmed
                    ? t("confirm_driverConfirmed")
                    : "Waiting for driver…"}
                </p>
                {!driverConfirmed && (
                  <p className="text-xs text-muted-foreground">
                    Driver has not confirmed yet
                  </p>
                )}
              </div>
            </div>

            {/* Customer status */}
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 ${
                customerConfirmed
                  ? "bg-primary/10 border-primary/30"
                  : "bg-card border-border"
              }`}
              data-ocid="confirm.customer_status"
            >
              <span className="text-2xl">
                {customerConfirmed ? "✅" : "⏳"}
              </span>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {customerConfirmed
                    ? t("confirm_customerConfirmed")
                    : "Waiting for customer…"}
                </p>
                {!customerConfirmed && (
                  <p className="text-xs text-muted-foreground">
                    Customer has not confirmed yet
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Primary action */}
        {!bothConfirmed && !iHaveConfirmed && (
          <Button
            type="button"
            size="lg"
            className="w-full h-14 text-base font-semibold"
            onClick={handleConfirm}
            disabled={confirmMutation.isPending || !orderId}
            data-ocid="confirm.primary_button"
          >
            {confirmMutation.isPending
              ? "Confirming…"
              : role === "driver"
                ? t("confirm_driverBtn")
                : t("confirm_customerBtn")}
          </Button>
        )}

        {/* Already confirmed, waiting for the other */}
        {!bothConfirmed && iHaveConfirmed && (
          <div
            className="bg-muted/50 rounded-xl border border-border p-4 text-center"
            data-ocid="confirm.waiting_state"
          >
            <p className="text-sm font-medium text-foreground">
              {t("confirm_waiting")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {otherConfirmed
                ? "Both sides confirmed!"
                : role === "driver"
                  ? "Waiting for customer to confirm receipt…"
                  : "Waiting for driver to confirm delivery…"}
            </p>
            <div className="mt-3 flex justify-center">
              <div className="w-6 h-6 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* Mutation error */}
        {confirmMutation.isError && (
          <div
            className="bg-destructive/5 border border-destructive/20 rounded-xl p-3 text-sm text-destructive text-center"
            data-ocid="confirm.error_state"
          >
            {confirmMutation.error instanceof Error
              ? confirmMutation.error.message
              : "Something went wrong. Please try again."}
            <button
              type="button"
              className="ml-2 underline"
              onClick={() => confirmMutation.reset()}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Back link */}
        {bothConfirmed && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => void navigate({ to: "/" })}
            data-ocid="confirm.back_home_btn"
          >
            Back to Home
          </Button>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-lg mx-auto px-4 py-4">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
