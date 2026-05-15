import type { backendInterface } from "../backend.d";
import {
  DriverStatus,
  OrderStatus,
  PaymentMode,
  PaymentStatus,
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
    },
  ],

  resetDemo: async () => Variant_ok.ok,
  setPaymentMode: async () => Variant_ok.ok,
};
