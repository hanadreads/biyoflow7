import type { Driver, DriverPrices, Order, Zone } from "@/backend";
import { DriverStatus, OrderStatus, TankSize, createActor } from "@/backend";
import { StatusBadge } from "@/components/StatusBadge";
import { useLang } from "@/i18n";
import { useActor } from "@caffeineai/core-infrastructure";
// DashboardView: status/shift, prices, incoming order, active delivery sections.
import { useEffect, useRef, useState } from "react";

// Format bigint SLSh with thousands separator
function fmtSlsh(val: bigint): string {
  return Number(val).toLocaleString();
}

function phoneLast4(phone: string): string {
  return `…${phone.slice(-4)}`;
}

const POLL_MS = 5000;

const DELIVERY_STEPS: OrderStatus[] = [
  OrderStatus.accepted,
  OrderStatus.en_route,
  OrderStatus.pumping,
  OrderStatus.completed,
];

interface Props {
  driver: Driver;
  prices: DriverPrices;
  zones: Zone[];
  onDriverUpdate: () => void;
}

export function DashboardView({
  driver,
  prices: initPrices,
  zones,
  onDriverUpdate,
}: Props) {
  const { t } = useLang();
  const { actor } = useActor(createActor);

  // -- Status / shift --
  const [plate, setPlate] = useState(driver.truck_plate || "");
  const [plateErr, setPlateErr] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const isOnline = driver.status === DriverStatus.online;

  // -- Zone --
  const [zoneId, setZoneId] = useState(driver.zone_id);
  const [zoneBusy, setZoneBusy] = useState(false);
  const [zoneMsg, setZoneMsg] = useState("");

  // -- Prices --
  const [prices, setPrices] = useState(initPrices);
  const [editPrices, setEditPrices] = useState(false);
  const [draftPrices, setDraftPrices] = useState(initPrices);
  const [pricesBusy, setPricesBusy] = useState(false);
  const [pricesMsg, setPricesMsg] = useState("");

  // -- Incoming orders (poll) --
  const [incoming, setIncoming] = useState<Order[]>([]);
  const [orderBusy, setOrderBusy] = useState<"accept" | "reject" | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -- Active delivery --
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [advanceBusy, setAdvanceBusy] = useState(false);

  // Determine active order from driver.current_order_id via incoming list or separate fetch
  // We fetch the active order whenever driver.current_order_id is set
  useEffect(() => {
    if (!actor || !driver.current_order_id) {
      setActiveOrder(null);
      return;
    }
    // find from incoming list or fetch
    actor.getIncomingOrders(driver.id).then((orders) => {
      const active = orders.find(
        (o) =>
          o.id === driver.current_order_id &&
          [
            OrderStatus.accepted,
            OrderStatus.en_route,
            OrderStatus.pumping,
            OrderStatus.exception,
          ].includes(o.status),
      );
      setActiveOrder(active ?? null);
    });
  }, [actor, driver.current_order_id, driver.id]);

  // Poll for incoming orders when online + no active order
  useEffect(() => {
    if (!actor || !isOnline || driver.current_order_id) {
      setIncoming([]);
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    const poll = async () => {
      const orders = await actor.getIncomingOrders(driver.id);
      setIncoming(orders);
    };
    poll();
    pollRef.current = setInterval(poll, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [actor, isOnline, driver.current_order_id, driver.id]);

  async function toggleStatus() {
    if (!actor) return;
    if (!isOnline && !plate.trim()) {
      setPlateErr(t("dash_truck_required"));
      return;
    }
    setPlateErr("");
    setStatusBusy(true);
    const newStatus = isOnline ? DriverStatus.offline : DriverStatus.online;
    await actor.setDriverStatus(driver.id, newStatus, plate.trim());
    setStatusBusy(false);
    onDriverUpdate();
  }

  async function switchZone(id: bigint) {
    if (!actor) return;
    setZoneId(id);
    setZoneBusy(true);
    setZoneMsg("");
    await actor.setDriverZone(driver.id, id);
    setZoneBusy(false);
    setZoneMsg(t("dash_zone_saved"));
    onDriverUpdate();
  }

  async function savePrices() {
    if (!actor) return;
    setPricesBusy(true);
    setPricesMsg("");
    const res = await actor.setDriverPrices(driver.id, draftPrices);
    setPricesBusy(false);
    if (res.__kind__ === "ok") {
      setPrices(draftPrices);
      setEditPrices(false);
      setPricesMsg(t("prices_saved"));
    } else {
      setPricesMsg(t("prices_error"));
    }
  }

  async function handleAccept(order: Order) {
    if (!actor) return;
    setOrderBusy("accept");
    const res = await actor.acceptOrder(driver.id, order.id);
    setOrderBusy(null);
    if (res.__kind__ === "ok") {
      setIncoming([]);
      if (pollRef.current) clearInterval(pollRef.current);
      setActiveOrder({ ...order, status: OrderStatus.accepted });
      onDriverUpdate();
    }
  }

  async function handleReject(order: Order) {
    if (!actor) return;
    setOrderBusy("reject");
    await actor.rejectOrder(driver.id, order.id);
    setOrderBusy(null);
    // let poll pick up next order
    setIncoming([]);
  }

  async function advanceStatus(order: Order) {
    if (!actor) return;
    const idx = DELIVERY_STEPS.indexOf(order.status);
    const next = DELIVERY_STEPS[idx + 1];
    if (!next) return;
    setAdvanceBusy(true);
    const res = await actor.updateOrderStatus(driver.id, order.id, next);
    setAdvanceBusy(false);
    if (res.__kind__ === "ok") {
      if (next === OrderStatus.completed) {
        setActiveOrder(null);
        onDriverUpdate();
      } else {
        setActiveOrder({ ...order, status: next });
      }
    }
  }

  const firstIncoming = incoming[0];
  const incomingZone = firstIncoming
    ? zones.find((z) => z.id === firstIncoming.zone_id)
    : null;
  const sizeLabel = (s: TankSize) => t(`size_${s}` as Parameters<typeof t>[0]);
  const priceForSize = (o: Order) => {
    if (o.size === TankSize.small) return prices.small;
    if (o.size === TankSize.medium) return prices.medium;
    return prices.large;
  };

  const nextStatusLabel = (o: Order) => {
    if (o.status === OrderStatus.accepted) return t("active_btn_en_route");
    if (o.status === OrderStatus.en_route) return t("active_btn_pumping");
    if (o.status === OrderStatus.pumping) return t("active_btn_completed");
    return "";
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Section A: Status + Shift */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {t("dash_zone")}
          </span>
          <StatusBadge status={driver.status} />
        </div>

        {/* Zone selector */}
        <div className="flex items-center gap-2">
          <select
            data-ocid="dash.zone_select"
            className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={String(zoneId)}
            onChange={(e) => switchZone(BigInt(e.target.value))}
            disabled={zoneBusy}
          >
            {zones.map((z) => (
              <option key={String(z.id)} value={String(z.id)}>
                {z.name}
              </option>
            ))}
          </select>
          {zoneBusy && (
            <span className="text-xs text-muted-foreground">
              {t("dash_saving_zone")}
            </span>
          )}
          {zoneMsg && <span className="text-xs text-green-600">{zoneMsg}</span>}
        </div>

        {/* Truck plate */}
        <div className="space-y-1">
          <label
            htmlFor="dash-truck-plate"
            className="text-sm font-medium text-foreground"
          >
            {t("dash_truck_plate")}
          </label>
          <input
            id="dash-truck-plate"
            data-ocid="dash.truck_plate_input"
            type="text"
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring uppercase"
            placeholder={t("dash_truck_placeholder")}
            value={plate}
            onChange={(e) => {
              setPlate(e.target.value.toUpperCase());
              setPlateErr("");
            }}
          />
          {plateErr && <p className="text-xs text-destructive">{plateErr}</p>}
        </div>

        {/* Online/Offline toggle */}
        <button
          data-ocid="dash.status_toggle"
          type="button"
          disabled={statusBusy}
          onClick={toggleStatus}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-smooth active:scale-95 disabled:opacity-60 ${
            isOnline
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {statusBusy
            ? isOnline
              ? t("dash_going_offline")
              : t("dash_going_online")
            : isOnline
              ? t("dash_go_offline")
              : t("dash_go_online")}
        </button>
      </div>

      {/* Section B: Prices */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{t("prices_title")}</h3>
          {!editPrices && (
            <button
              data-ocid="prices.edit_button"
              type="button"
              onClick={() => {
                setDraftPrices(prices);
                setEditPrices(true);
                setPricesMsg("");
              }}
              className="text-sm text-primary font-medium"
            >
              {t("prices_edit")}
            </button>
          )}
        </div>

        {pricesMsg && <p className="text-xs text-green-700">{pricesMsg}</p>}

        {editPrices ? (
          <div className="space-y-2">
            {(["small", "medium", "large"] as const).map((sz) => (
              <div key={sz} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-28">
                  {t(`prices_${sz}`)}
                </span>
                <input
                  data-ocid={`prices.${sz}_input`}
                  type="number"
                  min="0"
                  className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={String(draftPrices[sz])}
                  onChange={(e) =>
                    setDraftPrices((p) => ({
                      ...p,
                      [sz]: BigInt(e.target.value || 0),
                    }))
                  }
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button
                data-ocid="prices.save_button"
                type="button"
                disabled={pricesBusy}
                onClick={savePrices}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {pricesBusy ? t("prices_saving") : t("prices_save")}
              </button>
              <button
                data-ocid="prices.cancel_button"
                type="button"
                onClick={() => {
                  setEditPrices(false);
                  setPricesMsg("");
                }}
                className="flex-1 bg-muted text-foreground py-2 rounded-lg text-sm font-semibold"
              >
                {t("prices_cancel")}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {(["small", "medium", "large"] as const).map((sz) => (
              <div
                key={sz}
                className="bg-background border border-border rounded-lg p-2 text-center"
              >
                <p className="text-xs text-muted-foreground">
                  {t(`prices_${sz}`)}
                </p>
                <p className="text-sm font-bold text-foreground">
                  {fmtSlsh(prices[sz])}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exception warning */}
      {activeOrder?.status === OrderStatus.exception && (
        <div
          data-ocid="active.exception_card"
          className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-destructive font-bold text-sm">
              ⚠ {t("exception_title")}
            </span>
            {activeOrder.help_flagged && (
              <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                {t("exception_flagged")}
              </span>
            )}
          </div>
          <p className="text-sm text-destructive">{t("exception_body")}</p>
        </div>
      )}

      {/* Section D: Active Delivery */}
      {activeOrder && activeOrder.status !== OrderStatus.exception && (
        <div
          data-ocid="active.delivery_card"
          className="bg-card border border-border rounded-xl p-4 space-y-4"
        >
          <h3 className="font-semibold text-foreground">{t("active_title")}</h3>

          {/* Order details */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">
                {t("active_customer")}
              </p>
              <p className="font-medium">
                {phoneLast4(activeOrder.customer_phone)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">
                {t("active_size")}
              </p>
              <p className="font-medium">{sizeLabel(activeOrder.size)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">
                {t("active_price")}
              </p>
              <p className="font-medium">
                {fmtSlsh(priceForSize(activeOrder))} SLSh
              </p>
            </div>
            {activeOrder.address_note && (
              <div className="col-span-2">
                <p className="text-muted-foreground text-xs">
                  {t("active_address")}
                </p>
                <p className="font-medium text-foreground break-words">
                  {activeOrder.address_note}
                </p>
              </div>
            )}
          </div>

          {/* Status timeline */}
          <div className="flex items-center justify-between">
            {DELIVERY_STEPS.map((step, i) => {
              const stepLabels = [
                t("active_step_accepted"),
                t("active_step_en_route"),
                t("active_step_pumping"),
                t("active_step_completed"),
              ];
              const currentIdx = DELIVERY_STEPS.indexOf(activeOrder.status);
              const done = i <= currentIdx;
              return (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      done
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <p
                    className={`text-xs mt-1 text-center leading-tight ${
                      done
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stepLabels[i]}
                  </p>
                  {i < DELIVERY_STEPS.length - 1 && (
                    <div
                      className="absolute hidden" // spacer handled by flex
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Advance button */}
          {activeOrder.status !== OrderStatus.completed && (
            <button
              data-ocid="active.advance_button"
              type="button"
              disabled={advanceBusy}
              onClick={() => advanceStatus(activeOrder)}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-base transition-smooth active:scale-95 disabled:opacity-60"
            >
              {advanceBusy
                ? t("active_advancing")
                : nextStatusLabel(activeOrder)}
            </button>
          )}
        </div>
      )}

      {/* Section C: Incoming Order */}
      {!activeOrder && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-foreground">
            {t("incoming_title")}
          </h3>

          {!isOnline ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("incoming_offline_hint")}
            </p>
          ) : firstIncoming ? (
            <div
              data-ocid="incoming.order_card"
              className="bg-background border border-border rounded-lg p-3 space-y-3"
            >
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">
                    {t("incoming_zone")}
                  </p>
                  <p className="font-semibold">{incomingZone?.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {t("incoming_size")}
                  </p>
                  <p className="font-semibold">
                    {sizeLabel(firstIncoming.size)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">
                    {t("incoming_phone")}
                  </p>
                  <p className="font-semibold">
                    {phoneLast4(firstIncoming.customer_phone)}
                  </p>
                </div>
                {firstIncoming.address_note && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">
                      {t("incoming_note")}
                    </p>
                    <p className="break-words">{firstIncoming.address_note}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  data-ocid="incoming.reject_button"
                  type="button"
                  disabled={orderBusy !== null}
                  onClick={() => handleReject(firstIncoming)}
                  className="py-3 rounded-xl bg-destructive text-destructive-foreground font-bold text-base transition-smooth active:scale-95 disabled:opacity-60"
                >
                  {orderBusy === "reject"
                    ? t("incoming_rejecting")
                    : t("incoming_reject")}
                </button>
                <button
                  data-ocid="incoming.accept_button"
                  type="button"
                  disabled={orderBusy !== null}
                  onClick={() => handleAccept(firstIncoming)}
                  className="py-3 rounded-xl bg-green-600 text-white font-bold text-base transition-smooth active:scale-95 disabled:opacity-60"
                >
                  {orderBusy === "accept"
                    ? t("incoming_accepting")
                    : t("incoming_accept")}
                </button>
              </div>
            </div>
          ) : (
            <p
              data-ocid="incoming.empty_state"
              className="text-sm text-muted-foreground text-center py-6"
            >
              {t("incoming_waiting")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
