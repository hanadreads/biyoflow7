// Customers domain logic — registration, authentication, profile access
import List "mo:core/List";
import Time "mo:core/Time";
import CustomerTypes "../types/customers";

module {
  public type Customer = CustomerTypes.Customer;

  // Seed test customer: phone "06XTEST01", PIN "1234"
  public func seedCustomers(
    customers : List.List<Customer>,
    counters  : { var nextCustomerId : Nat },
  ) : () {
    customers.add({
      id         = counters.nextCustomerId;
      name       = "Faadumo Test";
      phone      = "06XTEST01";
      pin        = "1234";
      email      = null;
      created_at = Time.now();
    });
    counters.nextCustomerId += 1;
  };

  // Register a new customer.
  // Validates: phone unique, PIN exactly 4 digits, name non-empty.
  public func register(
    customers : List.List<Customer>,
    counters  : { var nextCustomerId : Nat },
    name      : Text,
    phone     : Text,
    pin       : Text,
    email     : ?Text,
  ) : { #ok : Customer; #err : Text } {
    if (name.size() == 0) { return #err "Name must not be empty" };
    if (pin.size() != 4)  { return #err "PIN must be exactly 4 digits" };

    // Verify all PIN characters are digits
    for (c in pin.chars()) {
      if (c < '0' or c > '9') { return #err "PIN must contain only digits" };
    };

    // Phone uniqueness check
    switch (customers.find(func(c) { c.phone == phone })) {
      case (?_) { return #err "Phone number already registered" };
      case null {};
    };

    let customer : Customer = {
      id         = counters.nextCustomerId;
      name       = name;
      phone      = phone;
      pin        = pin;
      email      = email;
      created_at = Time.now();
    };
    customers.add(customer);
    counters.nextCustomerId += 1;
    #ok customer;
  };

  // Authenticate a customer by phone + PIN.
  public func login(
    customers : List.List<Customer>,
    phone     : Text,
    pin       : Text,
  ) : { #ok : { customerId : Nat; name : Text; phone : Text }; #err : Text } {
    switch (customers.find(func(c) { c.phone == phone })) {
      case null { #err "Phone number not found" };
      case (?c) {
        if (c.pin == pin) {
          #ok { customerId = c.id; name = c.name; phone = c.phone };
        } else {
          #err "Incorrect PIN";
        };
      };
    };
  };

  // Fetch a customer profile by id.
  public func getProfile(
    customers  : List.List<Customer>,
    customerId : Nat,
  ) : { #ok : Customer; #err : Text } {
    switch (customers.find(func(c) { c.id == customerId })) {
      case null { #err "Customer not found" };
      case (?c) { #ok c };
    };
  };
};
