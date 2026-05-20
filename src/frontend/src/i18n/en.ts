// All English user-facing strings — single source of truth.
// Use {placeholder} syntax for interpolation via t(key, { placeholder: value }).
export const en = {
  // App / Navigation
  app_name: "BiyoFlow",
  app_tagline: "Water Delivery — Hargeisa",
  lang_toggle: "Af-Soomaali",
  customer: "Customer",
  driver: "Driver",

  // Step indicator
  step_of: "Step {current} of {total}",

  // Step 1 — Zone
  zone_title: "Select your zone",
  zone_hint: "Enter the number of your zone",
  zone_invalid: "Please enter a number between 1 and {max}",
  zone_loading: "Loading zones…",
  zone_error: "Could not load zones. Please try again.",
  zone_remembered: "Last used: {name}",

  // Step 2 — Tank size
  size_title: "Select tank size",
  size_hint: "Enter 1, 2, or 3",
  size_small: "Small — 1,000 L",
  size_medium: "Medium — 2,000 L",
  size_large: "Large — 5,000 L",
  size_invalid: "Please enter 1, 2, or 3",

  // Step 3 — Phone
  phone_title: "Enter your phone number",
  phone_placeholder: "e.g. 063 4123456",
  phone_label: "Phone number",
  phone_invalid: "Please enter a valid phone number",

  // Step 4 — Address note
  note_title: "Add delivery note (optional)",
  note_label: "Address or landmark",
  note_placeholder: "e.g. Near the blue gate, second house",
  note_hint: "{remaining} characters remaining",
  note_skip: "Skip",
  note_next: "Next",

  // Step 5 — Payment
  payment_title: "Confirm & Pay",
  payment_summary_zone: "Zone:",
  payment_summary_size: "Size:",
  payment_summary_phone: "Phone:",
  payment_confirm_btn: "Confirm & Pay via ZAAD",
  payment_processing: "Processing payment…",
  payment_failed: "Payment failed. Please try again.",
  payment_retry: "Retry Payment",

  // Step 6 — Matching
  matching_title: "Finding your driver",
  matching_searching: "Payment confirmed. Finding driver…",
  matching_driver_found: "Driver found!",
  matching_expired: "No driver available. Your order has expired.",
  matching_exception:
    "Your driver is temporarily unavailable. We're assigning a new one.",
  matching_driver_name: "Driver:",
  matching_driver_phone: "Phone:",
  matching_driver_plate: "Truck:",

  // Step 7 — Tracking
  tracking_title: "Order Tracking",
  tracking_order_id: "Order #{id}",
  tracking_elapsed: "Elapsed: {time}",
  tracking_completed: "Delivery complete! Thank you.",
  tracking_help_flagged: "An issue was flagged. Our team will follow up.",
  tracking_driver_info: "Driver Information",
  tracking_exception:
    "An issue was flagged with your delivery. Our team will follow up.",
  tracking_expired: "Your order has expired. No driver was available.",
  tracking_complete: "Delivery complete! Thank you.",

  // Order statuses
  status_pending: "Pending",
  status_matched: "Driver Matched",
  status_accepted: "Driver Accepted",
  status_en_route: "On the Way",
  status_pumping: "Pumping Water",
  status_completed: "Completed",
  status_expired: "Expired",
  status_cancelled: "Cancelled",
  status_exception: "Exception",
  status_fully_completed: "Fully Completed",

  // Driver statuses
  status_online: "Online",
  status_offline: "Offline",

  // Manual lookup
  lookup_title: "Already have an order?",
  lookup_order_id_label: "Order ID",
  lookup_order_id_placeholder: "Enter your order ID",
  lookup_phone4_label: "Last 4 digits of phone",
  lookup_phone4_placeholder: "e.g. 3456",
  lookup_btn: "Look up order",
  lookup_loading: "Looking up…",
  lookup_not_found: "No order found with those details.",
  lookup_error: "Could not look up order. Check your details.",

  // Common actions
  btn_back: "← Back",
  btn_next: "Next →",
  btn_continue: "Continue",
  btn_close: "Close",
  btn_refresh: "Refresh",
  btn_skip: "Skip",
  btn_pay: "Confirm & Pay via ZAAD",
  btn_retry: "Retry",
  btn_lookup: "Look up",

  // Loading / generic
  loading: "Loading…",

  // Driver login
  login_title: "Driver Login",
  login_phone: "Phone number",
  login_pin: "4-digit PIN",
  login_button: "Login",
  login_error_invalid: "Invalid phone or PIN. Please try again.",
  login_error_generic: "Login failed. Please check your connection.",

  // Deprecated aliases kept for backward compat
  driver_login_title: "Driver Login",
  driver_login_phone: "Phone number",
  driver_login_pin: "4-digit PIN",
  driver_login_btn: "Login",
  driver_login_error: "Invalid phone or PIN",
  driver_placeholder: "Driver dashboard coming soon.",

  // Driver navigation
  nav_dashboard: "Dashboard",
  nav_earnings: "Earnings",
  nav_history: "History",
  nav_logout: "Logout",

  // Demo reset
  demo_reset: "Reset Demo Data",
  demo_reset_confirm: "This will reset all data to seed values. Continue?",
  demo_reset_success: "Demo data has been reset.",

  // Dashboard — status & shift
  dash_zone: "Current zone:",
  dash_zone_label: "Zone",
  dash_go_online: "Go Online",
  dash_go_offline: "Go Offline",
  dash_going_online: "Going online…",
  dash_going_offline: "Going offline…",
  dash_truck_plate: "Truck plate / ID",
  dash_truck_placeholder: "e.g. HGS-1234",
  dash_truck_required: "Enter truck plate before going online",
  dash_saving_zone: "Saving…",
  dash_zone_saved: "Zone updated",

  // Prices section
  prices_title: "My Prices (SLSh)",
  prices_small: "Small (1,000 L)",
  prices_medium: "Medium (2,000 L)",
  prices_large: "Large (5,000 L)",
  prices_edit: "Edit",
  prices_save: "Save",
  prices_cancel: "Cancel",
  prices_saving: "Saving…",
  prices_saved: "Prices updated!",
  prices_error: "Could not save prices. Try again.",

  // Incoming orders section
  incoming_title: "Incoming Order",
  incoming_waiting: "Waiting for orders…",
  incoming_accept: "Accept",
  incoming_reject: "Reject",
  incoming_accepting: "Accepting…",
  incoming_rejecting: "Rejecting…",
  incoming_zone: "Zone",
  incoming_size: "Size",
  incoming_note: "Note",
  incoming_phone: "Customer",
  incoming_offline_hint: "Go online to receive orders.",

  // Active delivery section
  active_title: "Active Delivery",
  active_delivery: "Active Delivery",
  active_customer: "Customer",
  active_address: "Delivery note",
  active_size: "Tank size",
  active_price: "Price",
  active_advance_btn: "Advance status",
  active_advancing: "Updating…",
  active_btn_en_route: "Mark: On the Way",
  active_btn_pumping: "Mark: Pumping",
  active_btn_completed: "Mark: Completed",
  active_step_accepted: "Accepted",
  active_step_en_route: "On Way",
  active_step_pumping: "Pumping",
  active_step_completed: "Done",

  // Exception state
  exception_title: "Driver Exception",
  exception_message:
    "Your driver went offline mid-delivery. Our team has been notified.",
  exception_body:
    "You went offline during an active delivery. Please contact the customer.",
  exception_flagged: "Help flagged",

  // Earnings
  earnings_today: "Today's Earnings",
  earnings_orders: "Orders",
  earnings_total: "Total",
  earnings_date_range: "Date Range",
  earnings_view: "View Period",
  earnings_start: "From",
  earnings_end: "To",
  earnings_loading: "Loading earnings…",
  earnings_slsh: "SLSh",
  earnings_period: "Period Summary",
  earnings_today_orders: "Orders today",
  earnings_today_total: "Earned today",
  earnings_period_total: "Period total",
  earnings_no_orders: "No completed orders in this period.",

  // Order history
  history_title: "Order History",
  history_empty: "No order history yet.",
  history_date: "Date",
  history_zone: "Zone",
  history_size: "Size",
  history_price: "Price",
  history_status: "Status",
  history_loading: "Loading history…",
  history_customer: "Customer",

  // Customer step labels (for StepIndicator aria-label context)
  step_zone: "Zone",
  step_size: "Size",
  step_phone: "Phone",
  step_address: "Note",
  step_payment: "Payment",
  step_finding: "Finding",
  step_tracking: "Tracking",

  // Pay summary labels (aliases for payment step)
  pay_summary: "Order Summary",
  pay_processing: "Processing payment…",
  pay_success: "Payment confirmed!",
  pay_failed: "Payment failed. Please try again.",
  pay_retry: "Retry Payment",

  // Finding driver labels
  finding_message: "Payment confirmed. Finding your driver…",
  match_driver: "Your Driver",
  match_zone: "Zone",
  match_size: "Size",
  match_price: "Price",

  // Shift activation
  shift_title: "Shift Activation",
  shift_selectPeriod: "Select Shift Period",
  shift_morning: "Morning Shift (6am - 6pm)",
  shift_evening: "Evening Shift (6pm - 6am)",
  shift_feeLabel: "Shift Fee: $1.00 via ZAAD",
  shift_payNow: "Pay Now",
  shift_paying: "Processing payment…",
  shift_paymentSuccess: "Payment confirmed!",
  shift_enterZNumber: "Enter your Z-Number",
  shift_zNumberHint: "8-character code sent to your phone",
  shift_submitZNumber: "Activate Shift",
  shift_verifying: "Verifying…",
  shift_activated: "Shift activated! You're online.",
  shift_activeShift: "Active Shift",
  shift_noActiveShift: "No active shift",
  shift_startShift: "Start a Shift",
  shift_shiftHistory: "Shift History",

  // Driver registration
  driver_register: "Driver Registration",
  driver_fullName: "Full Name",
  driver_phone: "Phone Number",
  driver_pin: "4-Digit PIN",
  driver_truckPlate: "Truck Plate / ID",
  driver_registerBtn: "Register",
  driver_alreadyRegistered: "Already registered? Sign in",

  // Delivery confirmation
  confirm_title: "Confirm Delivery",
  confirm_driverBtn: "I Delivered the Water",
  confirm_customerBtn: "I Received the Water",
  confirm_waiting: "Waiting for both confirmations…",
  confirm_bothConfirmed: "Delivery confirmed by both sides!",
  confirm_driverConfirmed: "Driver confirmed delivery",
  confirm_customerConfirmed: "Customer confirmed receipt",

  // Availability
  availability_title: "Available Water Trucks",
  availability_zone: "Zone",
  availability_distance: "km away",
  availability_noTrucks: "No trucks available in this zone",
  availability_estimatedTime: "Est. arrival",
  availability_available: "Available",
  availability_busy: "Busy",
  availability_orderNow: "Order Now",

  // Driver registration extras
  driver_confirmPin: "Confirm PIN",

  // Shift activation extras
  shift_redirecting: "Redirecting to dashboard…",

  // Auth page — role selection & forms
  auth_role_title: "Welcome to BiyoFlow",
  auth_role_subtitle: "Who are you?",
  auth_role_resident: "I am a Resident",
  auth_role_driver: "I am a Water Truck Driver",
  auth_rc_login_title: "Resident Login",
  auth_rc_register_title: "Create Account",
  auth_wt_login_title: "Driver Login",
  auth_admin_title: "Admin Access",
  auth_name_label: "Full Name",
  auth_phone_label: "Phone Number",
  auth_pin_label: "PIN (4 digits)",
  auth_email_label: "Email (optional)",
  auth_login_btn: "Login",
  auth_register_btn: "Register",
  auth_no_account: "Don't have an account?",
  auth_register_link: "Register",
  auth_new_driver: "New driver?",
  auth_register_here: "Register here",
  auth_back: "Back",
  auth_test_account: "Test Account",
  auth_test_use_btn: "Use test account",
  auth_logout: "Logout",
  auth_hello: "Hello, {name}",

  // Auth page — existing keys referenced in so.ts (keep in sync)
  auth_welcome_sub: "Who are you?",
  auth_rc_role: "I am a Resident",
  auth_rc_role_sub: "Order water to your home",
  auth_wt_role: "I am a Water Truck Driver",
  auth_wt_role_sub: "Accept deliveries in your zone",
  auth_rc_login_sub: "Login to order water",
  auth_rc_register_sub: "Register to start ordering water",
  auth_wt_login_sub: "Login to see available jobs",
  auth_admin_sub: "Operations dashboard",
  auth_admin_password: "Admin password",
  auth_login_error: "Invalid credentials. Please try again.",
  auth_register_error: "Registration failed. Phone may already be in use.",
  auth_fill_required: "Please fill in all required fields.",
  auth_no_account_register: "Don't have an account? Register",
  auth_already_have_account: "Already have an account? Login",
  auth_wt_new_driver: "New driver? Register here",
  auth_back_role: "Back to role selection",
  auth_back_login: "Back to login",
  auth_optional: "optional",
  auth_test_account_label: "Test Account",
  auth_use_test_account: "Use test account",

  // Admin dashboard
  admin_title: "BiyoFlow Admin",
  admin_tab_overview: "Overview",
  admin_tab_orders: "Orders",
  admin_tab_drivers: "Drivers",
  admin_tab_settings: "Settings",
  admin_stat_today: "Today's Orders",
  admin_stat_active: "Active Orders",
  admin_stat_online: "Online Drivers",
  admin_stat_empty: "Empty Zones",
  admin_payment_title: "Payment Mode",
  admin_payment_success: "Always Success",
  admin_payment_fail: "Always Fail",
  admin_payment_random: "Random",
  admin_reset_title: "Reset Demo Data",
  admin_reset_confirm: "Are you sure? This will reset all data.",
  admin_reset_btn: "Reset Demo",
  admin_logout: "Logout",

  // Admin dashboard — existing keys referenced in so.ts (keep in sync)
  admin_dashboard_title: "Admin Dashboard",
  admin_dashboard_sub: "BiyoFlow operations overview",
  admin_stat_active_orders: "Active Orders",
  admin_stat_online_drivers: "Online Drivers",
  admin_stat_pending_shifts: "Pending Shifts",
  admin_stat_total_zones: "Zones",
  admin_zone_summary: "Zone Summary",
  admin_col_zone: "Zone",
  admin_col_drivers: "Online Drivers",
  admin_col_pending: "Pending Orders",
  admin_col_active: "Active Orders",
  admin_access_note: "Admin access location",
  admin_access_desc: "Button at bottom-right of login page (/auth). Login",

  // Admin login form
  admin_login_title: "Admin Login",
  admin_login_hint: "Enter your admin password to continue",
  admin_password_label: "Admin Password",
  admin_login_error: "Invalid admin password. Please try again.",
  admin_login_btn: "Login",

  // Admin stats (aligned with AdminPage keys)
  admin_stat_today_orders: "Today's Orders",

  // Admin table columns
  admin_col_status: "Status",
  admin_col_size: "Size",
  admin_col_name: "Name",
  admin_col_phone: "Phone",
  admin_col_active_order: "Active Order",
  admin_col_driver: "Driver",
  admin_col_customer: "Customer",
  admin_col_created: "Created",
  admin_col_online_drivers: "Online Drivers",

  // Admin orders/drivers
  admin_filter_status: "Filter by status",
  admin_no_orders: "No orders found.",
  admin_no_drivers: "No drivers registered yet.",

  // Admin payment mode
  admin_payment_mode_title: "Payment Mode",
  admin_payment_mode_hint: "Current mode",
  admin_payment_always_success: "Always Success",
  admin_payment_always_fail: "Always Fail",
  admin_mode_error: "Could not update payment mode.",

  // Admin settings
  admin_reset_hint: "Resets all orders and shifts to seed data.",
  admin_reset_yes: "Yes, Reset",
  admin_credentials_title: "Admin Credentials",

  // Phone pre-population note (CustomerPage step 3)
  phone_order_only_note:
    "Changes apply to this order only (we strongly encourage always using your registration number [{phone}])",

  // Admin zone management
  admin_zone_assign_title: "Zone Assignment",
  admin_zone_assign_hint: "Assign zones to this driver",
  admin_zone_max_label: "Max zones allowed",
  admin_zone_save: "Save Zone",
  admin_zone_saving: "Saving…",
  admin_zone_saved: "Zone saved",
  admin_zone_error: "Could not save zone assignment.",
  admin_driver_active_label: "Active",
  admin_driver_deactivate: "Deactivate",
  admin_driver_activate: "Activate",
  admin_override_order_status: "Override Status",
  admin_override_saving: "Saving…",
  admin_override_saved: "Status updated",
  admin_override_error: "Could not update order status.",

  // Shift activated — zone display
  shift_assigned_zones: "Your assigned zones",
  shift_no_zones: "No zones assigned yet. Contact admin.",

  // WT test credentials
  auth_wt_test_label: "Test Driver Account",
};

export type StringKey = keyof typeof en;
