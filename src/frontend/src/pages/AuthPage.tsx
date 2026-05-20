// AuthPage — unified entry point: role selection → RC login/register or WT login or Admin login.
import { Layout } from "@/components/Layout";
import { useLoginCustomer, useRegisterCustomer } from "@/hooks/useQueries";
import { useLang } from "@/i18n/index";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

type View = "role" | "rc_login" | "rc_register" | "wt_login";

const inputCls =
  "w-full bg-background border border-input rounded-lg px-4 py-3 text-foreground text-base focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {/* biome-ignore lint/a11y/noLabelWithoutControl: label wraps its input child */}
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function PrimaryBtn({
  children,
  disabled,
  dataOcid,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  dataOcid?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      data-ocid={dataOcid}
      disabled={disabled}
      onClick={onClick}
      className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl text-base transition-smooth active:scale-95 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function BackLink({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
    >
      ← {label}
    </button>
  );
}

export default function AuthPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("role");

  // RC login form
  const [rcPhone, setRcPhone] = useState("");
  const [rcPin, setRcPin] = useState("");
  const [rcError, setRcError] = useState("");
  const [rcLoading, setRcLoading] = useState(false);

  // RC register form
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPin, setRegPin] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // WT login form
  const [wtPhone, setWtPhone] = useState("");
  const [wtPin, setWtPin] = useState("");
  const [wtError, setWtError] = useState("");
  const [wtLoading, setWtLoading] = useState(false);

  const loginCustomer = useLoginCustomer();
  const registerCustomer = useRegisterCustomer();

  function fillTestAccount() {
    setView("rc_login");
    setRcPhone("06XTEST01");
    setRcPin("1234");
  }

  function fillWtTestAccount() {
    setWtPhone("06WTEST01");
    setWtPin("1234");
  }

  async function handleRcLogin() {
    if (!rcPhone.trim() || rcPin.length < 4) {
      setRcError(t("phone_invalid"));
      return;
    }
    setRcLoading(true);
    setRcError("");
    try {
      const res = await loginCustomer.mutateAsync({
        phone: rcPhone.trim(),
        pin: rcPin,
      });
      localStorage.setItem(
        "rc_session",
        JSON.stringify({
          customerId: String(res.customerId),
          name: res.name,
          phone: res.phone,
        }),
      );
      void navigate({ to: "/customer" });
    } catch {
      setRcError(t("auth_login_error"));
    } finally {
      setRcLoading(false);
    }
  }

  async function handleRcRegister() {
    if (!regName.trim() || !regPhone.trim() || regPin.length < 4) {
      setRegError(t("auth_fill_required"));
      return;
    }
    setRegLoading(true);
    setRegError("");
    try {
      const registered = await registerCustomer.mutateAsync({
        name: regName.trim(),
        phone: regPhone.trim(),
        pin: regPin,
        email: regEmail.trim() || null,
      });
      // Auto-login after register
      localStorage.setItem(
        "rc_session",
        JSON.stringify({
          customerId: String(registered.id),
          name: registered.name,
          phone: registered.phone,
        }),
      );
      void navigate({ to: "/customer" });
    } catch {
      setRegError(t("auth_register_error"));
    } finally {
      setRegLoading(false);
    }
  }

  async function handleWtLogin() {
    if (!wtPhone.trim() || wtPin.length < 4) {
      setWtError(t("login_error_invalid"));
      return;
    }
    setWtLoading(true);
    setWtError("");
    try {
      // Store pending WT login credentials; DriverPage will consume and authenticate
      localStorage.setItem(
        "wt_pending_login",
        JSON.stringify({ phone: wtPhone.trim(), pin: wtPin }),
      );
      void navigate({ to: "/driver" });
    } catch {
      setWtError(t("login_error_generic"));
    } finally {
      setWtLoading(false);
    }
  }

  // ── Views ────────────────────────────────────────────────────────────────

  function renderRoleSelection() {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-2">💧</div>
          <h1 className="font-display font-bold text-3xl text-foreground">
            {t("app_name")}
          </h1>
          <p className="text-muted-foreground text-base">
            {t("auth_welcome_sub")}
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            data-ocid="auth.rc_role_button"
            onClick={() => setView("rc_login")}
            className="w-full flex items-center gap-4 bg-card border-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5 rounded-2xl px-5 py-5 transition-smooth active:scale-95 text-left"
          >
            <span className="text-4xl">🏠</span>
            <div>
              <p className="font-bold text-foreground text-lg">
                {t("auth_rc_role")}
              </p>
              <p className="text-muted-foreground text-sm">
                {t("auth_rc_role_sub")}
              </p>
            </div>
          </button>

          <button
            type="button"
            data-ocid="auth.wt_role_button"
            onClick={() => setView("wt_login")}
            className="w-full flex items-center gap-4 bg-card border-2 border-accent/30 hover:border-accent/60 hover:bg-accent/5 rounded-2xl px-5 py-5 transition-smooth active:scale-95 text-left"
          >
            <span className="text-4xl">🚛</span>
            <div>
              <p className="font-bold text-foreground text-lg">
                {t("auth_wt_role")}
              </p>
              <p className="text-muted-foreground text-sm">
                {t("auth_wt_role_sub")}
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  function renderRcLogin() {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-foreground">
            {t("auth_rc_login_title")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("auth_rc_login_sub")}
          </p>
        </div>

        <div className="space-y-4">
          <FieldGroup label={t("phone_label")}>
            <input
              data-ocid="auth.rc_phone_input"
              type="tel"
              className={inputCls}
              placeholder="e.g. 063 4123456"
              value={rcPhone}
              onChange={(e) => {
                setRcPhone(e.target.value);
                setRcError("");
              }}
            />
          </FieldGroup>
          <FieldGroup label={t("login_pin")}>
            <input
              data-ocid="auth.rc_pin_input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              className={inputCls}
              placeholder="••••"
              value={rcPin}
              onChange={(e) => {
                setRcPin(e.target.value.slice(0, 4));
                setRcError("");
              }}
            />
          </FieldGroup>
        </div>

        {rcError && (
          <p
            data-ocid="auth.rc_login_error"
            className="text-sm text-destructive"
          >
            {rcError}
          </p>
        )}

        <PrimaryBtn
          dataOcid="auth.rc_login_button"
          disabled={rcLoading}
          onClick={handleRcLogin}
        >
          {rcLoading ? t("loading") : t("auth_login_btn")}
        </PrimaryBtn>

        <div className="text-center">
          <button
            type="button"
            data-ocid="auth.rc_go_register"
            onClick={() => setView("rc_register")}
            className="text-sm text-primary hover:underline"
          >
            {t("auth_no_account_register")}
          </button>
        </div>

        {/* RC Test account box */}
        <div
          data-ocid="auth.test_account_box"
          className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
              {t("auth_test_account_label")}
            </p>
            <div className="text-sm text-foreground space-y-1">
              <p>
                <span className="text-muted-foreground">
                  {t("phone_label")}:
                </span>{" "}
                06XTEST01
              </p>
              <p>
                <span className="text-muted-foreground">PIN:</span> 1234
              </p>
            </div>
          </div>
          <button
            type="button"
            data-ocid="auth.use_test_account_button"
            onClick={fillTestAccount}
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-2 rounded-lg text-sm transition-colors"
          >
            {t("auth_use_test_account")}
          </button>
        </div>

        <BackLink onClick={() => setView("role")} label={t("auth_back_role")} />
      </div>
    );
  }

  function renderRcRegister() {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-foreground">
            {t("auth_rc_register_title")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("auth_rc_register_sub")}
          </p>
        </div>

        <div className="space-y-4">
          <FieldGroup label={t("driver_fullName")}>
            <input
              data-ocid="auth.reg_name_input"
              type="text"
              className={inputCls}
              placeholder="e.g. Faadumo Hashi"
              value={regName}
              onChange={(e) => {
                setRegName(e.target.value);
                setRegError("");
              }}
            />
          </FieldGroup>
          <FieldGroup label={t("phone_label")}>
            <input
              data-ocid="auth.reg_phone_input"
              type="tel"
              className={inputCls}
              placeholder="e.g. 063 4123456"
              value={regPhone}
              onChange={(e) => {
                setRegPhone(e.target.value);
                setRegError("");
              }}
            />
          </FieldGroup>
          <FieldGroup label={t("login_pin")}>
            <input
              data-ocid="auth.reg_pin_input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              className={inputCls}
              placeholder="••••"
              value={regPin}
              onChange={(e) => {
                setRegPin(e.target.value.slice(0, 4));
                setRegError("");
              }}
            />
          </FieldGroup>
          <FieldGroup
            label={`${t("auth_email_label")} (${t("auth_optional")})`}
          >
            <input
              data-ocid="auth.reg_email_input"
              type="email"
              className={inputCls}
              placeholder="e.g. faadumo@email.com"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
          </FieldGroup>
        </div>

        {regError && (
          <p data-ocid="auth.reg_error" className="text-sm text-destructive">
            {regError}
          </p>
        )}

        <PrimaryBtn
          dataOcid="auth.reg_submit_button"
          disabled={regLoading}
          onClick={handleRcRegister}
        >
          {regLoading ? t("loading") : t("auth_register_btn")}
        </PrimaryBtn>

        <div className="text-center">
          <button
            type="button"
            data-ocid="auth.reg_go_login"
            onClick={() => setView("rc_login")}
            className="text-sm text-primary hover:underline"
          >
            {t("auth_already_have_account")}
          </button>
        </div>

        {/* Test account box */}
        <div
          data-ocid="auth.test_account_box"
          className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
              {t("auth_test_account_label")}
            </p>
            <div className="text-sm text-foreground space-y-1">
              <p>
                <span className="text-muted-foreground">
                  {t("driver_fullName")}:
                </span>{" "}
                Faadumo Test
              </p>
              <p>
                <span className="text-muted-foreground">
                  {t("phone_label")}:
                </span>{" "}
                06XTEST01
              </p>
              <p>
                <span className="text-muted-foreground">PIN:</span> 1234
              </p>
            </div>
          </div>
          <button
            type="button"
            data-ocid="auth.use_test_account_button"
            onClick={fillTestAccount}
            className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold py-2 rounded-lg text-sm transition-colors"
          >
            {t("auth_use_test_account")}
          </button>
        </div>

        <BackLink
          onClick={() => setView("rc_login")}
          label={t("auth_back_login")}
        />
      </div>
    );
  }

  function renderWtLogin() {
    return (
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-2xl text-foreground">
            {t("auth_wt_login_title")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("auth_wt_login_sub")}
          </p>
        </div>

        <div className="space-y-4">
          <FieldGroup label={t("phone_label")}>
            <input
              data-ocid="auth.wt_phone_input"
              type="tel"
              className={inputCls}
              placeholder="e.g. 063 4123456"
              value={wtPhone}
              onChange={(e) => {
                setWtPhone(e.target.value);
                setWtError("");
              }}
            />
          </FieldGroup>
          <FieldGroup label={t("login_pin")}>
            <input
              data-ocid="auth.wt_pin_input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              className={inputCls}
              placeholder="••••"
              value={wtPin}
              onChange={(e) => {
                setWtPin(e.target.value.slice(0, 4));
                setWtError("");
              }}
            />
          </FieldGroup>
        </div>

        {wtError && (
          <p
            data-ocid="auth.wt_login_error"
            className="text-sm text-destructive"
          >
            {wtError}
          </p>
        )}

        <PrimaryBtn
          dataOcid="auth.wt_login_button"
          disabled={wtLoading}
          onClick={handleWtLogin}
        >
          {wtLoading ? t("loading") : t("auth_login_btn")}
        </PrimaryBtn>

        <div className="text-center">
          <button
            type="button"
            data-ocid="auth.wt_go_register"
            onClick={() => void navigate({ to: "/driver/register" })}
            className="text-sm text-primary hover:underline"
          >
            {t("auth_wt_new_driver")}
          </button>
        </div>

        <BackLink onClick={() => setView("role")} label={t("auth_back_role")} />

        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 mt-3 text-sm">
          <p className="font-semibold text-accent-foreground mb-1">
            Test WT Account
          </p>
          <p className="text-muted-foreground mb-2">
            Phone: 06WTEST01 | PIN: 1234
          </p>
          <button
            type="button"
            data-ocid="auth.wt_fill_test_button"
            onClick={fillWtTestAccount}
            className="text-xs bg-accent/20 hover:bg-accent/30 text-accent-foreground px-3 py-1 rounded transition-colors"
          >
            Fill Test Credentials
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout hideFooter>
      <div className="max-w-[440px] mx-auto px-4 py-8 relative">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {view === "role" && renderRoleSelection()}
          {view === "rc_login" && renderRcLogin()}
          {view === "rc_register" && renderRcRegister()}
          {view === "wt_login" && renderWtLogin()}
        </div>

        {/* Discreet admin button — only on role selection */}
        {view === "role" && (
          <button
            type="button"
            data-ocid="auth.admin_access_button"
            onClick={() => void navigate({ to: "/admin" })}
            className="absolute bottom-10 right-4 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1"
            aria-label="Admin access"
          >
            🔒 Admin
          </button>
        )}
      </div>
    </Layout>
  );
}
