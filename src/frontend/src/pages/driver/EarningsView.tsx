import { createActor } from "@/backend";
import type { Zone } from "@/backend";
import { StatusBadge } from "@/components/StatusBadge";
import { useLang } from "@/i18n";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
// EarningsView: today summary + date range picker + period order list.
import { useState } from "react";

function fmtSlsh(val: bigint): string {
  return Number(val).toLocaleString();
}

function fmtDate(ts: bigint): string {
  return new Date(Number(ts)).toLocaleDateString();
}

interface Props {
  driverId: bigint;
  zones: Zone[];
}

export function EarningsView({ driverId, zones }: Props) {
  const { t } = useLang();
  const { actor, isFetching } = useActor(createActor);

  // Today earnings (no date range)
  const todayQuery = useQuery({
    queryKey: ["driver-earnings-today", String(driverId)],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDriverEarnings(driverId, null, null);
    },
    enabled: !!actor && !isFetching,
  });

  // Date range state
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [rangeKey, setRangeKey] = useState(0);

  const rangeQuery = useQuery({
    queryKey: [
      "driver-earnings-range",
      String(driverId),
      startDate,
      endDate,
      rangeKey,
    ],
    queryFn: async () => {
      if (!actor) return null;
      const startMs = BigInt(new Date(startDate).getTime());
      const endMs = BigInt(new Date(`${endDate}T23:59:59`).getTime());
      return actor.getDriverEarnings(driverId, startMs, endMs);
    },
    enabled: !!actor && !isFetching && rangeKey > 0,
  });

  const todayData = todayQuery.data;
  const rangeData = rangeQuery.data;

  return (
    <div className="space-y-4 pb-4">
      {/* Today summary */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold text-foreground mb-3">
          {t("earnings_today")}
        </h3>
        {todayQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">
            {t("earnings_loading")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background border border-border rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">
                {t("earnings_today_orders")}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {todayData?.orders.length ?? 0}
              </p>
            </div>
            <div className="bg-background border border-border rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">
                {t("earnings_today_total")}
              </p>
              <p className="text-xl font-bold text-primary">
                {fmtSlsh(todayData?.today_total ?? 0n)}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  {t("earnings_slsh")}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Date range */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-foreground">
          {t("earnings_period")}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label
              htmlFor="earnings-start"
              className="text-xs text-muted-foreground"
            >
              {t("earnings_start")}
            </label>
            <input
              id="earnings-start"
              data-ocid="earnings.start_input"
              type="date"
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="earnings-end"
              className="text-xs text-muted-foreground"
            >
              {t("earnings_end")}
            </label>
            <input
              id="earnings-end"
              data-ocid="earnings.end_input"
              type="date"
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <button
          data-ocid="earnings.view_button"
          type="button"
          onClick={() => setRangeKey((k) => k + 1)}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold"
        >
          {t("earnings_view")}
        </button>

        {rangeQuery.isLoading && (
          <p className="text-sm text-muted-foreground">
            {t("earnings_loading")}
          </p>
        )}

        {rangeData && (
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-t border-border">
              <span className="text-sm font-medium text-foreground">
                {t("earnings_period_total")}
              </span>
              <span className="font-bold text-primary">
                {fmtSlsh(rangeData.period_total)} {t("earnings_slsh")}
              </span>
            </div>

            {rangeData.orders.length === 0 ? (
              <p
                data-ocid="earnings.empty_state"
                className="text-sm text-muted-foreground text-center py-4"
              >
                {t("earnings_no_orders")}
              </p>
            ) : (
              <div className="space-y-2">
                {rangeData.orders.map((order, i) => {
                  const zone = zones.find((z) => z.id === order.zone_id);
                  return (
                    <div
                      key={String(order.id)}
                      data-ocid={`earnings.item.${i + 1}`}
                      className="flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {zone?.name ?? "-"} · {order.size}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fmtDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
