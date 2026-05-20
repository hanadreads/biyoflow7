// Shift type definitions for BiyoFlow driver shift management
module {
  /// Morning = 6 am – 6 pm | Evening = 6 pm – 6 am
  public type ShiftPeriod = { #morning; #evening };

  /// Lifecycle of a shift activation
  public type ShiftStatus = {
    #pending_payment;    // created, awaiting ZAAD payment
    #pending_verification; // payment received, awaiting Z-number submission
    #active;             // Z-number verified, driver may take orders
    #expired;            // shift period elapsed without activation
  };

  public type Shift = {
    id            : Nat;
    driverId      : Nat;
    period        : ShiftPeriod;
    date          : Text;   // YYYY-MM-DD
    feePaidAt     : ?Int;   // nanosecond timestamp of simulated ZAAD payment
    paymentRef    : ?Text;  // simulated ZAAD reference number
    zNumber       : ?Text;  // 8-char alphanumeric code assigned after payment
    verifiedAt    : ?Int;   // nanosecond timestamp when driver submitted Z-number
    status        : ShiftStatus;
    activatedAt   : ?Int;   // nanosecond timestamp when shift became active
  };

  /// Returned by payShiftFee on success
  public type PaymentResult = {
    zNumber    : Text;
    paymentRef : Text;
  };
};
