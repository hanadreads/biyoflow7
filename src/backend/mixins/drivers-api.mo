// Public API mixin — Drivers (driver-app endpoints)
import DriverLib "../lib/drivers";
import OrderLib "../lib/orders";
import DriverTypes "../types/drivers";
import OrderTypes "../types/orders";
import List "mo:core/List";
import Map "mo:core/Map";

mixin (
  drivers       : List.List<DriverTypes.Driver>,
  orders        : List.List<OrderTypes.Order>,
  statusHistory : List.List<OrderTypes.OrderStatusEntry>,
  auditLogs     : List.List<OrderTypes.AuditLog>,
  driverPrices  : Map.Map<Nat, DriverTypes.DriverPrices>,
  config        : { var paymentMode : OrderTypes.PaymentMode },
  counters      : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat },
) {
  // Authenticate driver; returns driver_id + name
  public func driverLogin(phone : Text, pin : Text)
      : async { #ok : { driver_id : Nat; name : Text }; #err : Text } {
    DriverLib.login(drivers, phone, pin);
  };

  // Get driver profile (details + current prices); null = not found
  public query func getDriverProfile(driver_id : Nat)
      : async ?{ driver : DriverTypes.Driver; prices : DriverTypes.DriverPrices } {
    DriverLib.getProfile(drivers, driverPrices, driver_id);
  };

  // Toggle online/offline and confirm truck plate for the shift.
  // If going offline while holding an active order, that order is marked #exception.
  public func setDriverStatus(
    driver_id   : Nat,
    status      : DriverTypes.DriverStatus,
    truck_plate : Text,
  ) : async { #ok; #err : Text } {
    // Check for active order BEFORE changing status (so we can read current state)
    if (status == #offline) {
      switch (drivers.find(func(d) { d.id == driver_id })) {
        case (?d) {
          switch (d.current_order_id) {
            case (?oid) {
              // Driver going offline mid-delivery — mark order as exception
              OrderLib.markException(orders, statusHistory, auditLogs, counters, oid);
              // Free the driver from the order
              switch (drivers.findIndex(func(d2) { d2.id == driver_id })) {
                case (?idx) {
                  let dd = drivers.at(idx);
                  drivers.put(idx, { dd with current_order_id = null });
                };
                case null {};
              };
            };
            case null {};
          };
        };
        case null {};
      };
    };
    DriverLib.setStatus(drivers, driver_id, status, truck_plate);
  };

  // Switch the zone the driver is serving during an active shift
  public func setDriverZone(driver_id : Nat, zone_id : Nat) : async { #ok; #err : Text } {
    DriverLib.setZone(drivers, driver_id, zone_id);
  };

  // Update small / medium / large delivery prices
  public func setDriverPrices(
    driver_id : Nat,
    prices    : DriverTypes.DriverPrices,
  ) : async { #ok; #err : Text } {
    DriverLib.setPrices(driverPrices, driver_id, prices);
  };

  // List orders matched to this driver awaiting acceptance.
  // Also runs expiry housekeeping so stale orders are cleaned up on each poll.
  public func getIncomingOrders(driver_id : Nat) : async [OrderTypes.Order] {
    OrderLib.expirePendingOrders(orders, statusHistory, auditLogs, counters);
    OrderLib.getIncomingOrders(orders, driver_id);
  };

  // Accept a matched order; fails if order is no longer in #matched state
  public func acceptOrder(driver_id : Nat, order_id : Nat) : async { #ok; #err : Text } {
    OrderLib.acceptOrder(orders, drivers, statusHistory, auditLogs, counters, driver_id, order_id);
  };

  // Reject a matched order; triggers re-matching to next available driver
  public func rejectOrder(driver_id : Nat, order_id : Nat) : async { #ok; #err : Text } {
    OrderLib.rejectOrder(orders, drivers, driverPrices, statusHistory, auditLogs, counters, driver_id, order_id);
  };

  // Advance the active delivery through its strict status sequence
  public func updateOrderStatus(
    driver_id  : Nat,
    order_id   : Nat,
    new_status : OrderTypes.OrderStatus,
  ) : async { #ok; #err : Text } {
    OrderLib.updateOrderStatus(orders, drivers, statusHistory, auditLogs, counters, driver_id, order_id, new_status);
  };

  // Earnings: today's total, optional date-range total, and order list (in nanoseconds)
  public query func getDriverEarnings(
    driver_id : Nat,
    start_ms  : ?Int,
    end_ms    : ?Int,
  ) : async { today_total : Nat; period_total : Nat; orders : [OrderTypes.Order] } {
    OrderLib.getDriverEarnings(orders, driverPrices, driver_id, start_ms, end_ms);
  };

  // Full order history for the driver
  public query func getDriverHistory(driver_id : Nat) : async [OrderTypes.Order] {
    OrderLib.getDriverHistory(orders, driver_id);
  };
};
