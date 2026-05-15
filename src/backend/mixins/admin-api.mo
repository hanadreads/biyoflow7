// Public API mixin — Admin / demo operations
import OrderLib "../lib/orders";
import DriverLib "../lib/drivers";
import ZoneLib "../lib/zones";
import OrderTypes "../types/orders";
import DriverTypes "../types/drivers";
import ZoneTypes "../types/zones";
import List "mo:core/List";
import Map "mo:core/Map";

mixin (
  orders        : List.List<OrderTypes.Order>,
  statusHistory : List.List<OrderTypes.OrderStatusEntry>,
  auditLogs     : List.List<OrderTypes.AuditLog>,
  drivers       : List.List<DriverTypes.Driver>,
  zones         : List.List<ZoneTypes.Zone>,
  driverPrices  : Map.Map<Nat, DriverTypes.DriverPrices>,
  config        : { var paymentMode : OrderTypes.PaymentMode },
  counters      : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat; var nextDriverId : Nat; var nextZoneId : Nat },
) {
  // Wipe all state and re-seed to initial Hargeisa demo data.
  // Resets drivers to offline, clears all orders/history/logs, then re-seeds zones + drivers.
  public func resetDemo() : async { #ok } {
    // Reset order-side state
    OrderLib.resetOrders(orders, statusHistory, auditLogs, counters);

    // Re-seed zones (also resets nextZoneId)
    ZoneLib.seedZones(zones, counters);

    // Re-seed drivers and prices (also resets nextDriverId)
    DriverLib.seedDrivers(drivers, driverPrices, counters);

    // Reset payment mode to default
    config.paymentMode := #always_success;

    #ok;
  };

  // Set the demo payment mode (useful for testing failure scenarios)
  public func setPaymentMode(mode : OrderTypes.PaymentMode) : async { #ok } {
    config.paymentMode := mode;
    #ok;
  };
};
