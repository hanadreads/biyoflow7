// Somali translations — all keys must mirror en.ts.
import type { StringKey } from "./en";

export const so: Record<StringKey, string> = {
  // App / Navigation
  app_name: "BiyoFlow",
  app_tagline: "Gaarsiinta Biyaha — Hargeysa",
  lang_toggle: "English",
  customer: "Macmiil",
  driver: "Darawal",

  // Step indicator
  step_of: "Tallaabow {current} ka mid ah {total}",

  // Step 1 — Zone
  zone_title: "Dooro deegaankaaga",
  zone_hint: "Geli lambarka deegaankaaga",
  zone_invalid: "Fadlan geli lambarka u dhexeeya 1 iyo {max}",
  zone_loading: "Waa la rarayo…",
  zone_error:
    "Laguma guulaysan karin soo dejinta deegaannada. Isku day mar kale.",
  zone_remembered: "Kan ugu dambeeyay: {name}",

  // Step 2 — Tank size
  size_title: "Dooro xajmiga taangiga",
  size_hint: "Geli 1, 2, ama 3",
  size_small: "Yar — 1,000 L",
  size_medium: "Dhexdhexaad — 2,000 L",
  size_large: "Weyn — 5,000 L",
  size_invalid: "Fadlan geli 1, 2, ama 3",

  // Step 3 — Phone
  phone_title: "Geli lambarka telefoonkaaga",
  phone_placeholder: "Tusaale: 063 4123456",
  phone_label: "Lambarka telefoonka",
  phone_invalid: "Fadlan geli lambarka telefoon oo sax ah",

  // Step 4 — Address note
  note_title: "Ku dar xusuusin (ikhtiyaari)",
  note_label: "Cinwaanka ama goobta",
  note_placeholder: "Tusaale: Agagaarka irida buluuga ah, guriga labaad",
  note_hint: "{remaining} xaraf oo haray",
  note_skip: "Bood",
  note_next: "Xiga",

  // Step 5 — Payment
  payment_title: "Xaqiiji & Bixi",
  payment_summary_zone: "Deegaan:",
  payment_summary_size: "Xajmi:",
  payment_summary_phone: "Telefoon:",
  payment_confirm_btn: "Xaqiiji & Bixi via ZAAD",
  payment_processing: "Lacagta waa la gelinayaa…",
  payment_failed: "Lacag bixintu waxay guul darreysatay. Isku day mar kale.",
  payment_retry: "Isku day mar kale",

  // Step 6 — Matching
  matching_title: "Darawalka waa la raadiyaa",
  matching_searching: "Lacagta waa la xaqiijiyay. Darawalka waa la raadiyaa…",
  matching_driver_found: "Darawalka waa la helay!",
  matching_expired: "Darawal lama helin. Dalabkaagu wuu dhacay.",
  matching_exception:
    "Darawalkaagu si kooban ma heli karo. Cusub ayaan u raadineynaa.",
  matching_driver_name: "Darawal:",
  matching_driver_phone: "Telefoon:",
  matching_driver_plate: "Baabuur:",

  // Step 7 — Tracking
  tracking_title: "Raadraac Dalabka",
  tracking_order_id: "Dalabka #{id}",
  tracking_elapsed: "Waqtiga la qaatay: {time}",
  tracking_completed: "Gaarsiinta waa la dhammeeyay! Mahadsanid.",
  tracking_help_flagged:
    "Arrin ayaa la calaamadeeyay. Kooxdayadu waxay la soo xiriiri doontaa.",
  tracking_driver_info: "Macluumaadka Darawalka",
  tracking_exception:
    "Arrin ayaa la calaamadeeyay. Kooxdayadu waxay ku soo xiriiri doontaa.",
  tracking_expired: "Dalabkaagu wuu dhacay. Darawal lama helin.",
  tracking_complete: "Gaarsiinta waa la dhammeeyay! Mahadsanid.",

  // Order statuses
  status_pending: "Sugitaanka",
  status_matched: "Darawal Waa La Helay",
  status_accepted: "Darawal Wuu Aqbalay",
  status_en_route: "Wuu Socdaa",
  status_pumping: "Biyo Waa La Shubayaa",
  status_completed: "La Dhammeeyay",
  status_expired: "Wuu Dhacay",
  status_cancelled: "Wuu Baajinmay",
  status_exception: "Khalad",
  status_online: "Internetka",
  status_offline: "Xidid",

  // Manual lookup
  lookup_title: "Dalabkaagii horay miyaad u lahayd?",
  lookup_order_id_label: "ID-ga Dalabka",
  lookup_order_id_placeholder: "Geli ID-ga dalabkaaga",
  lookup_phone4_label: "4-da lambar ee ugu dambeeya",
  lookup_phone4_placeholder: "Tusaale: 3456",
  lookup_btn: "Raadi dalabka",
  lookup_loading: "Waa la raadiyaa…",
  lookup_not_found: "Dalab lama helin macluumaadkaas.",
  lookup_error: "Dalabka lama raadin karin. Hubi macluumaadkaaga.",

  // Common actions
  btn_back: "← Dib",
  btn_next: "Xiga →",
  btn_continue: "Sii wad",
  btn_close: "Xir",
  btn_refresh: "Cusbooneysii",
  btn_skip: "Bood",
  btn_pay: "Xaqiiji & Bixi via ZAAD",
  btn_retry: "Isku day",
  btn_lookup: "Raadi",

  // Loading / generic
  loading: "Waa la rarayo…",

  // Driver login
  login_title: "Gal Akoonka Darawalka",
  login_phone: "Lambarka telefoonka",
  login_pin: "PIN 4 nambar",
  login_button: "Gal",
  login_error_invalid: "Telefoon ama PIN khalad ah. Isku day mar kale.",
  login_error_generic: "Galitaanku wuu ku guul darreystay. Xiriirkaaga hubi.",

  // Deprecated aliases kept for backward compat
  driver_login_title: "Gal Akoonka Darawalka",
  driver_login_phone: "Lambarka telefoonka",
  driver_login_pin: "PIN 4 nambar",
  driver_login_btn: "Gal",
  driver_login_error: "Telefoon ama PIN khalad ah",
  driver_placeholder: "Shabakadda darawalka dhowaan waa la soo saari doonaa.",

  // Driver navigation
  nav_dashboard: "Xaashida",
  nav_earnings: "Lacagaha",
  nav_history: "Taariikh",
  nav_logout: "Ka bax",

  // Demo reset
  demo_reset: "Dib u dejinta Xogta",
  demo_reset_confirm: "Tani waxay dib u deji doontaa dhammaan xogta. Sii wad?",
  demo_reset_success: "Xogta waa dib loo dejiyay.",

  // Dashboard — status & shift
  dash_zone: "Deegaanka hadda:",
  dash_zone_label: "Deegaan",
  dash_go_online: "Bilow Shaqada",
  dash_go_offline: "Jooji Shaqada",
  dash_going_online: "Waa la bilaabayaa…",
  dash_going_offline: "Waa la joojinayaa…",
  dash_truck_plate: "Lambarka baabuurka",
  dash_truck_placeholder: "Mis. HGS-1234",
  dash_truck_required: "Geli lambarka baabuurka ka hor intaadan online ahayn",
  dash_saving_zone: "Waa la keydinayaa…",
  dash_zone_saved: "Deegaanka waa la cusbooneysiiyay",

  // Prices section
  prices_title: "Qiimahayga (SLSh)",
  prices_small: "Yar (1,000 L)",
  prices_medium: "Dhexdhexaad (2,000 L)",
  prices_large: "Weyn (5,000 L)",
  prices_edit: "Tafatir",
  prices_save: "Keydi",
  prices_cancel: "Jooji",
  prices_saving: "Waa la keydiyaa…",
  prices_saved: "Qiimayaasha waa la cusbooneysiiyay!",
  prices_error: "Qiimayaasha lama keydin karin. Isku day.",

  // Incoming orders section
  incoming_title: "Dalabka Cusub",
  incoming_waiting: "Sugitaanka dalabadka…",
  incoming_accept: "Aqbal",
  incoming_reject: "Diid",
  incoming_accepting: "Waa la aqbalayaa…",
  incoming_rejecting: "Waa la diidayaa…",
  incoming_zone: "Deegaan",
  incoming_size: "Xajmi",
  incoming_note: "Xusuusin",
  incoming_phone: "Macmiilka",
  incoming_offline_hint: "Online noqo si aad dalabado u hesho.",

  // Active delivery section
  active_title: "Gaarsiinta Socota",
  active_delivery: "Gaarsiinta Socota",
  active_customer: "Macmiilka",
  active_address: "Xusuusin gaarsiinta",
  active_size: "Xajmiga taangiga",
  active_price: "Qiimaha",
  active_advance_btn: "Cusboonaysii xaaladda",
  active_advancing: "Waa la cusbooneysiinayaa…",
  active_btn_en_route: "Calaamadee: Socdaala",
  active_btn_pumping: "Calaamadee: Biyo Shubid",
  active_btn_completed: "Calaamadee: La Dhammeeyay",
  active_step_accepted: "Aqbalay",
  active_step_en_route: "Socda",
  active_step_pumping: "Shubid",
  active_step_completed: "Dhamme",

  // Exception state
  exception_title: "Khalad Darawalka",
  exception_message:
    "Darawalkaagu ayuu internet ka baxay intuu gaarsiin socoto. Kooxdayadu waa la ogeysiiyay.",
  exception_body:
    "Waad ka baxday internet intaad gaarsiin socotay. Macmiilka la xiriir.",
  exception_flagged: "Caawimaad la codsaday",

  // Earnings
  earnings_today: "Lacagta Maanta",
  earnings_orders: "Dalabado",
  earnings_total: "Wadarta",
  earnings_date_range: "Muddada Taariikhda",
  earnings_view: "Arag Muddada",
  earnings_start: "Laga bilaabo",
  earnings_end: "Ilaa",
  earnings_loading: "Lacagaha waa la rarayo…",
  earnings_slsh: "SLSh",
  earnings_period: "Kooban Muddada",
  earnings_today_orders: "Dalabadaha maanta",
  earnings_today_total: "Maanta la helay",
  earnings_period_total: "Wadarta muddada",
  earnings_no_orders: "Dalabado la dhamaystiri karin muddo kaniinka.",

  // Order history
  history_title: "Taariikh Dalabadaha",
  history_empty: "Taariikh dalabado lama helin.",
  history_date: "Taariikhda",
  history_zone: "Deegaan",
  history_size: "Xajmi",
  history_price: "Qiimaha",
  history_status: "Xaaladda",
  history_loading: "Taariikhu waa la rarayo…",
  history_customer: "Macmiilka",

  // Customer step labels
  step_zone: "Deegaan",
  step_size: "Xajmi",
  step_phone: "Telefoon",
  step_address: "Xusuusin",
  step_payment: "Lacag bixin",
  step_finding: "Raadin",
  step_tracking: "Raadraac",

  // Pay summary labels
  pay_summary: "Kooban Dalabka",
  pay_processing: "Lacagta waa la gelinayaa…",
  pay_success: "Lacagta waa la xaqiijiyay!",
  pay_failed: "Lacag bixintu waxay guul darreysatay. Isku day mar kale.",
  pay_retry: "Isku day mar kale",

  // Finding driver labels
  finding_message: "Lacagta waa la xaqiijiyay. Darawalka waa la raadiyaa…",
  match_driver: "Darawalkaaga",
  match_zone: "Deegaan",
  match_size: "Xajmi",
  match_price: "Qiimaha",
};
