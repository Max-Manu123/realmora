import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass, Crosshair, Loader2, ZoomIn, ZoomOut, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MapCanvas, type CanvasHandle } from "@/components/map/MapCanvas";
import { LanguageToggle, ThemeToggle } from "@/components/LanguageThemeControls";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import type { ElementType, MapElement, MapRecord } from "@/lib/map-types";

export const Route = createFileRoute("/play/$slug")({
  head: () => ({
    meta: [
      { title: "A shared world — MapCraft" },
      { name: "description", content: "Explore a fantasy world map shared with MapCraft. Pan, zoom and read the lore behind every location." },
      { property: "og:title", content: "A shared world — MapCraft" },
      { property: "og:description", content: "Explore a fantasy world map shared with MapCraft. Pan, zoom and read the lore behind every location." },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const { slug } = useParams({ from: "/play/$slug" });
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<CanvasHandle | null>(null);

  const query = useQuery({
    queryKey: ["public-map", slug],
    queryFn: async () => {
      const { data: mapData } = await supabase
        .from("maps")
        .select("*")
        .eq("share_slug", slug)
        .eq("is_public", true)
        .maybeSingle();
      if (!mapData) return null;
      const record = mapData as MapRecord;
      const { data: els } = await supabase.from("map_elements").select("*").eq("map_id", record.id);
      const elements: MapElement[] = (els ?? []).map((row) => ({
        id: row.id,
        map_id: row.map_id,
        type: row.type as ElementType,
        x: Number(row.x),
        y: Number(row.y),
        width: Number(row.width),
        height: Number(row.height),
        name: row.name,
        description: row.description,
        points: (row.points as { x: number; y: number }[] | null) ?? null,
      }));
      return { map: record, elements };
    },
  });

  useEffect(() => {
    if (query.data?.map) track("public_map_viewed", { slug });
  }, [query.data?.map, slug]);

  const selected = useMemo(
    () => query.data?.elements.find((e) => e.id === selectedId) ?? null,
    [query.data, selectedId],
  );

  if (query.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {t("dash.loading")}
      </div>
    );
  }

  if (!query.data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-muted-foreground">{t("play.notFound")}</p>
        <Button asChild>
          <Link to="/">{t("play.cta")}</Link>
        </Button>
      </div>
    );
  }

  const { map, elements } = query.data;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
        <Link to="/" className="flex items-center gap-2 font-display font-semibold">
          <Compass className="h-5 w-5 text-primary" />
          MapCraft
        </Link>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold">{map.name}</p>
          <p className="truncate text-xs text-muted-foreground">{t("play.by")}</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <Button size="sm" asChild>
            <Link to="/auth">{t("play.cta")}</Link>
          </Button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <MapCanvas
          elements={elements}
          backgroundColor={map.background_color}
          selectedId={selectedId}
          onSelect={setSelectedId}
          readOnly
          handleRef={canvasRef}
        />
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow">
          {t("play.clickHint")}
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1 rounded-lg border border-border bg-card/90 p-1 shadow">
          <Button variant="ghost" size="icon" onClick={() => canvasRef.current?.zoomBy(1 / 1.25)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => canvasRef.current?.resetView()}>
            <Crosshair className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => canvasRef.current?.zoomBy(1.25)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {selected && (
          <div className="absolute right-3 top-3 w-72 rounded-xl border border-border bg-card p-4 shadow-lg">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-primary">
                  {t(`tool.${selected.type}` as "tool.city")}
                </p>
                <h2 className="font-display text-lg font-semibold">
                  {selected.name || t("editor.namePlaceholder")}
                </h2>
              </div>
              <button onClick={() => setSelectedId(null)} aria-label="Close">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {selected.description || t("play.noLore")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
