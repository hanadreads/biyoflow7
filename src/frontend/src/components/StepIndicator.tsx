// Minimal USSD-style step progress indicator.
import { useLang } from "@/i18n/index";

interface StepIndicatorProps {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  const { t } = useLang();

  return (
    <div
      className="flex items-center gap-3 mb-4"
      aria-label={t("step_of", { current, total })}
    >
      {/* Numeric label */}
      <span className="text-xs font-mono text-muted-foreground shrink-0">
        {t("step_of", { current, total })}
      </span>
      {/* Progress bar */}
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
