import type { StringKey } from "@/i18n/en";
import { useLang } from "@/i18n/index";
// Color-coded badge for OrderStatus or DriverStatus values.
import { DriverStatus, OrderStatus } from "@/types/backend";

type BadgeStatus = OrderStatus | DriverStatus;

interface StatusBadgeProps {
  status: BadgeStatus;
}

const STATUS_CLASSES: Record<BadgeStatus, string> = {
  // OrderStatus
  [OrderStatus.pending]: "bg-muted text-muted-foreground",
  [OrderStatus.matched]: "bg-primary/10 text-primary border border-primary/30",
  [OrderStatus.accepted]: "bg-primary/10 text-primary border border-primary/30",
  [OrderStatus.en_route]:
    "bg-secondary/20 text-secondary-foreground border border-secondary/40",
  [OrderStatus.pumping]:
    "bg-accent/20 text-accent-foreground border border-accent/40",
  [OrderStatus.completed]:
    "bg-chart-5/20 text-foreground border border-chart-5/40",
  [OrderStatus.expired]: "bg-muted text-muted-foreground line-through",
  [OrderStatus.cancelled]:
    "bg-destructive/10 text-destructive border border-destructive/30",
  [OrderStatus.exception]:
    "bg-destructive/10 text-destructive border border-destructive/30",
  [OrderStatus.fully_completed]:
    "bg-muted text-muted-foreground border border-border",
  // DriverStatus
  [DriverStatus.online]: "bg-primary/10 text-primary border border-primary/30",
  [DriverStatus.offline]: "bg-muted text-muted-foreground",
};

const STATUS_KEY_MAP: Record<BadgeStatus, StringKey> = {
  // OrderStatus
  [OrderStatus.pending]: "status_pending",
  [OrderStatus.matched]: "status_matched",
  [OrderStatus.accepted]: "status_accepted",
  [OrderStatus.en_route]: "status_en_route",
  [OrderStatus.pumping]: "status_pumping",
  [OrderStatus.completed]: "status_completed",
  [OrderStatus.expired]: "status_expired",
  [OrderStatus.cancelled]: "status_cancelled",
  [OrderStatus.exception]: "status_exception",
  [OrderStatus.fully_completed]: "status_fully_completed",
  // DriverStatus
  [DriverStatus.online]: "status_online",
  [DriverStatus.offline]: "status_offline",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useLang();
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${STATUS_CLASSES[status]}`}
    >
      {t(STATUS_KEY_MAP[status])}
    </span>
  );
}
