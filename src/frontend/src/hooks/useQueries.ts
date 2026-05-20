// React Query hooks wiring frontend to the backend actor.
import { createActor } from "@/backend";
import type { Order, Zone } from "@/types/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaymentResult, Shift } from "../backend";
import type { ShiftPeriod } from "../backend";

// ── Zones ──────────────────────────────────────────────────────────────────

export function useZones() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Zone[]>({
    queryKey: ["zones"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getZones();
      return [...result].sort(
        (a, b) => Number(a.display_order) - Number(b.display_order),
      );
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

// ── Order lookup (customer) ────────────────────────────────────────────────

export function useGetOrder(
  orderId: bigint | null,
  phone_last4: string,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order | null>({
    queryKey: ["order", orderId?.toString()],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrder(orderId, phone_last4);
    },
    enabled: !!actor && !isFetching && enabled && !!orderId,
    refetchInterval: false, // polling handled by usePolling hook
    staleTime: 0,
  });
}

// ── Create order mutation ──────────────────────────────────────────────────

export function useCreateOrder() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (params: {
      zone_id: bigint;
      size: import("@/types/backend").TankSize;
      customer_phone: string;
      address_note: string;
      idempotency_key: string;
      customer_id?: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.createOrder(
        params.zone_id,
        params.size,
        params.customer_phone,
        params.address_note,
        params.idempotency_key,
        params.customer_id ?? null,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
  });
}

// ── Process payment mutation ───────────────────────────────────────────────

export function useProcessPayment() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      order_id: bigint;
      idempotency_key: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.processPayment(
        params.order_id,
        params.idempotency_key,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_data, vars) => {
      // Invalidate so getOrder refetches immediately after payment
      void queryClient.invalidateQueries({
        queryKey: ["order", vars.order_id.toString()],
      });
    },
  });
}

// ── Shift management ──────────────────────────────────────────────────────

export function useRequestShift() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      driverId: bigint;
      period: ShiftPeriod;
      date: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.requestShift(
        params.driverId,
        params.period,
        params.date,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ["activeShift", vars.driverId.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["driverShifts", vars.driverId.toString()],
      });
    },
  });
}

export function usePayShiftFee() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { shiftId: bigint; driverId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.payShiftFee(params.shiftId);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok as PaymentResult;
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ["activeShift", vars.driverId.toString()],
      });
    },
  });
}

export function useSubmitZNumber() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      shiftId: bigint;
      zNumber: string;
      driverId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.submitZNumber(params.shiftId, params.zNumber);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok as Shift;
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ["activeShift", vars.driverId.toString()],
      });
      void queryClient.invalidateQueries({
        queryKey: ["driverShifts", vars.driverId.toString()],
      });
    },
  });
}

export function useGetActiveShift(driverId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Shift | null>({
    queryKey: ["activeShift", driverId?.toString()],
    queryFn: async () => {
      if (!actor || !driverId) return null;
      return actor.getActiveShift(driverId);
    },
    enabled: !!actor && !isFetching && !!driverId,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useGetDriverShifts(driverId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Shift[]>({
    queryKey: ["driverShifts", driverId?.toString()],
    queryFn: async () => {
      if (!actor || !driverId) return [];
      return actor.getDriverShifts(driverId);
    },
    enabled: !!actor && !isFetching && !!driverId,
    staleTime: 30_000,
  });
}

// ── Customer auth ─────────────────────────────────────────────────────────

export function useRegisterCustomer() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (params: {
      name: string;
      phone: string;
      pin: string;
      email: string | null;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.registerCustomer(
        params.name,
        params.phone,
        params.pin,
        params.email,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
  });
}

export function useLoginCustomer() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (params: { phone: string; pin: string }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.loginCustomer(params.phone, params.pin);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
  });
}

export function useGetCustomerProfile(customerId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["customerProfile", customerId?.toString()],
    queryFn: async () => {
      if (!actor || !customerId) return null;
      const result = await actor.getCustomerProfile(customerId);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    enabled: !!actor && !isFetching && !!customerId,
    staleTime: 60_000,
  });
}

// ── Admin auth ────────────────────────────────────────────────────────────

export function useAdminLogin() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (params: { password: string }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.adminLogin(params.password);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
  });
}

// ── Admin hooks ───────────────────────────────────────────────────────────

export function useGetAllOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useGetDriverStatusSummary() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "drivers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDriverStatusSummary();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useGetZoneSummary() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["admin", "zones"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getZoneSummary();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useResetDemo() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.resetDemo();
    },
    onSuccess: () => void queryClient.invalidateQueries(),
  });
}

export function useSetPaymentMode() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (mode: import("../backend").PaymentMode) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.setPaymentMode(mode);
    },
  });
}

// ── Admin mutations ───────────────────────────────────────────────────────

export function useSetDriverZone() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { driverId: bigint; zoneId: bigint }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.setDriverZone(params.driverId, params.zoneId);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
    },
  });
}

export function useAdminSetDriverZones() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      driverId: bigint;
      zoneIds: Array<bigint>;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.setDriverZones(
        params.driverId,
        params.zoneIds,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "drivers"] });
    },
  });
}

export function useAdminSetOrderStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      driverId: bigint;
      orderId: bigint;
      status: import("../backend").OrderStatus;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.updateOrderStatus(
        params.driverId,
        params.orderId,
        params.status,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}

// ── Delivery confirmation ──────────────────────────────────────────────────

export function useConfirmDelivery() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      orderId: bigint;
      role: "driver" | "customer";
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.confirmDelivery(params.orderId, params.role);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ["order", vars.orderId.toString()],
      });
    },
  });
}
