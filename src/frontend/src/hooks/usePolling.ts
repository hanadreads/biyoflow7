// Generic polling hook. Calls `fn` every `intervalMs` (default 5s) while `active` is true.
import { useCallback, useEffect, useRef } from "react";

interface UsePollingOptions {
  intervalMs?: number;
  active: boolean;
}

export function usePolling(
  fn: () => void | Promise<void>,
  { intervalMs = 5000, active }: UsePollingOptions,
): void {
  // Keep a stable ref so the interval always calls the latest fn without re-subscribing.
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      void fnRef.current();
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);

  // Run immediately on first activation
  const runNow = useCallback(() => {
    void fnRef.current();
  }, []);

  useEffect(() => {
    if (active) runNow();
  }, [active, runNow]);
}
