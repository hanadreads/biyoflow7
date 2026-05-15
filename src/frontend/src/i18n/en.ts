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
};

export type StringKey = keyof typeof en;
