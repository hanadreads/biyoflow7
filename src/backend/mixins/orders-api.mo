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
  // Create a new water delivery order (pre-payment step).
  // customer_id is optional — pass null for unauthenticated (legacy) flow,
  // or a valid RC account id to link the order to a registered customer.
  public func createOrder(
    zone_id         : Nat,
    size            : OrderTypes.TankSize,
    customer_phone  : Text,
    address_note    : Text,
    idempotency_key : Text,
    customer_id     : ?Nat,
  ) : async { #ok : { order_id : Nat; payment_ref : Text }; #err : Text } {
    OrderLib.createOrder(
      orders, statusHistory, auditLogs, counters,
      zone_id, size, customer_phone, address_note, idempotency_key, customer_id,
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

  // Dual delivery confirmation — role must be "driver" or "customer".
  // Once both sides confirm, the order advances to #fully_completed.
  public func confirmDelivery(
    order_id : Nat,
    role     : Text,
  ) : async { #ok : Text; #err : Text } {
    let pred : OrderTypes.Order -> Bool = func(o) { o.id == order_id };
    let found = orders.find(pred);
    switch (found) {
      case null { #err("Order not found") };
      case (?order) {
        if (order.status != #completed and order.status != #fully_completed) {
          return #err("Order is not in a confirmable state");
        };
        if (order.status == #fully_completed) {
          return #ok("Already fully confirmed");
        };
        let updated : OrderTypes.Order = switch (role) {
          case "driver" {
            { order with driver_confirmed = true };
          };
          case "customer" {
            { order with customer_confirmed = true };
          };
          case _ { return #err("Role must be 'driver' or 'customer'") };
        };
        // Advance to fully_completed when both sides have confirmed
        let finalOrder : OrderTypes.Order = if (updated.driver_confirmed and updated.customer_confirmed) {
          { updated with status = #fully_completed };
        } else { updated };
        let updateFn : OrderTypes.Order -> OrderTypes.Order = func(o) {
          if (o.id == order_id) { finalOrder } else { o }
        };
        orders.mapInPlace(updateFn);
        if (finalOrder.status == #fully_completed) {
          #ok("Delivery fully confirmed by both parties");
        } else {
          #ok("Confirmation recorded — waiting for the other party");
        };
      };
    };
  };
};
