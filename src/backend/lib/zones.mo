// Zones domain logic — manages the list of delivery zones
import List "mo:core/List";
import Types "../types/zones";
import Nat "mo:core/Nat";

module {
  public type Zone = Types.Zone;

  // The 10 Hargeisa delivery zones in display order
  let SEED_ZONES : [(Text, Nat)] = [
    ("Kood-Buur",     1),
    ("Ahmed Dhagax",  2),
    ("Ibrahim Kod",   3),
    ("Boodhair",      4),
    ("Mahabot",       5),
    ("Daami",         6),
    ("Gabiley Road",  7),
    ("Arabsiyo Road", 8),
    ("Xamar Haato",   9),
    ("Shacabka",      10),
  ];

  // Return all zones sorted by display_order
  public func listZones(zones : List.List<Zone>) : [Zone] {
    let arr = zones.toArray();
    // Sort by display_order ascending
    arr.sort(func(a, b) = Nat.compare(a.display_order, b.display_order))
  };

  // Seed zones from initial data — called once on resetDemo.
  // Clears existing zones then adds the 10 Hargeisa zones.
  public func seedZones(
    zones    : List.List<Zone>,
    counters : { var nextZoneId : Nat },
  ) : () {
    zones.clear();
    counters.nextZoneId := 1;
    for ((name, display_order) in SEED_ZONES.values()) {
      zones.add({
        id            = counters.nextZoneId;
        city          = "Hargeisa";
        name          = name;
        display_order = display_order;
      });
      counters.nextZoneId += 1;
    };
  };
};
