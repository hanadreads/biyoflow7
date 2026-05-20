// Customer (RC — Residential Customer) type definitions
module {
  public type Customer = {
    id         : Nat;
    name       : Text;
    phone      : Text;
    pin        : Text;   // plain-text 4-digit PIN for MVP
    email      : ?Text;
    created_at : Int;    // nanoseconds
  };
};
