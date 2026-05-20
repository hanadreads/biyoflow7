// Frontend-friendly shift types that mirror the backend Shift types.
// Use these in UI components instead of importing backend enums directly.

export type ShiftPeriod = "morning" | "evening";

export type ShiftStatus =
  | "pending_payment"
  | "pending_verification"
  | "active"
  | "expired";

// Steps in the shift activation wizard
export type ShiftActivationStep =
  | "select_period" // Choose morning or evening
  | "pay" // Simulate ZAAD $1 payment
  | "enter_z_number" // Submit the Z-Number code received on phone
  | "activated"; // Shift is live

export interface ShiftSummary {
  id: bigint;
  period: ShiftPeriod;
  date: string;
  status: ShiftStatus;
  zNumber?: string;
  paymentRef?: string;
  activatedAt?: bigint;
}
