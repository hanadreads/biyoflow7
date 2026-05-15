// Public API mixin — Orders (customer-facing endpoints)
import OrderLib "../lib/orders";
import OrderTypes "../types/orders";
import ZoneTypes "../types/zones";
import DriverTypes "../types/drivers";
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
  counters      : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat },
) {
  // Create a new water delivery order (pre-payment step)
  public func createOrder(
    zone_id         : Nat,
    size            : OrderTypes.TankSize,
    customer_phone  : Text,
    address_note    : Text,
    idempotency_key : Text,
  ) : async { #ok : { order_id : Nat; payment_ref : Text }; #err : Text } {
    OrderLib.createOrder(
      orders, statusHistory, auditLogs, counters,
      zone_id, size, customer_phone, address_note, idempotency_key,
    );
  };

  // Simulate ZAAD payment and trigger driver matching on success
  public func processPayment(
    order_id        : Nat,
    idempotency_key : Text,
  ) : async { #ok : { status : OrderTypes.PaymentStatus; payment_ref : Text }; #err : Text } {
    OrderLib.processPayment(
      orders, drivers, driverPrices, statusHistory, auditLogs, counters,
      config, order_id, idempotency_key,
    );
  };

  // Customer polls this to see order progress; verified with last 4 digits of phone
  public query func getOrder(order_id : Nat, phone_last4 : Text) : async ?OrderTypes.Order {
    OrderLib.getOrder(orders, order_id, phone_last4);
  };
};
