import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderSummary {
    id: bigint;
    status: string;
    customerPhone: string;
    createdAt: bigint;
    size: string;
    zone: string;
    driverName?: string;
}
export interface Zone {
    id: bigint;
    city: string;
    name: string;
    display_order: bigint;
}
export interface PaymentResult {
    zNumber: string;
    paymentRef: string;
}
export interface Driver {
    id: bigint;
    pin: string;
    status: DriverStatus;
    allowed_zone_ids: Array<bigint>;
    name: string;
    current_order_id?: bigint;
    truck_plate: string;
    is_active: boolean;
    phone: string;
    zone_id: bigint;
}
export interface Shift {
    id: bigint;
    status: ShiftStatus;
    driverId: bigint;
    feePaidAt?: bigint;
    period: ShiftPeriod;
    activatedAt?: bigint;
    date: string;
    zNumber?: string;
    paymentRef?: string;
    verifiedAt?: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    help_flagged: boolean;
    customer_phone: string;
    size: TankSize;
    created_at: bigint;
    payment_status: PaymentStatus;
    customer_id?: bigint;
    address_note: string;
    customer_confirmed: boolean;
    driver_id?: bigint;
    driver_confirmed: boolean;
    payment_ref: string;
    completed_at?: bigint;
    matched_at?: bigint;
    zone_id: bigint;
    expired_at?: bigint;
    idempotency_key: string;
}
export interface DriverSummary {
    id: bigint;
    status: string;
    activeOrderId?: bigint;
    name: string;
    zone: string;
    phone: string;
}
export interface Customer {
    id: bigint;
    pin: string;
    name: string;
    created_at: bigint;
    email?: string;
    phone: string;
}
export interface ZoneSummary {
    pendingOrders: bigint;
    onlineDrivers: bigint;
    zoneName: string;
    activeOrders: bigint;
}
export interface DriverPrices {
    large: bigint;
    small: bigint;
    medium: bigint;
}
export enum DriverStatus {
    offline = "offline",
    online = "online"
}
export enum OrderStatus {
    pumping = "pumping",
    fully_completed = "fully_completed",
    cancelled = "cancelled",
    expired = "expired",
    pending = "pending",
    exception = "exception",
    completed = "completed",
    en_route = "en_route",
    matched = "matched",
    accepted = "accepted"
}
export enum PaymentMode {
    always_success = "always_success",
    always_fail = "always_fail",
    random = "random"
}
export enum PaymentStatus {
    pending = "pending",
    success = "success",
    failed = "failed"
}
export enum ShiftPeriod {
    morning = "morning",
    evening = "evening"
}
export enum ShiftStatus {
    active = "active",
    expired = "expired",
    pending_payment = "pending_payment",
    pending_verification = "pending_verification"
}
export enum TankSize {
    large = "large",
    small = "small",
    medium = "medium"
}
export enum Variant_ok {
    ok = "ok"
}
export interface backendInterface {
    acceptOrder(driver_id: bigint, order_id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminLogin(password: string): Promise<{
        __kind__: "ok";
        ok: {
            token: string;
            role: string;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetDriverActive(driver_id: bigint, is_active: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetOrderStatus(order_id: bigint, new_status: OrderStatus): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    confirmDelivery(order_id: bigint, role: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createOrder(zone_id: bigint, size: TankSize, customer_phone: string, address_note: string, idempotency_key: string, customer_id: bigint | null): Promise<{
        __kind__: "ok";
        ok: {
            payment_ref: string;
            order_id: bigint;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    driverLogin(phone: string, pin: string): Promise<{
        __kind__: "ok";
        ok: {
            name: string;
            driver_id: bigint;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    getActiveShift(driverId: bigint): Promise<Shift | null>;
    getAllOrders(): Promise<Array<OrderSummary>>;
    getCustomerProfile(customerId: bigint): Promise<{
        __kind__: "ok";
        ok: Customer;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getDriverEarnings(driver_id: bigint, start_ms: bigint | null, end_ms: bigint | null): Promise<{
        orders: Array<Order>;
        today_total: bigint;
        period_total: bigint;
    }>;
    getDriverHistory(driver_id: bigint): Promise<Array<Order>>;
    getDriverProfile(driver_id: bigint): Promise<{
        prices: DriverPrices;
        driver: Driver;
    } | null>;
    getDriverShifts(driverId: bigint): Promise<Array<Shift>>;
    getDriverStatusSummary(): Promise<Array<DriverSummary>>;
    getIncomingOrders(driver_id: bigint): Promise<Array<Order>>;
    getOrder(order_id: bigint, phone_last4: string): Promise<Order | null>;
    getZoneSummary(): Promise<Array<ZoneSummary>>;
    getZones(): Promise<Array<Zone>>;
    loginCustomer(phone: string, pin: string): Promise<{
        __kind__: "ok";
        ok: {
            name: string;
            customerId: bigint;
            phone: string;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    payShiftFee(shiftId: bigint): Promise<{
        __kind__: "ok";
        ok: PaymentResult;
    } | {
        __kind__: "err";
        err: string;
    }>;
    processPayment(order_id: bigint, idempotency_key: string): Promise<{
        __kind__: "ok";
        ok: {
            status: PaymentStatus;
            payment_ref: string;
        };
    } | {
        __kind__: "err";
        err: string;
    }>;
    registerCustomer(name: string, phone: string, pin: string, email: string | null): Promise<{
        __kind__: "ok";
        ok: Customer;
    } | {
        __kind__: "err";
        err: string;
    }>;
    rejectOrder(driver_id: bigint, order_id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    requestShift(driverId: bigint, period: ShiftPeriod, date: string): Promise<{
        __kind__: "ok";
        ok: Shift;
    } | {
        __kind__: "err";
        err: string;
    }>;
    resetDemo(): Promise<Variant_ok>;
    setDriverPrices(driver_id: bigint, prices: DriverPrices): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setDriverStatus(driver_id: bigint, status: DriverStatus, truck_plate: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setDriverZone(driver_id: bigint, zone_id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setDriverZones(driver_id: bigint, zone_ids: Array<bigint>): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    setPaymentMode(mode: PaymentMode): Promise<Variant_ok>;
    submitZNumber(shiftId: bigint, zNumber: string): Promise<{
        __kind__: "ok";
        ok: Shift;
    } | {
        __kind__: "err";
        err: string;
    }>;
    updateOrderStatus(driver_id: bigint, order_id: bigint, new_status: OrderStatus): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
