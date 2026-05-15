// React Query hooks wiring frontend to the backend actor.
import { createActor } from "@/backend";
import type { Order, Zone } from "@/types/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    }) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.createOrder(
        params.zone_id,
        params.size,
        params.customer_phone,
        params.address_note,
        params.idempotency_key,
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
