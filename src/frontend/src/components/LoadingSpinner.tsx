// Small inline spinner for async operations.
interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md";
}

export function LoadingSpinner({ label, size = "md" }: LoadingSpinnerProps) {
  const dim = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <svg
        className={`${dim} animate-spin`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}
