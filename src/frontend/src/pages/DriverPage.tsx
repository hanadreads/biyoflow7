import { createActor } from "@/backend";
import { useLang } from "@/i18n/index";
import type { Driver, DriverPrices, Zone } from "@/types/backend";
import { DriverStatus } from "@/types/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// DriverPage: driver app shell.
// Handles login state, tab navigation (Dashboard | Earnings | History),
// and demo reset. Sub-views handle all real functionality.
import { useCallback, useEffect, useState } from "react";
import { DashboardView } from "./driver/DashboardView";
import { EarningsView } from "./driver/EarningsView";
import { HistoryView } from "./driver/HistoryView";
import { LoginView } from "./driver/LoginView";

const DRIVER_ID_KEY = "biyo_driver_id";

type Tab = "dashboard" | "earnings" | "history";

interface Session {
  driverId: bigint;
  name: string;
}

export default function DriverPage() {
  const { t, lang, setLang } = useLang();
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  // -- Auth state (persisted in localStorage) --
  const [session, setSession] = useState<Session | null>(() => {
    const stored = localStorage.getItem(DRIVER_ID_KEY);
    if (!stored) return null;
    return { driverId: BigInt(stored), name: "" };
  });
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [resetMsg, setResetMsg] = useState("");

  // -- Load driver profile when session exists --
  const profileQuery = useQuery({
    queryKey: ["driver-profile", session ? String(session.driverId) : null],
    queryFn: async (): Promise<{
      driver: Driver;
      prices: DriverPrices;
    } | null> => {
      if (!actor || !session) return null;
      return actor.getDriverProfile(session.driverId);
    },
    enabled: !!actor && !!session,
    staleTime: 5000,
  });

  // Load zones once (needed by sub-views)
  const zonesQuery = useQuery({
    queryKey: ["zones"],
    queryFn: async (): Promise<Zone[]> => {
      if (!actor) return [];
      const result = await actor.getZones();
      return [...result].sort(
        (a, b) => Number(a.display_order) - Number(b.display_order),
      );
    },
    enabled: !!actor,
    staleTime: 60_000,
  });

  const zones: Zone[] = zonesQuery.data ?? [];

  // Update session name once profile loads
  useEffect(() => {
    if (profileQuery.data?.driver && session) {
      const name = profileQuery.data.driver.name;
      if (name && session.name !== name) {
        setSession((s) => (s ? { ...s, name } : s));
      }
    }
  }, [profileQuery.data, session]);

  function handleLogin(driverId: bigint, name: string) {
    localStorage.setItem(DRIVER_ID_KEY, String(driverId));
    setSession({ driverId, name });
  }

  function handleLogout() {
    localStorage.removeItem(DRIVER_ID_KEY);
    setSession(null);
    void queryClient.clear();
  }

  const refreshProfile = useCallback(() => {
    if (session) {
      void queryClient.invalidateQueries({
        queryKey: ["driver-profile", String(session.driverId)],
      });
    }
  }, [queryClient, session]);

  async function handleDemoReset() {
    if (!actor) return;
    if (!window.confirm(t("demo_reset_confirm"))) return;
    await actor.resetDemo();
    setResetMsg(t("demo_reset_success"));
    void queryClient.clear();
    setTimeout(() => setResetMsg(""), 3000);
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!session) {
    return <LoginView onLogin={handleLogin} />;
  }

  // ── Profile loading ────────────────────────────────────────────────────────
  const profile = profileQuery.data;

  if (!profile && profileQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground font-mono">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (!profile && !profileQuery.isLoading) {
    handleLogout();
    return null;
  }

  const driver = profile!.driver;
  const prices = profile!.prices;
  const isOnline = driver.status === DriverStatus.online;

  // ── Tab content ────────────────────────────────────────────────────────────
  function renderTab() {
    if (!profile) return null;
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            driver={driver}
            prices={prices}
            zones={zones}
            onDriverUpdate={refreshProfile}
          />
        );
      case "earnings":
        return <EarningsView driverId={session!.driverId} zones={zones} />;
      case "history":
        return <HistoryView driverId={session!.driverId} zones={zones} />;
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: t("nav_dashboard") },
    { id: "earnings", label: t("nav_earnings") },
    { id: "history", label: t("nav_history") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[480px] mx-auto px-4 py-3 space-y-2">
          {/* Top row: branding + controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-primary text-lg">💧</span>
              <span className="font-display font-bold text-base text-foreground">
                {t("app_name")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-ocid="driver.lang_toggle"
                onClick={() => setLang(lang === "en" ? "so" : "en")}
                className="text-xs font-mono text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors duration-200"
                aria-label={`Switch to ${lang === "en" ? "Somali" : "English"}`}
              >
                {t("lang_toggle")}
              </button>
              <button
                type="button"
                data-ocid="driver.logout_button"
                onClick={handleLogout}
                className="text-xs text-destructive font-medium border border-destructive/30 rounded px-2 py-1 hover:bg-destructive/10 transition-colors"
              >
                {t("nav_logout")}
              </button>
            </div>
          </div>
          {/* Driver info row */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">
              {session.name || driver.name}
            </span>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                isOnline
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {isOnline ? "● Online" : "○ Offline"}
            </span>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <nav
        className="bg-card border-b border-border"
        aria-label="Driver navigation"
      >
        <div className="max-w-[480px] mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid={`driver.${tab.id}_tab`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition-colors duration-150 border-b-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 max-w-[480px] mx-auto w-full px-4 pt-4">
        {renderTab()}
      </main>

      {/* Footer: demo reset */}
      <footer className="bg-muted/40 border-t border-border py-4">
        <div className="max-w-[480px] mx-auto px-4 space-y-2">
          {resetMsg && (
            <p
              data-ocid="driver.reset_success"
              className="text-xs text-primary text-center font-mono"
            >
              {resetMsg}
            </p>
          )}
          <button
            type="button"
            data-ocid="driver.demo_reset_button"
            onClick={handleDemoReset}
            className="w-full text-xs text-muted-foreground border border-border rounded-lg py-2 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-colors"
          >
            {t("demo_reset")}
          </button>
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
