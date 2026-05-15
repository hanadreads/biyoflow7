// Order type definitions
module {
  public type TankSize = { #small; #medium; #large };

  // Strict lifecycle — only forward transitions are valid during a delivery
  public type OrderStatus = {
    #pending;   // created, awaiting driver match
    #matched;   // driver assigned, awaiting acceptance
    #accepted;  // driver accepted, will go en-route soon
    #en_route;  // driver is driving to the customer
    #pumping;   // water is being pumped
    #completed; // delivery finished
    #expired;   // no driver found within timeout
    #cancelled; // cancelled before match
    #exception; // driver went offline mid-delivery — needs follow-up
  };

  public type PaymentStatus = { #pending; #success; #failed };

  public type Order = {
    id              : Nat;
    zone_id         : Nat;
    driver_id       : ?Nat;
    customer_phone  : Text;
    size            : TankSize;
    address_note    : Text;    // max 120 chars
    status          : OrderStatus;
    payment_status  : PaymentStatus;
    payment_ref     : Text;
    idempotency_key : Text;    // prevents duplicate order creation
    created_at      : Int;     // nanoseconds
    matched_at      : ?Int;
    completed_at    : ?Int;
    expired_at      : ?Int;
    help_flagged    : Bool;    // set true when exception state is entered
  };

  public type OrderStatusEntry = {
    id         : Nat;
    order_id   : Nat;
    status     : OrderStatus;
    initiated_by : Text;  // e.g. "customer", "driver", "system"
    note       : Text;
    created_at : Int;
  };

  public type AuditLog = {
    id           : Nat;
    entity_type  : Text; // e.g. "order", "driver"
    entity_id    : Nat;
    action       : Text; // e.g. "order_created", "payment_success"
    initiated_by : Text;
    details_json : Text;
    created_at   : Int;
  };

  // Demo/testing payment simulation mode
  public type PaymentMode = { #always_success; #always_fail; #random };
};
