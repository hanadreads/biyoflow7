import type { backendInterface } from "../backend.d";
import {
  DriverStatus,
  OrderStatus,
  PaymentMode,
  PaymentStatus,
  ShiftPeriod,
  ShiftStatus,
  TankSize,
  Variant_ok,
} from "../backend.d";

export const mockBackend: backendInterface = {
  getZones: async () => [
    { id: BigInt(1), city: "Hargeisa", name: "Kood-Buur", display_order: BigInt(1) },
    { id: BigInt(2), city: "Hargeisa", name: "Ahmed Dhagax", display_order: BigInt(2) },
    { id: BigInt(3), city: "Hargeisa", name: "Ibrahim Kod", display_order: BigInt(3) },
    { id: BigInt(4), city: "Hargeisa", name: "Boodhair", display_order: BigInt(4) },
    { id: BigInt(5), city: "Hargeisa", name: "Mahabot", display_order: BigInt(5) },
  ],

  createOrder: async () => ({
    __kind__: "ok",
    ok: { payment_ref: "ZAAD-2024-001", order_id: BigInt(42) },
  }),

  processPayment: async () => ({
    __kind__: "ok",
    ok: { status: PaymentStatus.success, payment_ref: "ZAAD-2024-001" },
  }),

  getOrder: async () => ({
    id: BigInt(42),
    status: OrderStatus.accepted,
    help_flagged: false,
    customer_phone: "0634200001",
    size: TankSize.medium,
    created_at: BigInt(Date.now()),
    payment_status: PaymentStatus.success,
    address_note: "Near the blue gate",
    payment_ref: "ZAAD-2024-001",
    zone_id: BigInt(1),
    idempotency_key: "idem-001",
    driver_id: BigInt(1),
    matched_at: BigInt(Date.now()),
    customer_confirmed: false,
    driver_confirmed: false,
  }),

  driverLogin: async () => ({
    __kind__: "ok",
    ok: { name: "Cabdi Warsame", driver_id: BigInt(1) },
  }),

  getDriverProfile: async () => ({
    driver: {
      id: BigInt(1),
      pin: "1234",
      status: DriverStatus.online,
      name: "Cabdi Warsame",
      truck_plate: "HRG-1234",
      phone: "0634200001",
      zone_id: BigInt(1),
      allowed_zone_ids: [BigInt(1)],
      is_active: true,
    },
    prices: {
      small: BigInt(15000),
      medium: BigInt(25000),
      large: BigInt(40000),
    },
  }),

  getIncomingOrders: async () => [
    {
      id: BigInt(43),
      status: OrderStatus.pending,
      help_flagged: false,
      customer_phone: "0634300002",
      size: TankSize.large,
      created_at: BigInt(Date.now()),
      payment_status: PaymentStatus.success,
      address_note: "Behind the market",
      payment_ref: "ZAAD-2024-002",
      zone_id: BigInt(1),
      idempotency_key: "idem-002",
      customer_confirmed: false,
      driver_confirmed: false,
    },
  ],

  acceptOrder: async () => ({ __kind__: "ok", ok: null }),
  rejectOrder: async () => ({ __kind__: "ok", ok: null }),

  updateOrderStatus: async () => ({ __kind__: "ok", ok: null }),

  setDriverStatus: async () => ({ __kind__: "ok", ok: null }),
  setDriverZone: async () => ({ __kind__: "ok", ok: null }),
  setDriverPrices: async () => ({ __kind__: "ok", ok: null }),

  getDriverEarnings: async () => ({
    today_total: BigInt(65000),
    period_total: BigInt(185000),
    orders: [
      {
        id: BigInt(40),
        status: OrderStatus.completed,
        help_flagged: false,
        customer_phone: "0634100001",
        size: TankSize.small,
        created_at: BigInt(Date.now() - 3600000),
        payment_status: PaymentStatus.success,
        address_note: "",
        payment_ref: "ZAAD-2024-003",
        zone_id: BigInt(1),
        idempotency_key: "idem-003",
        driver_id: BigInt(1),
        completed_at: BigInt(Date.now() - 1800000),
        customer_confirmed: true,
        driver_confirmed: true,
      },
    ],
  }),

  getDriverHistory: async () => [
    {
      id: BigInt(38),
      status: OrderStatus.completed,
      help_flagged: false,
      customer_phone: "0634100005",
      size: TankSize.medium,
      created_at: BigInt(Date.now() - 86400000),
      payment_status: PaymentStatus.success,
      address_note: "Corner house",
      payment_ref: "ZAAD-2024-004",
      zone_id: BigInt(1),
      idempotency_key: "idem-004",
      driver_id: BigInt(1),
      completed_at: BigInt(Date.now() - 82800000),
      customer_confirmed: true,
      driver_confirmed: true,
    },
    {
      id: BigInt(39),
      status: OrderStatus.completed,
      help_flagged: false,
      customer_phone: "0634200009",
      size: TankSize.large,
      created_at: BigInt(Date.now() - 7200000),
      payment_status: PaymentStatus.success,
      address_note: "",
      payment_ref: "ZAAD-2024-005",
      zone_id: BigInt(1),
      idempotency_key: "idem-005",
      driver_id: BigInt(1),
      completed_at: BigInt(Date.now() - 5400000),
      customer_confirmed: true,
      driver_confirmed: true,
    },
  ],

  confirmDelivery: async () => ({ __kind__: "ok", ok: "confirmed" }),

  getActiveShift: async () => null,

  getDriverShifts: async () => [],

  requestShift: async () => ({
    __kind__: "ok",
    ok: {
      id: BigInt(1),
      status: ShiftStatus.pending_payment,
      driverId: BigInt(1),
      period: ShiftPeriod.morning,
      date: new Date().toISOString().split("T")[0],
    },
  }),

  payShiftFee: async () => ({
    __kind__: "ok",
    ok: { zNumber: "ABCD1234", paymentRef: "ZAAD-SHIFT-001" },
  }),

  submitZNumber: async () => ({
    __kind__: "ok",
    ok: {
      id: BigInt(1),
      status: ShiftStatus.active,
      driverId: BigInt(1),
      period: ShiftPeriod.morning,
      date: new Date().toISOString().split("T")[0],
      zNumber: "ABCD1234",
      paymentRef: "ZAAD-SHIFT-001",
    },
  }),

  resetDemo: async () => Variant_ok.ok,
  setPaymentMode: async () => Variant_ok.ok,

  registerCustomer: async () => ({
    __kind__: "ok",
    ok: {
      id: BigInt(1),
      name: "Faadumo Test",
      phone: "06XTEST01",
      pin: "1234",
      created_at: BigInt(Date.now()),
    },
  }),

  loginCustomer: async () => ({
    __kind__: "ok",
    ok: { customerId: BigInt(1), name: "Faadumo Test", phone: "06XTEST01" },
  }),

  getCustomerProfile: async () => ({
    __kind__: "ok",
    ok: {
      id: BigInt(1),
      name: "Faadumo Test",
      phone: "06XTEST01",
      pin: "1234",
      created_at: BigInt(Date.now()),
    },
  }),

  adminLogin: async () => ({
    __kind__: "ok",
    ok: { token: "admin-session-token-2024", role: "admin" },
  }),

  getAllOrders: async () => [],

  getDriverStatusSummary: async () => [],

  getZoneSummary: async () => [],

  adminSetDriverActive: async () => ({ __kind__: "ok", ok: null }),

  adminSetOrderStatus: async () => ({ __kind__: "ok", ok: null }),

  setDriverZones: async () => ({ __kind__: "ok", ok: null }),
};
