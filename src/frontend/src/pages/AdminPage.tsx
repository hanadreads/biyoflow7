import type { DriverSummary, OrderSummary, ZoneSummary } from "@/backend";
import { PaymentMode } from "@/backend";
import { Badge } from "@/components/ui/badge";
// AdminPage.tsx — Full admin panel with auth guard, tabs, and real-time data.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminLogin,
  useAdminSetDriverZones,
  useGetAllOrders,
  useGetDriverStatusSummary,
  useGetZoneSummary,
  useResetDemo,
  useSetDriverZone,
  useSetPaymentMode,
  useZones,
} from "@/hooks/useQueries";
import { useLang } from "@/i18n/index";
import {
  Activity,
  AlertTriangle,
  Globe,
  LayoutDashboard,
  LogOut,
  Package,
  RefreshCw,
  Settings,
  Truck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminSession {
  token: string;
  role: string;
}

type AdminTab = "overview" | "orders" | "drivers" | "settings";

// ── Status badge helpers ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/40",
    matched: "bg-primary/20 text-primary border-primary/40",
    accepted: "bg-primary/20 text-primary border-primary/40",
    en_route: "bg-primary/25 text-primary border-primary/50",
    pumping: "bg-secondary/20 text-secondary-foreground border-secondary/40",
    completed: "bg-emerald-500/20 text-emerald-700 border-emerald-500/40",
    fully_completed: "bg-accent/25 text-accent-foreground border-accent/50",
    expired: "bg-red-500/20 text-red-700 border-red-500/40",
    cancelled: "bg-red-500/20 text-red-700 border-red-500/40",
    exception: "bg-red-600/20 text-red-800 border-red-600/40",
    online: "bg-emerald-500/20 text-emerald-700 border-emerald-500/40",
    offline: "bg-muted text-muted-foreground border-border",
  };
  const cls = colors[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function formatDate(ns: bigint): string {
  return new Date(Number(ns) / 1_000_000).toLocaleString();
}

// ── Admin Login Form ──────────────────────────────────────────────────────────

function AdminLoginForm({
  onSuccess,
}: {
  onSuccess: (session: AdminSession) => void;
}) {
  const { t } = useLang();
  const [password, setPassword] = useState("");
  const login = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { password },
      {
        onSuccess: (session) => {
          localStorage.setItem("admin_session", JSON.stringify(session));
          onSuccess(session);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg border-border">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-display">
            {t("admin_login_title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("admin_login_hint")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">
                {t("admin_password_label")}
              </Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                data-ocid="admin.password_input"
                autoFocus
              />
            </div>
            {login.isError && (
              <p
                className="text-sm text-destructive"
                data-ocid="admin.login_error_state"
              >
                {t("admin_login_error")}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={!password || login.isPending}
              data-ocid="admin.login_submit_button"
            >
              {login.isPending ? t("loading") : t("admin_login_btn")}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t("admin_access_note")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const { t } = useLang();
  const zoneSummary = useGetZoneSummary();
  const driverSummary = useGetDriverStatusSummary();
  const allOrders = useGetAllOrders();

  const today = new Date().toDateString();
  const todayOrders = (allOrders.data ?? []).filter(
    (o) => new Date(Number(o.createdAt) / 1_000_000).toDateString() === today,
  ).length;
  const activeOrders = (allOrders.data ?? []).filter((o) =>
    ["accepted", "en_route", "pumping", "matched"].includes(o.status),
  ).length;
  const onlineDrivers = (driverSummary.data ?? []).filter(
    (d) => d.status === "online",
  ).length;
  const emptyZones = (zoneSummary.data ?? []).filter(
    (z) => z.onlineDrivers === 0n,
  ).length;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: t("admin_stat_today_orders"),
            value: todayOrders,
            icon: Package,
            color: "text-primary",
            ocid: "admin.stat_today_orders",
          },
          {
            label: t("admin_stat_active_orders"),
            value: activeOrders,
            icon: Activity,
            color: "text-primary",
            ocid: "admin.stat_active_orders",
          },
          {
            label: t("admin_stat_online_drivers"),
            value: onlineDrivers,
            icon: Truck,
            color: "text-accent-foreground",
            ocid: "admin.stat_online_drivers",
          },
          {
            label: t("admin_stat_empty"),
            value: emptyZones,
            icon: AlertTriangle,
            color:
              emptyZones > 0 ? "text-destructive" : "text-muted-foreground",
            ocid: "admin.stat_empty_zones",
          },
        ].map(({ label, value, icon: Icon, color, ocid }) => (
          <Card key={ocid} data-ocid={ocid} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-muted-foreground truncate">
                  {label}
                </span>
              </div>
              {allOrders.isLoading || driverSummary.isLoading ? (
                <Skeleton className="h-7 w-10" />
              ) : (
                <p className={`text-2xl font-bold font-display ${color}`}>
                  {value}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Zone summary table */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("admin_zone_summary")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    {t("admin_col_zone")}
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                    {t("admin_col_online_drivers")}
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                    {t("admin_col_pending")}
                  </th>
                  <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                    {t("admin_col_active")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {zoneSummary.isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr
                        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder rows
                        key={`skel-zone-${i}`}
                        className="border-b border-border"
                      >
                        {[1, 2, 3, 4].map((c) => (
                          <td key={c} className="px-4 py-3">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : (zoneSummary.data ?? []).map((z: ZoneSummary, i) => (
                      <tr
                        key={z.zoneName}
                        data-ocid={`admin.zone_row.item.${i + 1}`}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium">{z.zoneName}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={
                              z.onlineDrivers === 0n
                                ? "text-destructive font-medium"
                                : "text-primary font-medium"
                            }
                          >
                            {String(z.onlineDrivers)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {String(z.pendingOrders)}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {String(z.activeOrders)}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────────────

function OrdersTab() {
  const { t } = useLang();
  const { data: orders, isLoading } = useGetAllOrders();
  const [filterStatus, setFilterStatus] = useState("all");

  const statuses = [
    "all",
    "pending",
    "matched",
    "accepted",
    "en_route",
    "pumping",
    "completed",
    "expired",
    "exception",
  ];

  const filtered = (orders ?? [])
    .filter((o) => filterStatus === "all" || o.status === filterStatus)
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">
          {t("admin_filter_status")}:
        </span>
        <div className="flex flex-wrap gap-1.5" data-ocid="admin.status_filter">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              data-ocid={`admin.filter_tab.${s}`}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterStatus === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {s.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    ID
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    {t("admin_col_zone")}
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    {t("admin_col_size")}
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                    {t("admin_col_status")}
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden sm:table-cell">
                    {t("admin_col_driver")}
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden md:table-cell">
                    {t("admin_col_customer")}
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden lg:table-cell">
                    {t("admin_col_created")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder rows
                      key={`skel-order-${i}`}
                      className="border-b border-border"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                        <td key={c} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted-foreground"
                      data-ocid="admin.orders_empty_state"
                    >
                      {t("admin_no_orders")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((o: OrderSummary, i) => (
                    <tr
                      key={String(o.id)}
                      data-ocid={`admin.order_row.item.${i + 1}`}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        #{String(o.id)}
                      </td>
                      <td className="px-4 py-3">{o.zone}</td>
                      <td className="px-4 py-3 capitalize">{o.size}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                        {o.driverName ?? "—"}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {o.customerPhone}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                        {formatDate(o.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DriverZoneSelect({
  driverId,
  currentZoneName,
}: { driverId: bigint; currentZoneName: string }) {
  const { data: zones = [] } = useZones();
  const setZones = useAdminSetDriverZones();
  const defaultZoneId = zones.find((z) => z.name === currentZoneName)?.id;
  return (
    <select
      defaultValue={defaultZoneId !== undefined ? String(defaultZoneId) : ""}
      onChange={(e) =>
        setZones.mutate({ driverId, zoneIds: [BigInt(e.target.value)] })
      }
      className="text-sm bg-background border border-input rounded px-2 py-1 w-full"
    >
      {zones.map((z) => (
        <option key={String(z.id)} value={String(z.id)}>
          {z.name}
        </option>
      ))}
    </select>
  );
}

// ── Drivers Tab ───────────────────────────────────────────────────────────────

function DriversTab() {
  const { t } = useLang();
  const { data: drivers, isLoading } = useGetDriverStatusSummary();

  const sorted = (drivers ?? []).sort((a, b) => {
    if (a.status === "online" && b.status !== "online") return -1;
    if (a.status !== "online" && b.status === "online") return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  {t("admin_col_name")}
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  {t("admin_col_zone")}
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                  {t("admin_col_status")}
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden sm:table-cell">
                  {t("admin_col_phone")}
                </th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground hidden md:table-cell">
                  {t("admin_col_active_order")}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder rows
                    key={`skel-driver-${i}`}
                    className="border-b border-border"
                  >
                    {[1, 2, 3, 4, 5].map((c) => (
                      <td key={c} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                    data-ocid="admin.drivers_empty_state"
                  >
                    {t("admin_no_drivers")}
                  </td>
                </tr>
              ) : (
                sorted.map((d: DriverSummary, i) => (
                  <tr
                    key={String(d.id)}
                    data-ocid={`admin.driver_row.item.${i + 1}`}
                    className={`border-b border-border last:border-0 transition-colors ${
                      d.status === "online"
                        ? "bg-primary/5 hover:bg-primary/10"
                        : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3">
                      <DriverZoneSelect
                        driverId={d.id}
                        currentZoneName={d.zone}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                      {d.phone}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground font-mono text-xs">
                      {d.activeOrderId != null
                        ? `#${String(d.activeOrderId)}`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab() {
  const { t } = useLang();
  const setPaymentMode = useSetPaymentMode();
  const resetDemo = useResetDemo();
  const [confirmReset, setConfirmReset] = useState(false);
  const [currentMode, setCurrentMode] = useState<string>("always_success");
  const [resetSuccess, setResetSuccess] = useState(false);

  const modes = [
    {
      value: PaymentMode.always_success,
      label: t("admin_payment_always_success"),
    },
    { value: PaymentMode.always_fail, label: t("admin_payment_always_fail") },
    { value: PaymentMode.random, label: t("admin_payment_random") },
  ];

  const handleSetMode = (mode: PaymentMode) => {
    setPaymentMode.mutate(mode, {
      onSuccess: () => setCurrentMode(mode),
    });
  };

  const handleReset = () => {
    resetDemo.mutate(undefined, {
      onSuccess: () => {
        setConfirmReset(false);
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
      },
    });
  };

  return (
    <div className="space-y-6 max-w-lg">
      {/* Payment mode */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("admin_payment_mode_title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("admin_payment_mode_hint")}:{" "}
            <span className="font-semibold text-foreground">
              {currentMode.replace(/_/g, " ")}
            </span>
          </p>
        </CardHeader>
        <CardContent>
          <div
            className="flex flex-wrap gap-2"
            data-ocid="admin.payment_mode_toggle"
          >
            {modes.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                variant={currentMode === value ? "default" : "outline"}
                size="sm"
                onClick={() => handleSetMode(value)}
                disabled={setPaymentMode.isPending}
                data-ocid={`admin.payment_mode_${value}_button`}
              >
                {label}
              </Button>
            ))}
          </div>
          {setPaymentMode.isError && (
            <p
              className="mt-2 text-sm text-destructive"
              data-ocid="admin.payment_mode_error_state"
            >
              {t("admin_mode_error")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Demo reset */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("demo_reset")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("admin_reset_hint")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {resetSuccess && (
            <p
              className="text-sm text-primary font-medium"
              data-ocid="admin.reset_success_state"
            >
              ✓ {t("demo_reset_success")}
            </p>
          )}
          {!confirmReset ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setConfirmReset(true)}
              data-ocid="admin.reset_open_modal_button"
            >
              {t("demo_reset")}
            </Button>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive flex-1">
                {t("demo_reset_confirm")}
              </p>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleReset}
                disabled={resetDemo.isPending}
                data-ocid="admin.reset_confirm_button"
              >
                {resetDemo.isPending ? t("loading") : t("admin_reset_yes")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfirmReset(false)}
                data-ocid="admin.reset_cancel_button"
              >
                {t("btn_close")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Credentials reminder */}
      <Card className="border-border bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            {t("admin_credentials_title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 font-mono text-xs">
            <p>
              <span className="text-muted-foreground">Password:</span>{" "}
              <span className="text-foreground">BiyoAdmin2024!</span>
            </p>
            <p>
              <span className="text-muted-foreground">Token:</span>{" "}
              <span className="text-foreground">admin-session-token-2024</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab config ──────────────────────────────────────────────────────────────────

const TABS: {
  id: AdminTab;
  labelKey: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", labelKey: "admin_tab_overview", Icon: LayoutDashboard },
  { id: "orders", labelKey: "admin_tab_orders", Icon: Package },
  { id: "drivers", labelKey: "admin_tab_drivers", Icon: Truck },
  { id: "settings", labelKey: "admin_tab_settings", Icon: Settings },
];

// ── Dashboard (authenticated view) ───────────────────────────────────────────

function AdminDashboard({
  session,
  onLogout,
}: {
  session: AdminSession;
  onLogout: () => void;
}) {
  const { t, toggleLang } = useLang();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-foreground text-base sm:text-lg">
              {t("admin_dashboard_title")}
            </h1>
            <Badge
              variant="secondary"
              className="hidden sm:inline-flex text-xs"
            >
              {session.role}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              data-ocid="admin.lang_toggle"
              className="hidden sm:flex gap-1"
            >
              <Globe className="w-4 h-4" />
              {t("lang_toggle")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onLogout}
              data-ocid="admin.logout_button"
              className="gap-1 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t("nav_logout")}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main layout — sidebar on desktop, tabs on mobile */}
      <div className="flex-1 flex max-w-6xl mx-auto w-full">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-52 border-r border-border bg-card/50 py-4 gap-1 shrink-0">
          {TABS.map(({ id, labelKey, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              data-ocid={`admin.tab_${id}`}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm rounded-md mx-2 transition-colors ${
                activeTab === id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t(labelKey as Parameters<typeof t>[0])}
            </button>
          ))}
        </aside>

        {/* Content area */}
        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-lg text-foreground">
              {t(
                (TABS.find((tab) => tab.id === activeTab)?.labelKey ??
                  "admin_tab_overview") as Parameters<typeof t>[0],
              )}
            </h2>
            <button
              type="button"
              onClick={() => window.location.reload()}
              aria-label="Refresh"
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="admin.refresh_button"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "drivers" && <DriversTab />}
          {activeTab === "settings" && <SettingsTab />}
        </main>
      </div>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex items-stretch z-10">
        {TABS.map(({ id, labelKey, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            data-ocid={`admin.mobile_tab_${id}`}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              activeTab === id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{t(labelKey as Parameters<typeof t>[0])}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── AdminPage (root) ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin_session");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AdminSession;
        if (parsed.token && parsed.role) setSession(parsed);
      } catch {
        localStorage.removeItem("admin_session");
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("admin_session");
    setSession(null);
  }, []);

  if (!session) {
    return <AdminLoginForm onSuccess={setSession} />;
  }

  return <AdminDashboard session={session} onLogout={handleLogout} />;
}
