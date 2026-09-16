import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";

export function ProWaitlistDialog({
  open,
  onOpenChange,
  defaultEmail = "",
  source = "landing",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
  source?: string;
}) {
  const { t } = useI18n();
  const [email, setEmail] = useState(defaultEmail);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "already" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(t("auth.invalidEmail"));
      return;
    }
    setError(null);
    setStatus("loading");
    const { error: insertError } = await supabase.from("pro_waitlist").insert({ email: value });
    if (insertError) {
      if (insertError.code === "23505") {
        setStatus("already");
        return;
      }
      setStatus("error");
      setError(t("common.error"));
      return;
    }
    track("pro_waitlist_joined", { source });
    setStatus("done");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setStatus("idle");
          setError(null);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("pro.title")}
          </DialogTitle>
          <DialogDescription>{t("pro.body")}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 text-sm">
          {(["pro.b1", "pro.b2", "pro.b3", "pro.b4"] as const).map((key) => (
            <li key={key} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{t(key)}</span>
            </li>
          ))}
        </ul>

        {status === "done" || status === "already" ? (
          <p className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-foreground">
            {status === "done" ? t("pro.joined") : t("pro.already")}
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="pro-email">{t("pro.email")}</Label>
              <Input
                id="pro-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={status === "loading"}>
              {status === "loading" ? t("pro.joining") : t("pro.join")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
