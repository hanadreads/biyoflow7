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
  status_fully_completed: "Si Buuxda Dhammaystay",
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

  // Shift activation
  shift_title: "Hawlgalinta Wareegga",
  shift_selectPeriod: "Dooro Muddada Wareegga",
  shift_morning: "Wareegga Subaxnimada (6am - 6pm)",
  shift_evening: "Wareegga Habeenkii (6pm - 6am)",
  shift_feeLabel: "Kharashka Wareegga: $1.00 ZAAD",
  shift_payNow: "Bixi Hadda",
  shift_paying: "Lacagta waa la gelinayaa…",
  shift_paymentSuccess: "Lacagta waa la xaqiijiyay!",
  shift_enterZNumber: "Geli Z-Lambarka",
  shift_zNumberHint: "8-xaraf oo lambarka lagugu soo diray",
  shift_submitZNumber: "Hawlgeli Wareegga",
  shift_verifying: "Waa la xaqiijinayaa…",
  shift_activated: "Wareegga waa la hawlgeliyay! Waxaad online tahay.",
  shift_activeShift: "Wareegga Socda",
  shift_noActiveShift: "Wareeg ma jiro",
  shift_startShift: "Bilow Wareeg",
  shift_shiftHistory: "Taariikh Wareegyada",

  // Driver registration
  driver_register: "Diiwaangelinta Darawalka",
  driver_fullName: "Magaca Oo Dhan",
  driver_phone: "Lambarka Telefoonka",
  driver_pin: "PIN 4 Lambar",
  driver_truckPlate: "Lambarka Baabuurka",
  driver_registerBtn: "Diiwaan Geli",
  driver_alreadyRegistered: "Horay ma diiwaan gelisay? Soo gal",

  // Delivery confirmation
  confirm_title: "Xaqiiji Gaarsiinta",
  confirm_driverBtn: "Biyaha Waan Gaarsiyay",
  confirm_customerBtn: "Biyaha Waan Helaye",
  confirm_waiting: "Sugitaanka labada xaqiijin…",
  confirm_bothConfirmed: "Gaarsiintu labada dhinac ayay xaqiijiyeen!",
  confirm_driverConfirmed: "Darawalka ayaa gaarsiinta xaqiijiyay",
  confirm_customerConfirmed: "Macmiilku wuu xaqiijiyay helitaanka",

  // Availability
  availability_title: "Baabuurada Biyaha Diyaarsan",
  availability_zone: "Deegaan",
  availability_distance: "km fog",
  availability_noTrucks: "Baabuur lama helin deegaankan",
  availability_estimatedTime: "Waqtiga la filayo",
  availability_available: "Diyaar",
  availability_busy: "Mashquul",
  availability_orderNow: "Dalbo Hadda",

  // Driver registration extras
  driver_confirmPin: "Xaqiiji PIN",

  // Shift activation extras
  shift_redirecting: "Waxaa lagu wareejinayaa xaashida…",

  // Auth page — new keys
  auth_role_title: "Ku soo dhawoow BiyoFlow",
  auth_role_subtitle: "Cidda aad tahay?",
  auth_role_resident: "Waxaan ahay Deggan",
  auth_role_driver: "Waxaan ahay Wadaha Baabuurta Biyaha",
  auth_name_label: "Magaca oo Dhamaystiran",
  auth_phone_label: "Lambarka Telefoonka",
  auth_pin_label: "PIN (4 lambar)",
  auth_no_account: "Ma haysatid akoon?",
  auth_register_link: "Diwaangeli",
  auth_new_driver: "Wadaha cusub?",
  auth_register_here: "Halkan Diwaangeli",
  auth_back: "Dib u noqo",
  auth_test_account: "Akoonka Tijaabada",
  auth_test_use_btn: "Isticmaal akoonka tijaabada",
  auth_hello: "Salaan, {name}",

  // Admin dashboard — new keys
  admin_title: "Maamulka BiyoFlow",
  admin_tab_overview: "Guud ahaan",
  admin_tab_orders: "Dalabka",
  admin_tab_drivers: "Wadayaasha",
  admin_tab_settings: "Goobaha",
  admin_stat_today: "Dalabka Maanta",
  admin_stat_active: "Dalabka Firfircoon",
  admin_stat_online: "Wadayaasha Online",
  admin_stat_empty: "Goobaha Madhan",
  admin_payment_title: "Hab-Bixinta",
  admin_payment_success: "Markasta Guul",
  admin_payment_fail: "Markasta Fashil",
  admin_payment_random: "Qaab Kasta",
  admin_reset_title: "Dib u Deji Xogta",
  admin_reset_confirm: "Ma hubtaa? Xogta oo dhan ayaa dib loo dejin doonaa.",
  admin_reset_btn: "Dib u Deji",
  admin_logout: "Ka Bax",

  // Auth page — existing keys
  auth_welcome_sub: "Cidda aad tahay?",
  auth_rc_role: "Waxaan ahay Deggan",
  auth_rc_role_sub: "Dalbo biyo gurigaaga",
  auth_wt_role: "Waxaan ahay Wadaha Baabuurta Biyaha",
  auth_wt_role_sub: "Aqbal shaqooyinka gaarsiinta deegaankaaga",
  auth_rc_login_title: "Galitaanka Deganaanshaha",
  auth_rc_login_sub: "Gal si aad u dalbanayso biyo",
  auth_rc_register_title: "Abuur Akoon",
  auth_rc_register_sub: "Diwaangeli si aad u bilowdo dalbaashada biyaha",
  auth_wt_login_title: "Galitaanka Wadaha",
  auth_wt_login_sub: "Gal si aad u aragto shaqooyinka diyaarsan",
  auth_admin_title: "Galitaanka Maamulka",
  auth_admin_sub: "Xaashida hawlgalka",
  auth_admin_password: "Furaha sirta",
  auth_login_btn: "Gal",
  auth_register_btn: "Diwaangeli",
  auth_login_error: "Aqoonsiga khalad ah. Isku day mar kale.",
  auth_register_error:
    "Diiwaangelinta waxay guul darreysatay. Nambarka waxaa laga yaabaa in horay loo isticmaalay.",
  auth_fill_required: "Fadlan buuxi dhammaan beelaha loo baahdo.",
  auth_no_account_register: "Akoon ma lihid? Diiwaan Geli",
  auth_already_have_account: "Akoon horay ma u lahayd? Gal",
  auth_wt_new_driver: "Darawal cusub? Halkan ka diwaangeli",
  auth_back_role: "Dib u noqo doorashada doorka",
  auth_back_login: "Dib u noqo galitaanka",
  auth_email_label: "Email",
  auth_optional: "ikhtiyaari",
  auth_test_account_label: "Test Account / Akoonka Tijaabada",
  auth_use_test_account: "Isticmaal akoonka tijaabada",
  auth_logout: "Ka bax",

  // Admin dashboard
  admin_dashboard_title: "Xaashida Maamulka",
  admin_dashboard_sub: "Dulmarinta hawlgalka BiyoFlow",
  admin_stat_active_orders: "Dalabadaha Firfircoon",
  admin_stat_online_drivers: "Darawallada Online",
  admin_stat_pending_shifts: "Wareegyada Sugaya",
  admin_stat_total_zones: "Deegaannada",
  admin_zone_summary: "Kooban Deegaannada",
  admin_col_zone: "Deegaan",
  admin_col_drivers: "Darawallada Online",
  admin_col_pending: "Dalabadaha Sugaya",
  admin_col_active: "Dalabadaha Firfircoon",
  admin_access_note: "Goobta galitaanka maamulka",
  admin_access_desc:
    "Badhanka: geeska hoose-midig ee bogga aqoonsiga (/auth). Gal",

  // Admin login form
  admin_login_title: "Galitaanka Maamulka",
  admin_login_hint: "Geli furaha sirta maamulka si aad u sii waddo",
  admin_password_label: "Furaha Sirta Maamulka",
  admin_login_error: "Furaha sirta khalad ah. Isku day mar kale.",
  admin_login_btn: "Gal",

  // Admin stats (aligned with AdminPage keys)
  admin_stat_today_orders: "Dalabadaha Maanta",

  // Admin table columns
  admin_col_status: "Xaaladda",
  admin_col_size: "Xajmi",
  admin_col_name: "Magaca",
  admin_col_phone: "Telefoon",
  admin_col_active_order: "Dalabka Firfircoon",
  admin_col_driver: "Darawalka",
  admin_col_customer: "Macmiilka",
  admin_col_created: "La Abuuray",
  admin_col_online_drivers: "Darawallada Online",

  // Admin orders/drivers
  admin_filter_status: "Shaandee xaaladda",
  admin_no_orders: "Dalab lama helin.",
  admin_no_drivers: "Darawal lama diiwaan gelin.",

  // Admin payment mode
  admin_payment_mode_title: "Hab-Bixinta",
  admin_payment_mode_hint: "Habka hadda",
  admin_payment_always_success: "Markasta Guul",
  admin_payment_always_fail: "Markasta Fashil",
  admin_mode_error: "Hab-bixinta lama cusbooneysiiyay karin.",

  // Admin settings
  admin_reset_hint: "Dib u deji dhammaan dalabadaha iyo wareegyada.",
  admin_reset_yes: "Haa, Dib u Deji",
  admin_credentials_title: "Aqoonsiga Maamulka",

  // Phone pre-population note (CustomerPage step 3)
  phone_order_only_note:
    "Isbeddellada waxay ku kooban tahay dalabkan oo keliya (si adag waxaan kugula talineynaa in aad had iyo jeer isticmaasho lambarka diiwaan gelintaada [{phone}])",

  // Admin zone management
  admin_zone_assign_title: "Xafiiska Deegaannada",
  admin_zone_assign_hint: "Deegaannada darawalkan u xil saari",
  admin_zone_max_label: "Tirada deegaannada ugu badan",
  admin_zone_save: "Keydi Deegaanka",
  admin_zone_saving: "Waa la keydiyaa…",
  admin_zone_saved: "Deegaanka waa la keydiay",
  admin_zone_error: "Deegaanka lama keydin karin.",
  admin_driver_active_label: "Firfircoon",
  admin_driver_deactivate: "Jooji",
  admin_driver_activate: "Hawlgeli",
  admin_override_order_status: "Xaaladda Bedel",
  admin_override_saving: "Waa la keydiyaa…",
  admin_override_saved: "Xaaladda waa la cusbooneysiiyay",
  admin_override_error: "Xaaladda lama cusbooneysiiyay karin.",

  // Shift activated — zone display
  shift_assigned_zones: "Deegaannaadaada",
  shift_no_zones: "Wali deegaan lama xil saarin. Maamulka la xiriir.",

  // WT test credentials
  auth_wt_test_label: "Akoonka Tijaabada Darawalka",
};
