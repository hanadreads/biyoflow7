// Persists the active order reference in localStorage so the user can
// return to their order after a page refresh.
import { useCallback, useState } from "react";

const ORDER_KEY = "biyo_order_id";
const PHONE_KEY = "biyo_order_phone";

interface LocalOrder {
  orderId: bigint;
  phone: string;
}

export function useLocalOrder() {
  const [localOrder, setLocalOrder] = useState<LocalOrder | null>(() => {
    try {
      const id = localStorage.getItem(ORDER_KEY);
      const phone = localStorage.getItem(PHONE_KEY);
      if (id && phone) return { orderId: BigInt(id), phone };
    } catch {
      // ignore parse errors
    }
    return null;
  });

  const saveOrder = useCallback((orderId: bigint, phone: string) => {
    localStorage.setItem(ORDER_KEY, orderId.toString());
    localStorage.setItem(PHONE_KEY, phone);
    setLocalOrder({ orderId, phone });
  }, []);

  const clearOrder = useCallback(() => {
    localStorage.removeItem(ORDER_KEY);
    localStorage.removeItem(PHONE_KEY);
    setLocalOrder(null);
  }, []);

  return { localOrder, saveOrder, clearOrder };
}
