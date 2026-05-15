// Orders domain logic — creation, payment simulation, matching, and status progression
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import OrderTypes "../types/orders";
import DriverTypes "../types/drivers";
import Text "mo:core/Text";
import Array "mo:core/Array";

module {
  public type Order            = OrderTypes.Order;
  public type OrderStatus      = OrderTypes.OrderStatus;
  public type TankSize         = OrderTypes.TankSize;
  public type PaymentStatus    = OrderTypes.PaymentStatus;
  public type OrderStatusEntry = OrderTypes.OrderStatusEntry;
  public type AuditLog         = OrderTypes.AuditLog;
  public type PaymentMode      = OrderTypes.PaymentMode;

  // ── Audit helpers ─────────────────────────────────────────────────────

  // Append a row to order_status_history
  public func addStatusHistory(
    statusHistory : List.List<OrderStatusEntry>,
    counters      : { var nextHistoryId : Nat },
    order_id      : Nat,
    status        : OrderStatus,
    initiated_by  : Text,
    note          : Text,
  ) : () {
    statusHistory.add({
      id           = counters.nextHistoryId;
      order_id     = order_id;
      status       = status;
      initiated_by = initiated_by;
      note         = note;
      created_at   = Time.now();
    });
    counters.nextHistoryId += 1;
  };

  // Append a row to audit_logs
  public func addAuditLog(
    auditLogs    : List.List<AuditLog>,
    counters     : { var nextAuditId : Nat },
    entity_type  : Text,
    entity_id    : Nat,
    action       : Text,
    initiated_by : Text,
    details_json : Text,
  ) : () {
    auditLogs.add({
      id           = counters.nextAuditId;
      entity_type  = entity_type;
      entity_id    = entity_id;
      action       = action;
      initiated_by = initiated_by;
      details_json = details_json;
      created_at   = Time.now();
    });
    counters.nextAuditId += 1;
  };

  // ── Order creation ────────────────────────────────────────────────────

  // Create a new order; idempotency_key prevents duplicate submissions.
  // Returns order_id + an opaque payment_ref for the ZAAD simulation step.
  public func createOrder(
    orders          : List.List<Order>,
    statusHistory   : List.List<OrderStatusEntry>,
    auditLogs       : List.List<AuditLog>,
    counters        : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat },
    zone_id         : Nat,
    size            : TankSize,
    customer_phone  : Text,
    address_note    : Text,
    idempotency_key : Text,
  ) : { #ok : { order_id : Nat; payment_ref : Text }; #err : Text } {
    // Idempotency: if a matching key already exists, return the existing order
    switch (orders.find(func(o) { o.idempotency_key == idempotency_key })) {
      case (?existing) {
        return #ok { order_id = existing.id; payment_ref = existing.payment_ref };
      };
      case null {};
    };

    let now       = Time.now();
    let order_id  = counters.nextOrderId;
    // payment_ref is a simple unique token for the ZAAD simulation
    let payment_ref = "PAY-" # order_id.toText() # "-" # now.toText();

    orders.add({
      id              = order_id;
      zone_id         = zone_id;
      driver_id       = null;
      customer_phone  = customer_phone;
      size            = size;
      address_note    = address_note;
      status          = #pending;
      payment_status  = #pending;
      payment_ref     = payment_ref;
      idempotency_key = idempotency_key;
      created_at      = now;
      matched_at      = null;
      completed_at    = null;
      expired_at      = null;
      help_flagged    = false;
    });
    counters.nextOrderId += 1;

    addStatusHistory(statusHistory, counters, order_id, #pending, "customer", "Order created");
    addAuditLog(auditLogs, counters, "order", order_id, "order_created", "customer",
      "{\"zone_id\":\"" # zone_id.toText() # "\"}");

    #ok { order_id; payment_ref };
  };

  // ── Payment simulation ────────────────────────────────────────────────

  // Simulate a ZAAD payment. Idempotent — returns the same result if already processed.
  // On success: triggers zone-based driver matching.
  public func processPayment(
    orders        : List.List<Order>,
    drivers       : List.List<DriverTypes.Driver>,
    driverPrices  : Map.Map<Nat, DriverTypes.DriverPrices>,
    statusHistory : List.List<OrderStatusEntry>,
    auditLogs     : List.List<AuditLog>,
    counters      : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat },
    config        : { var paymentMode : PaymentMode },
    order_id      : Nat,
    _idempotency_key : Text,
  ) : { #ok : { status : PaymentStatus; payment_ref : Text }; #err : Text } {
    // Find the order
    let idx = switch (orders.findIndex(func(o) { o.id == order_id })) {
      case null { return #err "Order not found" };
      case (?i) i;
    };
    let order = orders.at(idx);

    // Idempotency: if payment already processed, return existing result
    if (order.payment_status == #success) {
      return #ok { status = #success; payment_ref = order.payment_ref };
    };
    if (order.payment_status == #failed) {
      return #ok { status = #failed; payment_ref = order.payment_ref };
    };

    // Determine payment outcome from demo config
    let success : Bool = switch (config.paymentMode) {
      case (#always_success) true;
      case (#always_fail)    false;
      // Pseudo-random: use order_id parity as a simple deterministic toggle
      case (#random)         (order_id % 2 == 0);
    };

    if (success) {
      orders.put(idx, { order with payment_status = #success });
      addStatusHistory(statusHistory, counters, order_id, #pending, "system", "Payment confirmed");
      addAuditLog(auditLogs, counters, "order", order_id, "payment_success", "system",
        "{\"payment_ref\":\"" # order.payment_ref # "\"}");

      // Run expiry housekeeping then attempt driver match
      expirePendingOrders(orders, statusHistory, auditLogs, counters);
      matchOrder(orders, drivers, driverPrices, statusHistory, auditLogs, counters, order_id);

      #ok { status = #success; payment_ref = order.payment_ref };
    } else {
      orders.put(idx, { order with payment_status = #failed });
      addStatusHistory(statusHistory, counters, order_id, #pending, "system", "Payment failed");
      addAuditLog(auditLogs, counters, "order", order_id, "payment_failed", "system",
        "{\"payment_ref\":\"" # order.payment_ref # "\"}");
      #ok { status = #failed; payment_ref = order.payment_ref };
    };
  };

  // ── Order lookup ──────────────────────────────────────────────────────

  // Fetch an order by id, verified with last 4 digits of customer phone.
  // Returns null if not found or phone does not match.
  public func getOrder(
    orders     : List.List<Order>,
    order_id   : Nat,
    phone_last4 : Text,
  ) : ?Order {
    switch (orders.find(func(o) { o.id == order_id })) {
      case null null;
      case (?o) {
        // Extract last 4 chars of stored phone for verification
        let phone = o.customer_phone;
        let len   = phone.size();
        let last4 = if (len >= 4) {
          // slice last 4 chars using Int arithmetic to avoid Nat underflow trap
          let chars = phone.toArray();
          let from  = (len : Int) - 4;
          Text.fromArray(chars.sliceToArray(from, len))
        } else { phone };
        if (last4 == phone_last4) ?o else null;
      };
    };
  };

  // ── Zone matching ─────────────────────────────────────────────────────

  // Match a paid pending order to the first available online driver in the zone.
  //
  // Race-condition protection: the IC executes each message atomically, so a
  // single update call that reads then writes driver.current_order_id is safe
  // — no concurrent messages can interleave. First-write-wins is therefore
  // implicit in the sequential execution model of the IC actor.
  //
  // If no driver is available the order remains #pending and will be matched
  // on the next incoming-orders poll or on the next processPayment call.
  public func matchOrder(
    orders        : List.List<Order>,
    drivers       : List.List<DriverTypes.Driver>,
    _driverPrices  : Map.Map<Nat, DriverTypes.DriverPrices>,
    statusHistory : List.List<OrderStatusEntry>,
    auditLogs     : List.List<AuditLog>,
    counters      : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat },
    order_id      : Nat,
  ) : () {
    let orderIdx = switch (orders.findIndex(func(o) { o.id == order_id })) {
      case null return;
      case (?i) i;
    };
    let order = orders.at(orderIdx);

    // Only match if the order is paid and still pending (not already matched)
    if (order.payment_status != #success or order.status != #pending) return;

    // Find the first online driver in this zone with no active order
    let driverIdx = drivers.findIndex(
      func(d) {
        d.zone_id == order.zone_id and
        d.status  == #online and
        d.current_order_id == null
      }
    );

    switch (driverIdx) {
      case null {}; // No available driver — order stays pending
      case (?dIdx) {
        let driver = drivers.at(dIdx);
        let now    = Time.now();

        // Atomically reserve this driver by setting current_order_id
        drivers.put(dIdx, { driver with current_order_id = ?order_id });

        // Update the order to matched state
        orders.put(orderIdx, {
          order with
          status     = #matched;
          driver_id  = ?driver.id;
          matched_at = ?now;
        });

        addStatusHistory(statusHistory, counters, order_id, #matched, "system",
          "Matched to driver " # driver.id.toText());
        addAuditLog(auditLogs, counters, "order", order_id, "matched", "system",
          "{\"driver_id\":\"" # driver.id.toText() # "\"}");
      };
    };
  };

  // ── Accept / reject ───────────────────────────────────────────────────

  // Driver accepts a matched order — moves order to #accepted.
  // Atomic check: verify order is still in #matched state before accepting
  // to prevent double-accept in case of retries.
  public func acceptOrder(
    orders        : List.List<Order>,
    _drivers       : List.List<DriverTypes.Driver>,
    statusHistory : List.List<OrderStatusEntry>,
    auditLogs     : List.List<AuditLog>,
    counters      : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat },
    driver_id     : Nat,
    order_id      : Nat,
  ) : { #ok; #err : Text } {
    let orderIdx = switch (orders.findIndex(func(o) { o.id == order_id })) {
      case null return #err "Order not found";
      case (?i) i;
    };
    let order = orders.at(orderIdx);

    // Guard: order must still be in matched state (prevent double-accept)
    if (order.status != #matched) {
      return #err "Order is not in matched state";
    };
    // Guard: this driver must be the assigned one
    if (order.driver_id != ?driver_id) {
      return #err "Order not assigned to this driver";
    };

    orders.put(orderIdx, { order with status = #accepted });

    addStatusHistory(statusHistory, counters, order_id, #accepted, "driver", "Driver accepted");
    addAuditLog(auditLogs, counters, "order", order_id, "driver_accepted", "driver",
      "{\"driver_id\":\"" # driver_id.toText() # "\"}");
    #ok;
  };

  // Driver rejects a matched order. Clears the driver assignment and resets the
  // order to #pending, then immediately tries to match a different driver.
  public func rejectOrder(
    orders        : List.List<Order>,
    drivers       : List.List<DriverTypes.Driver>,
    driverPrices  : Map.Map<Nat, DriverTypes.DriverPrices>,
    statusHistory : List.List<OrderStatusEntry>,
    auditLogs     : List.List<AuditLog>,
    counters      : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat },
    driver_id     : Nat,
    order_id      : Nat,
  ) : { #ok; #err : Text } {
    let orderIdx = switch (orders.findIndex(func(o) { o.id == order_id })) {
      case null return #err "Order not found";
      case (?i) i;
    };
    let order = orders.at(orderIdx);

    if (order.status != #matched) {
      return #err "Order is not in matched state";
    };
    if (order.driver_id != ?driver_id) {
      return #err "Order not assigned to this driver";
    };

    // Free the driver so they can receive other orders
    switch (drivers.findIndex(func(d) { d.id == driver_id })) {
      case null {};
      case (?dIdx) {
        let d = drivers.at(dIdx);
        drivers.put(dIdx, { d with current_order_id = null });
      };
    };

    // Reset order to pending for re-matching
    orders.put(orderIdx, { order with status = #pending; driver_id = null; matched_at = null });

    addStatusHistory(statusHistory, counters, order_id, #pending, "driver", "Driver rejected — re-queuing");
    addAuditLog(auditLogs, counters, "order", order_id, "driver_rejected", "driver",
      "{\"driver_id\":\"" # driver_id.toText() # "\"}");

    // Immediately try to match another driver
    matchOrder(orders, drivers, driverPrices, statusHistory, auditLogs, counters, order_id);
    #ok;
  };

  // ── Delivery progression ──────────────────────────────────────────────

  // Advance delivery status along the strict sequence:
  //   accepted → en_route → pumping → completed
  // Any other transition is rejected.
  public func updateOrderStatus(
    orders        : List.List<Order>,
    drivers       : List.List<DriverTypes.Driver>,
    statusHistory : List.List<OrderStatusEntry>,
    auditLogs     : List.List<AuditLog>,
    counters      : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat },
    driver_id     : Nat,
    order_id      : Nat,
    new_status    : OrderStatus,
  ) : { #ok; #err : Text } {
    let orderIdx = switch (orders.findIndex(func(o) { o.id == order_id })) {
      case null return #err "Order not found";
      case (?i) i;
    };
    let order = orders.at(orderIdx);

    if (order.driver_id != ?driver_id) {
      return #err "Order not assigned to this driver";
    };

    // Validate strict forward sequence
    let validTransition = switch (order.status, new_status) {
      case (#accepted, #en_route) true;
      case (#en_route, #pumping)  true;
      case (#pumping,  #completed) true;
      case _ false;
    };
    if (not validTransition) {
      return #err "Invalid status transition";
    };

    let now = Time.now();
    let updated = if (new_status == #completed) {
      { order with status = new_status; completed_at = ?now }
    } else {
      { order with status = new_status }
    };
    orders.put(orderIdx, updated);

    // On completion: free the driver for new orders
    if (new_status == #completed) {
      switch (drivers.findIndex(func(d) { d.id == driver_id })) {
        case null {};
        case (?dIdx) {
          let d = drivers.at(dIdx);
          drivers.put(dIdx, { d with current_order_id = null });
        };
      };
    };

    // Map status to audit action name
    let action = switch (new_status) {
      case (#en_route)  "en_route";
      case (#pumping)   "pumping";
      case (#completed) "completed";
      case _            "status_update";
    };

    addStatusHistory(statusHistory, counters, order_id, new_status, "driver", action);
    addAuditLog(auditLogs, counters, "order", order_id, action, "driver",
      "{\"driver_id\":\"" # driver_id.toText() # "\"}");
    #ok;
  };

  // ── Exception handling ────────────────────────────────────────────────

  // Move an active order to #exception when driver goes offline mid-delivery.
  // Sets help_flagged = true so ops team can follow up.
  public func markException(
    orders        : List.List<Order>,
    statusHistory : List.List<OrderStatusEntry>,
    auditLogs     : List.List<AuditLog>,
    counters      : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat },
    order_id      : Nat,
  ) : () {
    switch (orders.findIndex(func(o) { o.id == order_id })) {
      case null {};
      case (?idx) {
        let order = orders.at(idx);
        orders.put(idx, { order with status = #exception; help_flagged = true });
        addStatusHistory(statusHistory, counters, order_id, #exception, "system",
          "Driver went offline mid-delivery");
        addAuditLog(auditLogs, counters, "order", order_id, "exception", "system",
          "{\"reason\":\"driver_offline\"}");
      };
    };
  };

  // ── Driver order queries ──────────────────────────────────────────────

  // Return all orders currently matched to this driver and awaiting acceptance
  public func getIncomingOrders(
    orders    : List.List<Order>,
    driver_id : Nat,
  ) : [Order] {
    orders.filter(func(o) {
      o.driver_id == ?driver_id and o.status == #matched
    }).toArray();
  };

  // ── Earnings ──────────────────────────────────────────────────────────

  // Earnings summary: today's total, optional date-range total, and order list.
  // Prices are looked up from driver_prices (falls back to 0 if missing).
  public func getDriverEarnings(
    orders       : List.List<Order>,
    driverPrices : Map.Map<Nat, DriverTypes.DriverPrices>,
    driver_id    : Nat,
    start_ns     : ?Int,
    end_ns       : ?Int,
  ) : { today_total : Nat; period_total : Nat; orders : [Order] } {
    // All completed orders for this driver
    let completed = orders.filter(func(o) {
      o.driver_id == ?driver_id and o.status == #completed
    });

    // Price lookup helper
    let prices = switch (driverPrices.get(driver_id)) {
      case (?p) p;
      case null { { small = 0; medium = 0; large = 0 } };
    };
    let priceForOrder = func(o : Order) : Nat {
      switch (o.size) {
        case (#small)  prices.small;
        case (#medium) prices.medium;
        case (#large)  prices.large;
      };
    };

    // Today: from midnight of the current day in nanoseconds
    let now       = Time.now();
    let ns_per_day : Int = 86_400_000_000_000; // 24h in nanoseconds
    let day_start : Int = now - (now % ns_per_day);

    let today_total = completed.foldLeft(0 : Nat, func(acc : Nat, o : Order) : Nat {
      let comp_at = switch (o.completed_at) { case (?t) t; case null 0 };
      if (comp_at >= (day_start : Int)) acc + priceForOrder(o) else acc
    });

    // Period total (if date range given, both bounds in nanoseconds)
    let period_total = switch (start_ns, end_ns) {
      case (?s, ?e) {
        completed.foldLeft(0 : Nat, func(acc : Nat, o : Order) : Nat {
          let comp_at = switch (o.completed_at) { case (?t) t; case null 0 };
          if (comp_at >= s and comp_at <= e) acc + priceForOrder(o) else acc
        });
      };
      case _ today_total; // default: same as today
    };

    { today_total; period_total; orders = completed.toArray() };
  };

  // Full order history for a driver (all terminal states)
  public func getDriverHistory(
    orders    : List.List<Order>,
    driver_id : Nat,
  ) : [Order] {
    orders.filter(func(o) {
      o.driver_id == ?driver_id and (
        o.status == #completed or
        o.status == #cancelled or
        o.status == #exception
      )
    }).toArray();
  };

  // ── Expiry housekeeping ───────────────────────────────────────────────

  // Expire orders that have been pending for > 15 minutes without a driver match.
  // Called on each payment + each incoming-orders poll to keep state fresh.
  public func expirePendingOrders(
    orders        : List.List<Order>,
    statusHistory : List.List<OrderStatusEntry>,
    auditLogs     : List.List<AuditLog>,
    counters      : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat },
  ) : () {
    let now           = Time.now();
    let timeout_ns    : Int = 15 * 60 * 1_000_000_000; // 15 minutes in nanoseconds

    // Iterate by index so we can update in place
    orders.forEachEntry(func(idx, order) {
      if (order.status == #pending and (now - order.created_at) > timeout_ns) {
        orders.put(idx, { order with status = #expired; expired_at = ?now });
        addStatusHistory(statusHistory, counters, order.id, #expired, "system", "Pending timeout");
        addAuditLog(auditLogs, counters, "order", order.id, "expired", "system",
          "{\"reason\":\"no_driver_found\"}");
      };
    });
  };

  // ── Demo reset ────────────────────────────────────────────────────────

  // Wipe all orders, history, and audit logs — called from resetDemo in admin-api
  public func resetOrders(
    orders        : List.List<Order>,
    statusHistory : List.List<OrderStatusEntry>,
    auditLogs     : List.List<AuditLog>,
    counters      : { var nextOrderId : Nat; var nextHistoryId : Nat; var nextAuditId : Nat },
  ) : () {
    orders.clear();
    statusHistory.clear();
    auditLogs.clear();
    counters.nextOrderId   := 1;
    counters.nextHistoryId := 1;
    counters.nextAuditId   := 1;
  };
};
