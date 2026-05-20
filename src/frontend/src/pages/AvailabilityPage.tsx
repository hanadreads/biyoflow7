import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useZones } from "@/hooks/useQueries";
// AvailabilityPage.tsx — shows available water trucks near the customer
// with GPS-based distance to zone centres and 30s auto-refresh.
import { useLang } from "@/i18n/index";
import type { Zone } from "@/types/backend";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Zone centre coordinates (Hargeisa) ─────────────────────────────────────
const ZONE_CENTERS: Record<string, { lat: number; lng: number }> = {
  "Kood-Buur": { lat: 9.56, lng: 44.065 },
  "Ahmed Dhagax": { lat: 9.555, lng: 44.058 },
  "Ibrahim Kod": { lat: 9.55, lng: 44.07 },
  Boodhair: { lat: 9.545, lng: 44.062 },
  Mahabot: { lat: 9.565, lng: 44.07 },
  Daami: { lat: 9.57, lng: 44.06 },
  "Gabiley Road": { lat: 9.575, lng: 44.05 },
  "Arabsiyo Road": { lat: 9.58, lng: 44.045 },
  "Xamar Haato": { lat: 9.535, lng: 44.075 },
  Shacabka: { lat: 9.54, lng: 44.08 },
};

// ── Mock driver data (zone → drivers active/busy) ──────────────────────────
// In production this would come from the backend via a getOnlineDrivers() call.
const MOCK_DRIVERS: {
  name: string;
  zone: string;
  available: boolean;
  minPrice: number;
}[] = [
  { name: "Axmed", zone: "Kood-Buur", available: true, minPrice: 14000 },
  { name: "Cabdulahi", zone: "Kood-Buur", available: false, minPrice: 15000 },
  { name: "Maxamed", zone: "Ahmed Dhagax", available: true, minPrice: 13500 },
  { name: "Xasan", zone: "Ahmed Dhagax", available: true, minPrice: 14500 },
  { name: "Cumar", zone: "Ibrahim Kod", available: false, minPrice: 15500 },
  { name: "Faarax", zone: "Boodhair", available: true, minPrice: 13000 },
  { name: "Idiris", zone: "Mahabot", available: true, minPrice: 16000 },
  { name: "Nuur", zone: "Daami", available: true, minPrice: 14000 },
  { name: "Daahir", zone: "Gabiley Road", available: false, minPrice: 15000 },
  { name: "Saciid", zone: "Arabsiyo Road", available: true, minPrice: 14000 },
  { name: "Cali", zone: "Xamar Haato", available: true, minPrice: 13000 },
  { name: "Muuse", zone: "Shacabka", available: false, minPrice: 15500 },
];

// ── Haversine distance (km) ─────────────────────────────────────────────────
function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Language toggle ─────────────────────────────────────────────────────────
function LangToggle() {
  const { lang, setLang, t } = useLang();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "so" : "en")}
      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      data-ocid="availability.lang_toggle"
    >
      {t("lang_toggle")}
    </button>
  );
}

