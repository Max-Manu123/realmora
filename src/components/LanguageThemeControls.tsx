import { Languages, Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => setLang(lang === "en" ? "pt" : "en")}
      aria-label="Change language"
    >
      <Languages className="mr-2 h-4 w-4" />
      {lang === "en" ? "EN" : "PT"}
    </Button>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolved } = useTheme();
  const next = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
  const Icon = theme === "system" ? Monitor : resolved === "dark" ? Moon : Sun;
  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() => setTheme(next)}
      aria-label="Change theme"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
