// Public shift-management API mixin for BiyoFlow
import List "mo:core/List";
import Time "mo:core/Time";
import ShiftTypes "../types/shifts";
import ShiftLib   "../lib/shifts";

mixin (
  shifts        : List.List<ShiftTypes.Shift>,
  shiftCounters : { var nextShiftId : Nat; var shiftSeed : Nat },
) {
  /// Create a new shift in #pending_payment status for the given driver.
  /// Idempotent: returns the existing shift if one already exists for the same
  /// driver / period / date in a non-terminal state.
  public func requestShift(
    driverId : Nat,
    period   : ShiftTypes.ShiftPeriod,
    date     : Text,
  ) : async { #ok : ShiftTypes.Shift; #err : Text } {
    let existing = shifts.find(func(s) {
      s.driverId == driverId and s.period == period and s.date == date
        and (s.status == #pending_payment or s.status == #pending_verification or s.status == #active)
    });
    switch (existing) {
      case (?s) { #ok(s) };
      case null {
        let id = shiftCounters.nextShiftId;
        shiftCounters.nextShiftId += 1;
        let shift = ShiftLib.createShift(id, driverId, period, date);
        shifts.add(shift);
        #ok(shift);
      };
    };
  };

  /// Simulate ZAAD $1 fee payment; generates Z-number for driver to submit.
  public func payShiftFee(
    shiftId : Nat,
  ) : async { #ok : ShiftTypes.PaymentResult; #err : Text } {
    switch (shifts.find(func(s) { s.id == shiftId })) {
      case null { #err("Shift not found") };
      case (?s) {
        if (s.status != #pending_payment) {
          return #err("Shift is not awaiting payment");
        };
        let now = Time.now();
        shiftCounters.shiftSeed += 1;
        let (updated, result) = s.applyPayment(now, shiftCounters.shiftSeed);
        ShiftLib.replaceShift(shifts, updated);
        #ok(result);
      };
    };
  };

  /// Driver submits the Z-number from their ZAAD confirmation SMS to activate the shift.
  public func submitZNumber(
    shiftId : Nat,
    zNumber : Text,
  ) : async { #ok : ShiftTypes.Shift; #err : Text } {
    switch (shifts.find(func(s) { s.id == shiftId })) {
      case null { #err("Shift not found") };
      case (?s) {
        if (s.status != #pending_verification) {
          return #err("Shift is not awaiting Z-number verification");
        };
        switch (s.activateWithZNumber(zNumber, Time.now())) {
          case (#ok(activated)) {
            ShiftLib.replaceShift(shifts, activated);
            #ok(activated);
          };
          case (#err(msg)) { #err(msg) };
        };
      };
    };
  };

  /// Returns the driver's currently active (within time window) shift, if any.
  public query func getActiveShift(driverId : Nat) : async ?ShiftTypes.Shift {
    let now = Time.now();
    shifts.find(func(s) {
      s.driverId == driverId and s.isCurrentlyActive(now)
    });
  };

  /// Returns all shift records for a driver (full history).
  public query func getDriverShifts(driverId : Nat) : async [ShiftTypes.Shift] {
    shifts.filter(func(s) { s.driverId == driverId }).toArray();
  };
};
