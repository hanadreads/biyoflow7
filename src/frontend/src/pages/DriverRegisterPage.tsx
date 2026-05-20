// DriverRegisterPage: full-screen driver registration form.
// Note: backend registerDriver method is not yet available.
// The form collects data and shows a pending message until backend support lands.
import { useLang } from "@/i18n/index";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

interface FormData {
  fullName: string;
  phone: string;
  pin: string;
  confirmPin: string;
  truckPlate: string;
}

const INITIAL: FormData = {
  fullName: "",
  phone: "",
  pin: "",
  confirmPin: "",
  truckPlate: "",
};

export default function DriverRegisterPage() {
  const { t, lang, setLang } = useLang();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<FormData> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (form.pin.length !== 4) newErrors.pin = "PIN must be exactly 4 digits";
    if (form.confirmPin !== form.pin)
      newErrors.confirmPin = "PINs do not match";
    if (!form.truckPlate.trim())
      newErrors.truckPlate = "Truck plate / ID is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    // Backend registerDriver not yet available — show pending confirmation.
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary text-xl">💧</span>
            <span className="font-display font-bold text-base text-foreground">
              {t("app_name")}
            </span>
          </div>
          <button
            type="button"
            data-ocid="register.lang_toggle"
            onClick={() => setLang(lang === "en" ? "so" : "en")}
            className="text-xs font-mono text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors duration-200"
            aria-label={`Switch to ${lang === "en" ? "Somali" : "English"}`}
          >
            {t("lang_toggle")}
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Brand header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💧</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {t("driver_register")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("app_tagline")}
            </p>
          </div>

          {submitted ? (
            // ── Success / pending state ─────────────────────────────────────
            <div
              data-ocid="register.success_state"
              className="bg-card border border-border rounded-xl p-6 text-center space-y-4 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center mx-auto">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Registration Received
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Your details have been submitted. Driver account activation
                  will be available once registration is confirmed.
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                <p className="text-xs text-primary font-medium">
                  📱 Once approved, you'll be able to sign in and activate your
                  shift by paying $1 via ZAAD.
                </p>
              </div>
              <Link
                to="/driver"
                data-ocid="register.goto_login_link"
                className="block w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg text-center text-sm transition-smooth active:scale-95"
              >
                {t("driver_alreadyRegistered")}
              </Link>
            </div>
          ) : (
            // ── Registration form ───────────────────────────────────────────
            <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
              {/* Full Name */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-name"
                  className="text-sm font-medium text-foreground"
                >
                  {t("driver_fullName")}
                </label>
                <input
                  id="reg-name"
                  data-ocid="register.name_input"
                  type="text"
                  autoComplete="name"
                  className={`w-full bg-background border rounded-lg px-3 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    errors.fullName ? "border-destructive" : "border-input"
                  }`}
                  placeholder="e.g. Axmed Maxamed"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                />
                {errors.fullName && (
                  <p
                    data-ocid="register.name_field_error"
                    className="text-xs text-destructive mt-0.5"
                  >
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-phone"
                  className="text-sm font-medium text-foreground"
                >
                  {t("driver_phone")}
                </label>
                <input
                  id="reg-phone"
                  data-ocid="register.phone_input"
                  type="tel"
                  autoComplete="tel"
                  className={`w-full bg-background border rounded-lg px-3 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    errors.phone ? "border-destructive" : "border-input"
                  }`}
                  placeholder="063 XXXXXXX"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                {errors.phone && (
                  <p
                    data-ocid="register.phone_field_error"
                    className="text-xs text-destructive mt-0.5"
                  >
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* PIN */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-pin"
                  className="text-sm font-medium text-foreground"
                >
                  {t("driver_pin")}
                </label>
                <input
                  id="reg-pin"
                  data-ocid="register.pin_input"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  className={`w-full bg-background border rounded-lg px-3 py-3 text-foreground text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    errors.pin ? "border-destructive" : "border-input"
                  }`}
                  placeholder="••••"
                  value={form.pin}
                  onChange={(e) =>
                    set("pin", e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                />
                {errors.pin && (
                  <p
                    data-ocid="register.pin_field_error"
                    className="text-xs text-destructive mt-0.5"
                  >
                    {errors.pin}
                  </p>
                )}
              </div>

              {/* Confirm PIN */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-confirm-pin"
                  className="text-sm font-medium text-foreground"
                >
                  {t("driver_confirmPin")}
                </label>
                <input
                  id="reg-confirm-pin"
                  data-ocid="register.confirm_pin_input"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  className={`w-full bg-background border rounded-lg px-3 py-3 text-foreground text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    errors.confirmPin ? "border-destructive" : "border-input"
                  }`}
                  placeholder="••••"
                  value={form.confirmPin}
                  onChange={(e) =>
                    set(
                      "confirmPin",
                      e.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                />
                {errors.confirmPin && (
                  <p
                    data-ocid="register.confirm_pin_field_error"
                    className="text-xs text-destructive mt-0.5"
                  >
                    {errors.confirmPin}
                  </p>
                )}
              </div>

              {/* Truck Plate */}
              <div className="space-y-1">
                <label
                  htmlFor="reg-truck"
                  className="text-sm font-medium text-foreground"
                >
                  {t("driver_truckPlate")}
                </label>
                <input
                  id="reg-truck"
                  data-ocid="register.truck_input"
                  type="text"
                  className={`w-full bg-background border rounded-lg px-3 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    errors.truckPlate ? "border-destructive" : "border-input"
                  }`}
                  placeholder="e.g. HGS-1234"
                  value={form.truckPlate}
                  onChange={(e) => set("truckPlate", e.target.value)}
                />
                {errors.truckPlate && (
                  <p
                    data-ocid="register.truck_field_error"
                    className="text-xs text-destructive mt-0.5"
                  >
                    {errors.truckPlate}
                  </p>
                )}
              </div>

              <button
                type="button"
                data-ocid="register.submit_button"
                onClick={handleSubmit}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg transition-smooth active:scale-95 text-base mt-2"
              >
                {t("driver_registerBtn")}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                <Link
                  to="/driver"
                  data-ocid="register.signin_link"
                  className="text-primary font-medium hover:underline transition-colors"
                >
                  {t("driver_alreadyRegistered")}
                </Link>
              </p>
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
