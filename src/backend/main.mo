// BiyoFlow — composition root
// Owns all actor state; delegates every public method to domain mixins.
// No business logic lives here — see lib/ and mixins/.
import List "mo:core/List";
import Map "mo:core/Map";
import ZoneTypes "types/zones";
import DriverTypes "types/drivers";
import OrderTypes "types/orders";
import ShiftTypes "types/shifts";
import ZonesApi "mixins/zones-api";
import OrdersApi "mixins/orders-api";
import DriversApi "mixins/drivers-api";
import AdminApi "mixins/admin-api";
import ShiftsApi "mixins/shifts-api";
import ZoneLib "lib/zones";
import DriverLib "lib/drivers";
import CustomerTypes "types/customers";
import CustomerLib "lib/customers";
import CustomersApi "mixins/customers-api";
import Migration "migration";



(with migration = Migration.run)
actor {
  // ── Stable state ───────────────────────────────────────────────────────
  // Enhanced orthogonal persistence — no `stable` keyword needed.

  // Core data collections
  let zones         : List.List<ZoneTypes.Zone>               = List.empty();
  let drivers       : List.List<DriverTypes.Driver>           = List.empty();
  let orders        : List.List<OrderTypes.Order>             = List.empty();
  let statusHistory : List.List<OrderTypes.OrderStatusEntry>  = List.empty();
  let auditLogs     : List.List<OrderTypes.AuditLog>          = List.empty();
  let driverPrices  : Map.Map<Nat, DriverTypes.DriverPrices>  = Map.empty();

  // Auto-increment counters — wrapped in a record so mixins can mutate them
  let counters = {
    var nextOrderId      : Nat = 1;
    var nextHistoryId    : Nat = 1;
    var nextAuditId      : Nat = 1;
    var nextDriverId     : Nat = 1;
    var nextZoneId       : Nat = 1;
  };

  // Customer (RC) state
  let customers : List.List<CustomerTypes.Customer> = List.empty();
  let custCounters = { var nextCustomerId : Nat = 1 };

  // Shift state — separate from order counters to keep concerns isolated
  let shifts : List.List<ShiftTypes.Shift> = List.empty();
  let shiftCounters = { var nextShiftId : Nat = 1; var shiftSeed : Nat = 42 };

  // Runtime demo configuration — default: always_success for smooth demos
  let config = { var paymentMode : OrderTypes.PaymentMode = #always_success };

  // ── Initial seed ───────────────────────────────────────────────────────
  // Seed zones and drivers on first install (collections are empty at this point)
  do {
    ZoneLib.seedZones(zones, counters);
    DriverLib.seedDrivers(drivers, driverPrices, counters);
    CustomerLib.seedCustomers(customers, custCounters);
  };

  // ── Mixin inclusions ───────────────────────────────────────────────────
  include ZonesApi(zones);

  include OrdersApi(
    orders,
    statusHistory,
    auditLogs,
    drivers,
    zones,
    driverPrices,
    config,
    counters,
  );

  include DriversApi(
    drivers,
    orders,
    statusHistory,
    auditLogs,
    driverPrices,
    config,
    counters,
  );

  include AdminApi(
    orders,
    statusHistory,
    auditLogs,
    drivers,
    zones,
    driverPrices,
    config,
    counters,
  );

  include ShiftsApi(shifts, shiftCounters);

  include CustomersApi(customers, custCounters);
};
