// ShiftActivationPage: 3-step wizard to activate a shift.
// Step 1 — Select shift period + pay
// Step 2 — Payment processing + Z-number reveal
// Step 3 — Enter Z-number + activate
import { createActor } from "@/backend";
import {
  usePayShiftFee,
  useRequestShift,
  useSubmitZNumber,
  useZones,
} from "@/hooks/useQueries";
import { useLang } from "@/i18n/index";
import { ShiftPeriod } from "@/types/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

const DRIVER_ID_KEY = "biyo_driver_id";

const TOTAL_STEPS = 3;

type Step = 1 | 2 | 3;

function getDriverId(): bigint | null {
  const raw = localStorage.getItem(DRIVER_ID_KEY);
  if (!raw) return null;
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ShiftActivationPage() {
  const { t, lang, setLang } = useLang();
  const { actor } = useActor(createActor);
  const navigate = useNavigate();

  const driverId = getDriverId();

  const [step, setStep] = useState<Step>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<ShiftPeriod | null>(
    null,
  );
  const [shiftId, setShiftId] = useState<bigint | null>(null);
  const [zNumber, setZNumber] = useState("");
  const [revealedZNumber, setRevealedZNumber] = useState("");
  const [error, setError] = useState("");
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const requestShift = useRequestShift();
  const payShiftFee = usePayShiftFee();
  const submitZNumber = useSubmitZNumber();
  const { data: zones } = useZones();

  // Redirect to /driver if no session
  useEffect(() => {
    if (!driverId) {
      void navigate({ to: "/driver" });
    }
  }, [driverId, navigate]);

  // Auto-redirect after activation
  useEffect(() => {
    if (activated) {
      redirectTimer.current = setTimeout(() => {
        void navigate({ to: "/driver" });
      }, 2000);
    }
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, [activated, navigate]);

  // ── Step 1: Select period & pay ─────────────────────────────────────────
  async function handlePayNow() {
    if (!driverId || !selectedPeriod || !actor) return;
    setError("");
    setStep(2);
    try {
      // Request the shift first
      const shift = await requestShift.mutateAsync({
        driverId,
        period: selectedPeriod,
        date: todayDate(),
      });
      // Then pay
      const payResult = await payShiftFee.mutateAsync({
        shiftId: shift.id,
        driverId,
      });
      setShiftId(shift.id);
      setRevealedZNumber(payResult.zNumber);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.",
      );
      setStep(1);
    }
  }

  // ── Step 3: Submit Z-number ──────────────────────────────────────────────
  async function handleActivate() {
    if (!driverId || !shiftId || zNumber.length !== 8) return;
    setError("");
    setActivating(true);
    try {
      await submitZNumber.mutateAsync({
        shiftId,
        zNumber: zNumber.toUpperCase(),
        driverId,
      });
      setActivated(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Verification failed. Check your Z-number.",
      );
    } finally {
      setActivating(false);
    }
  }

  const isPaying = requestShift.isPending || payShiftFee.isPending;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">💧</span>
            <span className="font-display font-bold text-base text-foreground">
              {t("app_name")}
            </span>
          </div>
          <button
            type="button"
            data-ocid="shift.lang_toggle"
            onClick={() => setLang(lang === "en" ? "so" : "en")}
            className="text-xs font-mono text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors duration-200"
            aria-label={`Switch to ${lang === "en" ? "Somali" : "English"}`}
          >
            {t("lang_toggle")}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Page title */}
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {t("shift_title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {formatDate(todayDate())}
            </p>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step} total={TOTAL_STEPS} />

          {/* Error banner */}
          {error && (
            <div
              data-ocid="shift.error_state"
              className="mt-4 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-3 py-2"
            >
              {error}
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div data-ocid="shift.step1.panel" className="mt-4 space-y-4">
              <p className="text-sm font-medium text-foreground">
                {t("shift_selectPeriod")}
              </p>

              {/* Period cards */}
              <div className="space-y-3">
                <PeriodCard
                  ocid="shift.morning_card"
                  period={ShiftPeriod.morning}
                  label={t("shift_morning")}
                  icon="🌅"
                  selected={selectedPeriod === ShiftPeriod.morning}
                  onSelect={() => setSelectedPeriod(ShiftPeriod.morning)}
                />
                <PeriodCard
                  ocid="shift.evening_card"
                  period={ShiftPeriod.evening}
                  label={t("shift_evening")}
                  icon="🌙"
                  selected={selectedPeriod === ShiftPeriod.evening}
                  onSelect={() => setSelectedPeriod(ShiftPeriod.evening)}
                />
              </div>

              {/* Fee label */}
              <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                <span className="text-primary text-sm">💵</span>
                <span className="text-sm text-primary font-medium">
                  {t("shift_feeLabel")}
                </span>
              </div>

              <button
                type="button"
                data-ocid="shift.pay_now_button"
                disabled={!selectedPeriod || isPaying}
                onClick={handlePayNow}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg transition-smooth active:scale-95 text-base disabled:opacity-50"
              >
                {t("shift_payNow")}
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div data-ocid="shift.step2.panel" className="mt-4 space-y-4">
              {isPaying ? (
                // Processing spinner
                <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-4 shadow-sm">
                  <div
                    data-ocid="shift.paying_loading_state"
                    className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"
                    aria-label="Processing payment"
                  />
                  <p className="text-base font-medium text-foreground">
                    {t("shift_paying")}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Please do not close this page
                  </p>
                </div>
              ) : revealedZNumber ? (
                // Z-number reveal
                <div
                  data-ocid="shift.payment_success_state"
                  className="bg-card border border-border rounded-xl p-6 space-y-5 shadow-sm"
                >
                  {/* Success checkmark */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {t("shift_paymentSuccess")}
                    </p>
                  </div>

                  {/* Z-number box */}
                  <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-5 text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-mono">
                      Your Z-Number
                    </p>
                    <p
                      data-ocid="shift.z_number_display"
                      className="text-3xl font-display font-bold tracking-[0.2em] text-primary"
                    >
                      {revealedZNumber}
                    </p>
                  </div>

                  <div className="bg-muted/60 rounded-lg px-4 py-3">
                    <p className="text-xs text-muted-foreground text-center">
                      📱 {t("shift_zNumberHint")}
                    </p>
                  </div>

                  <button
                    type="button"
                    data-ocid="shift.continue_button"
                    onClick={() => setStep(3)}
                    className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg transition-smooth active:scale-95 text-base"
                  >
                    {t("btn_continue")}
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div data-ocid="shift.step3.panel" className="mt-4 space-y-4">
              {activated ? (
                // Activated confirmation
                <div
                  data-ocid="shift.activated_success_state"
                  className="bg-card border border-border rounded-xl p-8 flex flex-col items-center gap-4 shadow-sm"
                >
                  <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center">
                    <span className="text-3xl">🟢</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-display font-bold text-foreground">
                      {t("shift_activated")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("shift_redirecting")}
                    </p>
                    {zones &&
                      (() => {
                        try {
                          const wtSession = JSON.parse(
                            localStorage.getItem("wt_session") || "null",
                          ) as { zone_id?: bigint | number } | null;
                          const zoneId = wtSession?.zone_id;
                          const zoneName =
                            zoneId !== undefined
                              ? zones.find((z) => z.id === BigInt(zoneId))?.name
                              : undefined;
                          return zoneName ? (
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium text-foreground">
                                Assigned Zone:
                              </span>{" "}
                              {zoneName}
                            </p>
                          ) : null;
                        } catch {
                          return null;
                        }
                      })()}
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {t("shift_enterZNumber")}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("shift_zNumberHint")}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="z-number-input"
                      className="text-sm font-medium text-foreground sr-only"
                    >
                      {t("shift_enterZNumber")}
                    </label>
                    <input
                      id="z-number-input"
                      data-ocid="shift.z_number_input"
                      type="text"
                      maxLength={8}
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full bg-background border border-input rounded-lg px-4 py-4 text-center text-foreground text-2xl tracking-[0.4em] font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                      placeholder="XXXXXXXX"
                      value={zNumber}
                      onChange={(e) =>
                        setZNumber(
                          e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, "")
                            .slice(0, 8),
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {zNumber.length}/8 characters
                    </p>
                  </div>

                  <button
                    type="button"
                    data-ocid="shift.activate_button"
                    disabled={zNumber.length !== 8 || activating}
                    onClick={handleActivate}
                    className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg transition-smooth active:scale-95 text-base disabled:opacity-50"
                  >
                    {activating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span
                          className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"
                          aria-hidden="true"
                        />
                        {t("shift_verifying")}
                      </span>
                    ) : (
                      t("shift_submitZNumber")
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted/40 border-t border-border py-4">
        <div className="max-w-[480px] mx-auto px-4">
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  const { t } = useLang();
  return (
    <div
      data-ocid="shift.step_indicator"
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-2 flex-1">
        {Array.from({ length: total }, (_, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < current;
          const isActive = stepNum === current;
          return (
            <div
              key={stepNum}
              className="flex items-center flex-1 last:flex-none"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  isDone
                    ? "bg-accent text-accent-foreground"
                    : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? "✓" : stepNum}
              </div>
              {stepNum < total && (
                <div
                  className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${
                    isDone ? "bg-accent" : "bg-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <span className="ml-3 text-xs text-muted-foreground font-mono whitespace-nowrap">
        {t("step_of", { current, total })}
      </span>
    </div>
  );
}

function PeriodCard({
  ocid,
  label,
  icon,
  selected,
  onSelect,
}: {
  ocid: string;
  period: ShiftPeriod;
  label: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onSelect}
      className={`w-full flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-150 ${
        selected
          ? "border-primary bg-primary/8 shadow-sm"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span
        className={`text-base font-medium ${
          selected ? "text-primary" : "text-foreground"
        }`}
      >
        {label}
      </span>
      {selected && (
        <span className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">✓</span>
        </span>
      )}
    </button>
  );
}