// ── Driver card ─────────────────────────────────────────────────────────────
function DriverCard({
  name,
  zone,
  available,
  minPrice,
  distanceKm,
  index,
  onOrder,
}: {
  name: string;
  zone: string;
  available: boolean;
  minPrice: number;
  distanceKm: number | null;
  index: number;
  onOrder: () => void;
}) {
  const { t } = useLang();
  const etaMinutes =
    distanceKm !== null ? Math.max(5, Math.round(distanceKm * 2)) : null;

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3"
      data-ocid={`availability.driver_card.${index}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {name[0]}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{name}</p>
            <p className="text-xs text-muted-foreground">{zone}</p>
          </div>
        </div>
        <Badge
          className={
            available
              ? "bg-accent/20 text-accent-foreground border-accent/30"
              : "bg-destructive/15 text-destructive border-destructive/25"
          }
        >
          {available ? t("availability_available") : t("availability_busy")}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {distanceKm !== null && (
          <div className="bg-muted/50 rounded-lg py-2 px-1">
            <p className="text-xs text-muted-foreground">
              {t("availability_distance")}
            </p>
            <p className="font-bold text-foreground text-sm">
              {distanceKm.toFixed(1)} km
            </p>
          </div>
        )}
        {etaMinutes !== null && (
          <div className="bg-muted/50 rounded-lg py-2 px-1">
            <p className="text-xs text-muted-foreground">
              {t("availability_estimatedTime")}
            </p>
            <p className="font-bold text-foreground text-sm">
              {etaMinutes} min
            </p>
          </div>
        )}
        <div
          className={`bg-muted/50 rounded-lg py-2 px-1 ${
            distanceKm !== null ? "" : "col-span-3"
          }`}
        >
          <p className="text-xs text-muted-foreground">From</p>
          <p className="font-bold text-foreground text-sm">
            {minPrice.toLocaleString()}{" "}
            <span className="text-xs font-normal">SLSh</span>
          </p>
        </div>
      </div>

      {/* CTA */}
      {available && (
        <Button
          type="button"
          className="w-full"
          size="sm"
          onClick={onOrder}
          data-ocid={`availability.order_btn.${index}`}
        >
          {t("availability_orderNow")}
        </Button>
      )}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ zone }: { zone: string }) {
  const { t } = useLang();
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
      data-ocid="availability.empty_state"
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
        🚛
      </div>
      <p className="font-semibold text-foreground">
        {t("availability_noTrucks")}
      </p>
      <p className="text-sm text-muted-foreground">{zone}</p>
    </div>
  );
}

// ── GPS permission banner ────────────────────────────────────────────────────
function GpsBanner({
  gpsState,
  onRequest,
}: {
  gpsState: "idle" | "granted" | "denied" | "requesting";
  onRequest: () => void;
}) {
  if (gpsState === "granted") return null;
  return (
    <div
      className="bg-secondary/10 border border-secondary/30 rounded-lg px-4 py-3 flex items-center justify-between gap-3"
      data-ocid="availability.gps_banner"
    >
      <div>
        <p className="text-sm font-medium text-foreground">
          {gpsState === "denied"
            ? "Location access denied"
            : "Enable location for distance info"}
        </p>
        <p className="text-xs text-muted-foreground">
          {gpsState === "denied"
            ? "Showing all zones without distance."
            : "We'll show how far each truck is from you."}
        </p>
      </div>
      {gpsState !== "denied" && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRequest}
          disabled={gpsState === "requesting"}
          data-ocid="availability.gps_request_btn"
        >
          {gpsState === "requesting" ? "Locating…" : "Allow"}
        </Button>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AvailabilityPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { data: zones = [], isLoading: zonesLoading } = useZones();

  // GPS
  const [gpsState, setGpsState] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  // Zone filter ("all" | zone name)
  const [activeZone, setActiveZone] = useState<string>("all");

  // Countdown for next refresh
  const [countdown, setCountdown] = useState(30);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request GPS
  const requestGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsState("denied");
      return;
    }
    setGpsState("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsState("granted");
      },
      () => setGpsState("denied"),
      { timeout: 8000 },
    );
  }, []);

  // Auto-request GPS on mount
  useEffect(() => {
    requestGps();
  }, [requestGps]);

  // 30s countdown + refresh ticker
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          setLastRefresh(new Date());
          return 30;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Detect nearest zone from GPS
  useEffect(() => {
    if (userPos && activeZone === "all" && zones.length > 0) {
      let nearest = "";
      let minDist = Number.POSITIVE_INFINITY;
      for (const z of zones) {
        const center = ZONE_CENTERS[z.name];
        if (!center) continue;
        const d = haversine(userPos.lat, userPos.lng, center.lat, center.lng);
        if (d < minDist) {
          minDist = d;
          nearest = z.name;
        }
      }
      if (nearest) setActiveZone(nearest);
    }
  }, [userPos, zones, activeZone]);

  // Compute distance for a zone name
  const distanceForZone = useCallback(
    (zoneName: string): number | null => {
      if (!userPos) return null;
      const center = ZONE_CENTERS[zoneName];
      if (!center) return null;
      return haversine(userPos.lat, userPos.lng, center.lat, center.lng);
    },
    [userPos],
  );

  // Filter drivers
  const filteredDrivers = MOCK_DRIVERS.filter(
    (d) => activeZone === "all" || d.zone === activeZone,
  );

  const handleManualRefresh = () => {
    setLastRefresh(new Date());
    setCountdown(30);
  };

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="availability.page"
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

      {/* Page title */}
      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h2 className="font-display font-bold text-foreground text-xl">
            {t("availability_title")}
          </h2>
          {gpsState === "granted" && userPos && (
            <p className="text-sm text-muted-foreground mt-1">
              📍 {activeZone !== "all" ? activeZone : "Detecting zone…"}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto w-full px-4 py-4 flex flex-col gap-4 flex-1">
        {/* GPS banner */}
        <GpsBanner gpsState={gpsState} onRequest={requestGps} />

        {/* Zone filter tabs */}
        <div
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
          data-ocid="availability.zone_filter"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            type="button"
            onClick={() => setActiveZone("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeZone === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
            data-ocid="availability.zone_all_tab"
          >
            All
          </button>
          {zonesLoading
            ? ["a", "b", "c", "d"].map((id) => (
                <Skeleton
                  key={`skeleton-zone-${id}`}
                  className="h-7 w-24 rounded-full flex-shrink-0"
                />
              ))
            : (zones as Zone[]).map((z) => (
                <button
                  key={z.id.toString()}
                  type="button"
                  onClick={() => setActiveZone(z.name)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeZone === z.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                  data-ocid={`availability.zone_tab.${Number(z.display_order)}`}
                >
                  {z.name}
                </button>
              ))}
        </div>

        {/* Refresh row */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Refreshes in {countdown}s
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            className="h-7 text-xs"
            data-ocid="availability.refresh_btn"
          >
            {t("btn_refresh")} ↺
          </Button>
        </div>

        {/* Driver list or empty state */}
        {filteredDrivers.length === 0 ? (
          <EmptyState zone={activeZone === "all" ? "any zone" : activeZone} />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredDrivers.map((driver, i) => (
              <DriverCard
                key={`${driver.zone}-${driver.name}`}
                name={driver.name}
                zone={driver.zone}
                available={driver.available}
                minPrice={driver.minPrice}
                distanceKm={distanceForZone(driver.zone)}
                index={i + 1}
                onOrder={() => void navigate({ to: "/customer" })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-2">
          {/* Nav links */}
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={() => void navigate({ to: "/customer" })}
              className="text-sm text-primary font-medium hover:underline"
              data-ocid="availability.order_water_link"
            >
              Order Water
            </button>
            <button
              type="button"
              onClick={() => void navigate({ to: "/driver" })}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="availability.driver_link"
            >
              Driver Login
            </button>
          </div>
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

      {/* Hidden dependency on lastRefresh to trigger re-renders */}
      <span className="hidden" aria-hidden>
        {lastRefresh.toISOString()}
      </span>
    </div>
  );
}
