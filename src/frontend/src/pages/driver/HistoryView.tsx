import { createActor } from "@/backend";
import type { Zone } from "@/backend";
import { StatusBadge } from "@/components/StatusBadge";
import { useLang } from "@/i18n";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
// HistoryView: full order history list with expand-to-details.
import { useState } from "react";

function fmtDateTime(ts: bigint): string {
  return new Date(Number(ts)).toLocaleString();
}

function phoneLast4(phone: string): string {
  return `…${phone.slice(-4)}`;
}

interface Props {
  driverId: bigint;
  zones: Zone[];
}

export function HistoryView({ driverId, zones }: Props) {
  const { t } = useLang();
  const { actor, isFetching } = useActor(createActor);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const historyQuery = useQuery({
    queryKey: ["driver-history", String(driverId)],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDriverHistory(driverId);
    },
    enabled: !!actor && !isFetching,
  });

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const orders = historyQuery.data ?? [];

  return (
    <div className="space-y-2 pb-4">
      <h2 className="text-base font-semibold text-foreground px-1">
        {t("history_title")}
      </h2>

      {historyQuery.isLoading && (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("history_loading")}
        </p>
      )}

      {!historyQuery.isLoading && orders.length === 0 && (
        <p
          data-ocid="history.empty_state"
          className="text-sm text-muted-foreground text-center py-10"
        >
          {t("history_empty")}
        </p>
      )}

      {orders.map((order, i) => {
        const id = String(order.id);
        const zone = zones.find((z) => z.id === order.zone_id);
        const isExpanded = expanded.has(id);

        return (
          <div
            key={id}
            data-ocid={`history.item.${i + 1}`}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            {/* Summary row */}
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              onClick={() => toggleExpand(id)}
              data-ocid={`history.expand_button.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {zone?.name ?? "-"}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">
                    {order.size}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(Number(order.created_at)).toLocaleDateString()}
                  {" · "}
                  {phoneLast4(order.customer_phone)}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                <StatusBadge status={order.status} />
                <span className="text-muted-foreground text-xs">
                  {isExpanded ? "▲" : "▼"}
                </span>
              </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="bg-background border-t border-border px-4 py-3 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("history_date")}
                    </p>
                    <p className="font-medium">
                      {fmtDateTime(order.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("history_customer")}
                    </p>
                    <p className="font-medium">
                      {phoneLast4(order.customer_phone)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("history_zone")}
                    </p>
                    <p className="font-medium">{zone?.name ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("history_size")}
                    </p>
                    <p className="font-medium">{order.size}</p>
                  </div>
                  {order.address_note && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">
                        {t("active_address")}
                      </p>
                      <p className="font-medium break-words">
                        {order.address_note}
                      </p>
                    </div>
                  )}
                  {order.completed_at && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">
                        {t("active_step_completed")}
                      </p>
                      <p className="font-medium">
                        {fmtDateTime(order.completed_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
