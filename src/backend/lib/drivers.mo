// Drivers domain logic — authentication, status, pricing, zone switching
import List "mo:core/List";
import Map "mo:core/Map";
import DriverTypes "../types/drivers";
import OrderTypes "../types/orders";

module {
  public type Driver       = DriverTypes.Driver;
  public type DriverPrices = DriverTypes.DriverPrices;
  public type DriverStatus = DriverTypes.DriverStatus;

  // Seed data: (zone_id, name, phone, pin, truck_plate, small, medium, large)
  // zone_id 1=Kood-Buur ... 10=Shacabka (matches seedZones order)
  let SEED_DRIVERS : [(Nat, Text, Text, Text, Text, Nat, Nat, Nat)] = [
    // Kood-Buur
    (1, "Cabdi Xasan",         "6301001", "1234", "HR-1001", 14000, 24000, 38000),
    (1, "Maxamed Faarax",      "6501002", "5678", "HR-1002", 15000, 25000, 40000),
    (1, "Hodan Warsame",       "6101003", "2468", "HR-1003", 13000, 23000, 37000),
    // Ahmed Dhagax
    (2, "Saciid Yuusuf",       "6302001", "1357", "HR-2001", 15000, 26000, 41000),
    (2, "Asad Jamac",          "6502002", "9012", "HR-2002", 14000, 24000, 39000),
    // Ibrahim Kod
    (3, "Xuseen Ibraahim",     "6303001", "3456", "HR-3001", 13000, 22000, 37000),
    (3, "Luul Axmed",          "6103002", "7890", "HR-3002", 15000, 25000, 40000),
    (3, "Naciim Deeq",         "6503003", "2345", "HR-3003", 14000, 23000, 39000),
    // Boodhair
    (4, "Faadumo Cali",        "6104001", "6789", "HR-4001", 16000, 27000, 42000),
    (4, "Cabdullahi Omar",     "6304002", "1122", "HR-4002", 15000, 25000, 40000),
    // Mahabot
    (5, "Bile Xasan",          "6505001", "3344", "HR-5001", 14000, 24000, 38000),
    (5, "Warsan Nuur",         "6105002", "5566", "HR-5002", 13000, 22000, 37000),
    (5, "Jaamac Muuse",        "6305003", "7788", "HR-5003", 15000, 26000, 41000),
    // Daami
    (6, "Qorshe Dirie",        "6506001", "9900", "HR-6001", 17000, 28000, 43000),
    (6, "Aamina Sharif",       "6106002", "1212", "HR-6002", 16000, 27000, 42000),
    // Gabiley Road
    (7, "Cabdulqaadir Saalax", "6307001", "3434", "HR-7001", 14000, 23000, 38000),
    (7, "Raqiya Abdi",         "6107002", "5656", "HR-7002", 13000, 22000, 37000),
    (7, "Mustafe Ducaale",     "6507003", "7878", "HR-7003", 15000, 25000, 40000),
    // Arabsiyo Road
    (8, "Sharafdin Aw-Cali",   "6308001", "2143", "HR-8001", 16000, 27000, 42000),
    (8, "Ubax Gadhle",         "6108002", "6543", "HR-8002", 14000, 24000, 39000),
    // Xamar Haato
    (9, "Deeqa Muhumed",       "6109001", "8765", "HR-9001", 15000, 25000, 40000),
    (9, "Abubakar Xirsi",      "6309002", "4321", "HR-9002", 14000, 23000, 38000),
    (9, "Timiro Aadan",        "6509003", "1111", "HR-9003", 13000, 22000, 37000),
    // Shacabka
    (10, "Guuleed Suldaan",    "6510001", "2222", "HR-A001", 16000, 27000, 42000),
    (10, "Falis Yuusuf",       "6110002", "3333", "HR-A002", 15000, 25000, 40000),
  ];

  // Authenticate driver by phone + PIN; returns driver_id + name on success
  public func login(
    drivers : List.List<Driver>,
    phone   : Text,
    pin     : Text,
  ) : { #ok : { driver_id : Nat; name : Text }; #err : Text } {
    switch (drivers.find(func(d) { d.phone == phone })) {
      case null { #err "Phone number not found" };
      case (?d) {
        if (d.pin == pin) { #ok { driver_id = d.id; name = d.name } }
        else { #err "Incorrect PIN" };
      };
    };
  };

  // Toggle driver online/offline, updating truck plate for the shift.
  // If going offline while an active order exists, the caller (orders lib)
  // is responsible for marking that order as #exception.
  public func setStatus(
    drivers      : List.List<Driver>,
    driver_id    : Nat,
    status       : DriverStatus,
    truck_plate  : Text,
  ) : { #ok; #err : Text } {
    switch (drivers.findIndex(func(d) { d.id == driver_id })) {
      case null { #err "Driver not found" };
      case (?idx) {
        let d = drivers.at(idx);
        drivers.put(idx, { d with status = status; truck_plate = truck_plate });
        #ok;
      };
    };
  };

  // Switch the zone the driver serves during an active shift
  public func setZone(
    drivers   : List.List<Driver>,
    driver_id : Nat,
    zone_id   : Nat,
  ) : { #ok; #err : Text } {
    switch (drivers.findIndex(func(d) { d.id == driver_id })) {
      case null { #err "Driver not found" };
      case (?idx) {
        let d = drivers.at(idx);
        drivers.put(idx, { d with zone_id = zone_id });
        #ok;
      };
    };
  };

  // Update small/medium/large prices for a driver
  public func setPrices(
    driverPrices : Map.Map<Nat, DriverPrices>,
    driver_id    : Nat,
    prices       : DriverPrices,
  ) : { #ok; #err : Text } {
    driverPrices.add(driver_id, prices);
    #ok;
  };

  // Return driver profile + current prices; null if driver_id not found
  public func getProfile(
    drivers      : List.List<Driver>,
    driverPrices : Map.Map<Nat, DriverPrices>,
    driver_id    : Nat,
  ) : ?{ driver : Driver; prices : DriverPrices } {
    switch (drivers.find(func(d) { d.id == driver_id })) {
      case null null;
      case (?d) {
        // Default prices if not explicitly set yet
        let prices = switch (driverPrices.get(driver_id)) {
          case (?p) p;
          case null { { small = 15000; medium = 25000; large = 40000 } };
        };
        ?{ driver = d; prices = prices };
      };
    };
  };

  // Seed drivers from initial data — called once on resetDemo.
  // Clears existing drivers and prices, then re-inserts all seed records.
  public func seedDrivers(
    drivers      : List.List<Driver>,
    driverPrices : Map.Map<Nat, DriverPrices>,
    counters     : { var nextDriverId : Nat },
  ) : () {
    drivers.clear();
    driverPrices.clear();
    counters.nextDriverId := 1;
    for ((zone_id, name, phone, pin, plate, sm, md, lg) in SEED_DRIVERS.values()) {
      let id = counters.nextDriverId;
      drivers.add({
        id               = id;
        zone_id          = zone_id;
        name             = name;
        phone            = phone;
        pin              = pin;
        truck_plate      = plate;
        status           = #offline;
        current_order_id = null;
      });
      driverPrices.add(id, { small = sm; medium = md; large = lg });
      counters.nextDriverId += 1;
    };
  };
};
