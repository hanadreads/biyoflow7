// BiyoFlow migration: backfill Driver.allowed_zone_ids and Driver.is_active
// Old Driver had: id, zone_id, name, phone, pin, truck_plate, status, current_order_id
// New Driver adds: allowed_zone_ids, is_active
import List "mo:core/List";

module {
  // Old type — copied from .old/src/backend/types/drivers.mo
  type OldDriverStatus = { #online; #offline };
  type OldDriver = {
    id               : Nat;
    zone_id          : Nat;
    name             : Text;
    phone            : Text;
    pin              : Text;
    truck_plate      : Text;
    status           : OldDriverStatus;
    current_order_id : ?Nat;
  };

  // New type — must match current types/drivers.mo Driver exactly
  type NewDriverStatus = { #online; #offline };
  type NewDriver = {
    id               : Nat;
    zone_id          : Nat;
    allowed_zone_ids : [Nat];
    name             : Text;
    phone            : Text;
    pin              : Text;
    truck_plate      : Text;
    status           : NewDriverStatus;
    current_order_id : ?Nat;
    is_active        : Bool;
  };

  // Old actor stable state shape (field names must match .old/src/backend/dist/backend.most)
  type OldActor = {
    drivers : List.List<OldDriver>;
  };

  // New actor stable state shape — only the fields we are transforming
  type NewActor = {
    drivers : List.List<NewDriver>;
  };

  public func run(old : OldActor) : NewActor {
    let drivers = old.drivers.map<OldDriver, NewDriver>(
      func(d) {
        {
          d with
          allowed_zone_ids = [d.zone_id]; // default: only their registered zone
          is_active        = true;         // default: active
        }
      }
    );
    { drivers };
  };
};
