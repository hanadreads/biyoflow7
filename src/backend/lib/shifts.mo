// Domain logic for BiyoFlow shift management
import ShiftTypes "../types/shifts";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  public type Shift         = ShiftTypes.Shift;
  public type ShiftPeriod   = ShiftTypes.ShiftPeriod;
  public type ShiftStatus   = ShiftTypes.ShiftStatus;
  public type PaymentResult = ShiftTypes.PaymentResult;

  // Uppercase alphanumeric alphabet — excludes visually ambiguous chars (0, 1, I, O)
  let ALPHABET : [Char] = [
    'A','B','C','D','E','F','G','H','J','K',
    'L','M','N','P','Q','R','S','T','U','V',
    'W','X','Y','Z','2','3','4','5','6','7',
    '8','9'
  ];
  let ALPHA_LEN : Nat = 32;

  /// Deterministic 8-char uppercase alphanumeric Z-number derived from two Nat seeds.
  public func generateZNumber(seed : Nat, shiftId : Nat) : Text {
    var n = (seed * 6364136223846793005 + shiftId * 1442695040888963407 + 1) % 2147483648;
    var result = "";
    var i = 0;
    while (i < 8) {
      n := (n * 1103515245 + 12345) % 2147483648;
      let idx = (n + i * 7919) % ALPHA_LEN;
      result := result # Text.fromChar(ALPHABET[idx]);
      i += 1;
    };
    result;
  };

  /// ZAAD-style payment reference: "ZAAD" + 10 digits.
  public func generatePaymentRef(seed : Nat, shiftId : Nat) : Text {
    var n = (seed * 2862933555777941757 + shiftId * 3202034522624059733 + 999) % 1073741824;
    var digits = "";
    var i = 0;
    while (i < 10) {
      n := (n * 22695477 + 1) % 1073741824;
      let d = (n + i * 31) % 10;
      digits := digits # d.toText();
      i += 1;
    };
    "ZAAD" # digits;
  };

  /// Create a new Shift in #pending_payment status.
  public func createShift(
    id       : Nat,
    driverId : Nat,
    period   : ShiftPeriod,
    date     : Text,
  ) : Shift {
    {
      id;
      driverId;
      period;
      date;
      status      = #pending_payment;
      feePaidAt   = null;
      paymentRef  = null;
      zNumber     = null;
      verifiedAt  = null;
      activatedAt = null;
    };
  };

  /// Simulate ZAAD $1 payment: assign paymentRef + Z-number, advance to pending_verification.
  public func applyPayment(
    self : Shift,
    now  : Int,
    seed : Nat,
  ) : (Shift, PaymentResult) {
    let zNum = generateZNumber(seed, self.id);
    let pRef = generatePaymentRef(seed, self.id);
    let updated = { self with
      status     = #pending_verification;
      feePaidAt  = ?now;
      paymentRef = ?pRef;
      zNumber    = ?zNum;
    };
    (updated, { zNumber = zNum; paymentRef = pRef });
  };

  /// Verify submitted Z-number, activate shift on match.
  public func activateWithZNumber(
    self    : Shift,
    zNumber : Text,
    now     : Int,
  ) : { #ok : Shift; #err : Text } {
    switch (self.zNumber) {
      case null { #err("No Z-number on record for this shift") };
      case (?stored) {
        if (stored == zNumber) {
          #ok({ self with
            status      = #active;
            verifiedAt  = ?now;
            activatedAt = ?now;
          });
        } else {
          #err("Z-number does not match");
        };
      };
    };
  };

  /// Returns (startNs, endNs) for the 12-hour window of this period.
  /// Morning: 06:00–18:00 UTC, Evening: 18:00–06:00+1d.
  public func getShiftWindow(period : ShiftPeriod, _dateText : Text) : (Int, Int) {
    let nsPerHour : Int = 3_600_000_000_000;
    let nsPerDay  : Int = 86_400_000_000_000;
    let now       = Time.now();
    let dayStart  = (now / nsPerDay) * nsPerDay;
    switch (period) {
      case (#morning) { (dayStart + 6 * nsPerHour,  dayStart + 18 * nsPerHour) };
      case (#evening) { (dayStart + 18 * nsPerHour, dayStart + 30 * nsPerHour) };
    };
  };

  /// Returns true when shift is #active and the current time is within its 12-hour window.
  public func isCurrentlyActive(self : Shift, now : Int) : Bool {
    if (self.status != #active) { return false };
    let (winStart, winEnd) = getShiftWindow(self.period, self.date);
    now >= winStart and now <= winEnd;
  };

  /// Replace a shift in-place by id (noop if not found).
  public func replaceShift(
    shifts  : List.List<Shift>,
    updated : Shift,
  ) {
    shifts.mapInPlace(func(s) {
      if (s.id == updated.id) { updated } else { s };
    });
  };
};
