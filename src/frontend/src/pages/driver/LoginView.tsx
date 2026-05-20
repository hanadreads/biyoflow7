import { createActor } from "@/backend";
import { useLang } from "@/i18n";
import { useActor } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
// LoginView: phone + PIN form. On success calls onLogin(driverId, driverName).
import { useState } from "react";

interface Props {
  onLogin: (driverId: bigint, name: string) => void;
}

export function LoginView({ onLogin }: Props) {
  const { t } = useLang();
  const { actor } = useActor(createActor);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!actor || !phone.trim() || pin.length !== 4) return;
    setLoading(true);
    setError("");
    try {
      const res = await actor.driverLogin(phone.trim(), pin);
      if (res.__kind__ === "ok") {
        localStorage.setItem("biyo_driver_id", String(res.ok.driver_id));
        onLogin(res.ok.driver_id, res.ok.name);
      } else {
        setError(t("login_error_invalid"));
      }
    } catch {
      setError(t("login_error_generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">💧</div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("app_name")}
          </h1>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {t("login_title")}
          </h2>

          {error && (
            <div
              data-ocid="login.error_state"
              className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-3 py-2"
            >
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label
              htmlFor="login-phone"
              className="text-sm font-medium text-foreground"
            >
              {t("login_phone")}
            </label>
            <input
              id="login-phone"
              data-ocid="login.phone_input"
              type="tel"
              className="w-full bg-background border border-input rounded-lg px-3 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="063 XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="login-pin"
              className="text-sm font-medium text-foreground"
            >
              {t("login_pin")}
            </label>
            <input
              id="login-pin"
              data-ocid="login.pin_input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              className="w-full bg-background border border-input rounded-lg px-3 py-3 text-foreground text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          <button
            data-ocid="login.submit_button"
            type="button"
            disabled={loading || !actor}
            onClick={handleLogin}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg transition-smooth disabled:opacity-50 active:scale-95 text-base"
          >
            {loading ? t("loading") : t("login_button")}
          </button>

          <div className="pt-1 text-center">
            <Link
              data-ocid="login.register_link"
              to="/driver/register"
              className="text-sm text-primary hover:underline transition-colors"
            >
              {t("driver_alreadyRegistered").replace(
                "Already registered? Sign in",
                "New driver? Register here",
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
