// Public API mixin — Customer (RC) registration and authentication
import CustomerLib "../lib/customers";
import CustomerTypes "../types/customers";
import List "mo:core/List";

mixin (
  customers       : List.List<CustomerTypes.Customer>,
  custCounters    : { var nextCustomerId : Nat },
) {
  // Register a new Residential Customer account.
  // Validates: name non-empty, phone unique, PIN exactly 4 digits.
  public func registerCustomer(
    name  : Text,
    phone : Text,
    pin   : Text,
    email : ?Text,
  ) : async { #ok : CustomerTypes.Customer; #err : Text } {
    CustomerLib.register(customers, custCounters, name, phone, pin, email);
  };

  // Authenticate a customer and return their session identity.
  public func loginCustomer(
    phone : Text,
    pin   : Text,
  ) : async { #ok : { customerId : Nat; name : Text; phone : Text }; #err : Text } {
    CustomerLib.login(customers, phone, pin);
  };

  // Fetch a customer profile by id.
  public func getCustomerProfile(
    customerId : Nat,
  ) : async { #ok : CustomerTypes.Customer; #err : Text } {
    CustomerLib.getProfile(customers, customerId);
  };
};
