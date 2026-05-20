// Public API mixin — Admin / demo operations
import OrderLib "../lib/orders";
import DriverLib "../lib/drivers";
import ZoneLib "../lib/zones";
import OrderTypes "../types/orders";
import DriverTypes "../types/drivers";
import ZoneTypes "../types/zones";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";

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
  // ── Admin summary types ───────────────────────────────────────────────
  type OrderSummary  = { id : Nat; status : Text; zone : Text; driverName : ?Text; size : Text; createdAt : Int; customerPhone : Text };
  type DriverSummary = { id : Nat; name : Text; zone : Text; status : Text; phone : Text; activeOrderId : ?Nat };
  type ZoneSummary   = { zoneName : Text; onlineDrivers : Nat; pendingOrders : Nat; activeOrders : Nat };

  // Authenticate as admin. Returns a session token on success.
  public func adminLogin(password : Text) : async { #ok : { token : Text; role : Text }; #err : Text } {
    if (password == "BiyoAdmin2024!") {
      #ok { token = "admin-session-token-2024"; role = "admin" };
    } else {
      #err "Invalid admin credentials";
    };
  };

  // Return a summary of all orders with zone and driver name resolved.
  public query func getAllOrders() : async [OrderSummary] {
    let buf : List.List<OrderSummary> = List.empty();
    for (order in orders.values()) {
      let zoneName : Text = switch (zones.find(func(z) { z.id == order.zone_id })) {
        case (?z) z.name;
        case null "Unknown Zone";
      };
      let driverName : ?Text = switch (order.driver_id) {
        case null null;
        case (?dId) switch (drivers.find(func(d) { d.id == dId })) {
          case (?d) ?d.name;
          case null null;
        };
      };
      let sizeText : Text = switch (order.size) {
        case (#small)  "small";
        case (#medium) "medium";
        case (#large)  "large";
      };
      let statusText : Text = switch (order.status) {
        case (#pending)          "pending";
        case (#matched)          "matched";
        case (#accepted)         "accepted";
        case (#en_route)         "en_route";
        case (#pumping)          "pumping";
        case (#completed)        "completed";
        case (#fully_completed)  "fully_completed";
        case (#expired)          "expired";
        case (#cancelled)        "cancelled";
        case (#exception)        "exception";
      };
      buf.add({
        id            = order.id;
        status        = statusText;
        zone          = zoneName;
        driverName    = driverName;
        size          = sizeText;
        createdAt     = order.created_at;
        customerPhone = order.customer_phone;
      });
    };
    buf.toArray();
  };

  // Return driver status across all zones.
  public query func getDriverStatusSummary() : async [DriverSummary] {
    let buf : List.List<DriverSummary> = List.empty();
    for (d in drivers.values()) {
      let zoneName : Text = switch (zones.find(func(z) { z.id == d.zone_id })) {
        case (?z) z.name;
        case null "Unknown Zone";
      };
      let statusText : Text = switch (d.status) {
        case (#online)  "online";
        case (#offline) "offline";
      };
      buf.add({
        id            = d.id;
        name          = d.name;
        zone          = zoneName;
        status        = statusText;
        phone         = d.phone;
        activeOrderId = d.current_order_id;
      });
    };
    buf.toArray();
  };

  // Return order counts per zone (pending + active) alongside online driver counts.
  public query func getZoneSummary() : async [ZoneSummary] {
    let buf : List.List<ZoneSummary> = List.empty();
    for (zone in zones.values()) {
      let onlineDrivers = drivers.filter(func(d) { d.zone_id == zone.id and d.status == #online }).size();
      let pendingOrders = orders.filter(func(o) { o.zone_id == zone.id and o.status == #pending }).size();
      let activeOrders  = orders.filter(
        func(o) {
          o.zone_id == zone.id and (
            o.status == #matched or o.status == #accepted or
            o.status == #en_route or o.status == #pumping
          )
        }
      ).size();
      buf.add({
        zoneName      = zone.name;
        onlineDrivers = onlineDrivers;
        pendingOrders = pendingOrders;
        activeOrders  = activeOrders;
      });
    };
    buf.toArray();
  };

  // Admin: set the allowed zones for a WT driver (replaces the old zone array).
  // Optionally also updates the driver's current working zone if it's no longer allowed.
  public func setDriverZones(driver_id : Nat, zone_ids : [Nat]) : async { #ok; #err : Text } {
    DriverLib.setDriverZones(drivers, driver_id, zone_ids);
  };

  // Admin: override the status of any order.
  public func adminSetOrderStatus(order_id : Nat, new_status : OrderTypes.OrderStatus) : async { #ok; #err : Text } {
    switch (orders.findIndex(func(o) { o.id == order_id })) {
      case null { #err "Order not found" };
      case (?idx) {
        let order = orders.at(idx);
        let now = Time.now();
        let updated = if (new_status == #completed) {
          { order with status = new_status; completed_at = ?now }
        } else if (new_status == #expired) {
          { order with status = new_status; expired_at = ?now }
        } else {
          { order with status = new_status }
        };
        orders.put(idx, updated);
        OrderLib.addStatusHistory(statusHistory, counters, order_id, new_status, "admin", "Admin override");
        OrderLib.addAuditLog(auditLogs, counters, "order", order_id, "admin_status_override", "admin",
          "{\"new_status\":\"" # debug_show(new_status) # "\"}");
        #ok;
      };
    };
  };

  // Admin: activate or deactivate a driver account.
  public func adminSetDriverActive(driver_id : Nat, is_active : Bool) : async { #ok; #err : Text } {
    let result = DriverLib.adminSetDriverActive(drivers, driver_id, is_active);
    switch (result) {
      case (#ok) {
        let action = if (is_active) "driver_activated" else "driver_deactivated";
        OrderLib.addAuditLog(auditLogs, counters, "driver", driver_id, action, "admin",
          "{\"is_active\":" # (if (is_active) "true" else "false") # "}");
        #ok;
      };
      case (#err e) { #err e };
    };
  };

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
