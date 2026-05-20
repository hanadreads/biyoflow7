// Driver type definitions
module {
  public type DriverStatus = { #online; #offline };

  public type DriverPrices = {
    small  : Nat; // price in Somaliland Shillings
    medium : Nat;
    large  : Nat;
  };

  public type Driver = {
    id               : Nat;
    zone_id          : Nat;          // current working zone
    allowed_zone_ids : [Nat];        // zones this driver is permitted to serve
    name             : Text;
    phone            : Text;
    pin              : Text; // plain-text 4-digit PIN for MVP
    truck_plate      : Text;
    status           : DriverStatus;
    current_order_id : ?Nat;
    is_active        : Bool;         // admin can deactivate a driver account
  };
};
