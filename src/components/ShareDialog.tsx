import { useState } from "react";
import { Copy, ExternalLink, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { slugify, type MapRecord } from "@/lib/map-types";
import { track } from "@/lib/analytics";
import { toast } from "sonner";

export function ShareDialog({
  map,
  open,
  onOpenChange,
  onUpdated,
}: {
  map: MapRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (map: MapRecord) => void;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!map) return null;

  const shareUrl =
    map.share_slug && typeof window !== "undefined"
      ? `${window.location.origin}/play/${map.share_slug}`
      : "";

  const togglePublic = async (next: boolean) => {
    setBusy(true);
    const slug = map.share_slug ?? slugify(map.name);
    const { data, error } = await supabase
      .from("maps")
      .update({ is_public: next, share_slug: slug })
      .eq("id", map.id)
      .select()
      .single();
    setBusy(false);
    if (error || !data) {
      toast.error(t("common.error"));
      return;
    }
    onUpdated(data as MapRecord);
    if (next) track("map_shared", { map_id: map.id });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* ignore */
    }
    setCopied(true);
    toast.success(t("share.copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("share.title")}</DialogTitle>
          <DialogDescription>
            {map.is_public ? t("share.publicHint") : t("share.privateHint")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3">
          <Label htmlFor="share-public" className="cursor-pointer">
            {t("share.public")}
          </Label>
          <Switch
            id="share-public"
            checked={map.is_public}
            disabled={busy}
            onCheckedChange={togglePublic}
          />
        </div>

        {map.is_public && map.share_slug && (
          <div className="space-y-3">
            <Input readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} />
            <div className="flex gap-2">
              <Button onClick={copy} className="flex-1">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? t("share.copied") : t("share.copy")}
              </Button>
              <Button variant="outline" asChild>
                <a href={`/play/${map.share_slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("share.open")}
                </a>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
