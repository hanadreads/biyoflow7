// App shell: header with branding + lang toggle, and footer.
import { useLang } from "@/i18n/index";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  /** Optional extra class on the main element */
  className?: string;
  /** Hide footer (e.g. auth page) */
  hideFooter?: boolean;
}

export function Layout({
  children,
  className = "",
  hideFooter = false,
}: LayoutProps) {
  const { t, lang, setLang } = useLang();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[480px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Water drop icon — inline SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6 text-primary fill-current"
              aria-hidden="true"
            >
              <path d="M12 2C12 2 4 10 4 15a8 8 0 0 0 16 0c0-5-8-13-8-13z" />
            </svg>
            <span className="font-display font-bold text-base text-foreground tracking-tight">
              {t("app_name")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "so" : "en")}
            className="text-xs font-mono text-muted-foreground hover:text-foreground border border-border rounded px-2 py-1 transition-colors duration-200"
            data-ocid="lang_toggle"
            aria-label={`Switch to ${lang === "en" ? "Somali" : "English"}`}
          >
            {t("lang_toggle")}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className={`flex-1 ${className}`}>{children}</main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="bg-muted/40 border-t border-border py-3">
          <div className="max-w-[480px] mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()}.{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                Built with love using caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
