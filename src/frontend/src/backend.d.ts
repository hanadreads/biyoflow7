import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Zone {
    id: bigint;
    city: string;
    name: string;
    display_order: bigint;
}
export interface DriverPrices {
    large: bigint;
    small: bigint;
    medium: bigint;
}
export interface Driver {
    id: bigint;
    pin: string;
    status: DriverStatus;
    name: string;
    current_order_id?: bigint;
    truck_plate: string;
    phone: string;
    zone_id: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    help_flagged: boolean;
    customer_phone: string;
    size: TankSize;
    created_at: bigint;
    payment_status: PaymentStatus;
    address_note: string;
    driver_id?: bigint;
    payment_ref: string;
    completed_at?: bigint;
    matched_at?: bigint;
    zone_id: bigint;
    expired_at?: bigint;
    idempotency_key: string;
}
export enum DriverStatus {
    offline = "offline",
    online = "online"
}
export enum OrderStatus {
    pumping = "pumping",
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
    createOrder(zone_id: bigint, size: TankSize, customer_phone: string, address_note: string, idempotency_key: string): Promise<{
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
    getIncomingOrders(driver_id: bigint): Promise<Array<Order>>;
    getOrder(order_id: bigint, phone_last4: string): Promise<Order | null>;
    getZones(): Promise<Array<Zone>>;
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
    rejectOrder(driver_id: bigint, order_id: bigint): Promise<{
        __kind__: "ok";
        ok: null;
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
    setPaymentMode(mode: PaymentMode): Promise<Variant_ok>;
    updateOrderStatus(driver_id: bigint, order_id: bigint, new_status: OrderStatus): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
}
