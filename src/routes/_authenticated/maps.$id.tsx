import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Loader2,
  MousePointer2,
  Mountain,
  Redo2,
  Share2,
  Trash2,
  TreePine,
  Undo2,
  Waves,
  Castle as CastleIcon,
  Building2,
  Route as RouteIcon,
  Flag,
  ZoomIn,
  ZoomOut,
  Crosshair,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MapCanvas, type CanvasHandle } from "@/components/map/MapCanvas";
import { ShareDialog } from "@/components/ShareDialog";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import {
  DEFAULT_SIZE,
  type ElementType,
  type MapElement,
  type MapRecord,
} from "@/lib/map-types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/maps/$id")({
  component: EditorPage,
});

type Tool = "select" | ElementType;

const TOOLS: { tool: Tool; icon: typeof MousePointer2; label: TranslationKey }[] = [
  { tool: "select", icon: MousePointer2, label: "tool.select" },
  { tool: "mountain", icon: Mountain, label: "tool.mountain" },
  { tool: "forest", icon: TreePine, label: "tool.forest" },
  { tool: "water", icon: Waves, label: "tool.water" },
  { tool: "city", icon: Building2, label: "tool.city" },
  { tool: "castle", icon: CastleIcon, label: "tool.castle" },
  { tool: "road", icon: RouteIcon, label: "tool.road" },
  { tool: "marker", icon: Flag, label: "tool.marker" },
];

type SaveStatus = "idle" | "saving" | "saved" | "error";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function EditorPage() {
  const { id } = useParams({ from: "/_authenticated/maps/$id" });
  const { t } = useI18n();
  const navigate = useNavigate();

  const [map, setMap] = useState<MapRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [elements, setElements] = useState<MapElement[]>([]);
  const [name, setName] = useState("");
  const [tool, setTool] = useState<Tool>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ x: number; y: number }[]>([]);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [shareOpen, setShareOpen] = useState(false);

  const historyRef = useRef<{ stack: MapElement[][]; index: number }>({ stack: [], index: -1 });
  const [historyVersion, setHistoryVersion] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIdsRef = useRef<Set<string>>(new Set());
  const canvasRef = useRef<CanvasHandle | null>(null);
  const dirtyRef = useRef(false);

  // ---------- load ----------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: mapData, error } = await supabase.from("maps").select("*").eq("id", id).maybeSingle();
      if (cancelled) return;
      if (error || !mapData) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const record = mapData as MapRecord;
      const { data: els } = await supabase.from("map_elements").select("*").eq("map_id", id);
      if (cancelled) return;
      const parsed: MapElement[] = (els ?? []).map((row) => ({
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
      setMap(record);
      setName(record.name);
      setElements(parsed);
      savedIdsRef.current = new Set(parsed.map((e) => e.id));
      historyRef.current = { stack: [parsed], index: 0 };
      setHistoryVersion((v) => v + 1);
      setLoading(false);
      track("map_opened", { map_id: id });
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // ---------- history ----------
  const pushHistory = useCallback((next: MapElement[]) => {
    const h = historyRef.current;
    const stack = h.stack.slice(0, h.index + 1);
    stack.push(next);
    const trimmed = stack.slice(-60);
    historyRef.current = { stack: trimmed, index: trimmed.length - 1 };
    setHistoryVersion((v) => v + 1);
  }, []);

  // ---------- saving ----------
  const persist = useCallback(
    async (currentElements: MapElement[], currentName: string) => {
      if (!map) return;
      setStatus("saving");
      try {
        const { error: mapError } = await supabase
          .from("maps")
          .update({ name: currentName.trim() || "Untitled" })
          .eq("id", map.id);
        if (mapError) throw mapError;

        if (currentElements.length > 0) {
          const rows = currentElements.map((e) => ({
            id: e.id,
            map_id: map.id,
            type: e.type,
            x: e.x,
            y: e.y,
            width: e.width,
            height: e.height,
            name: e.name,
            description: e.description,
            points: e.points,
          }));
          const { error: upsertError } = await supabase.from("map_elements").upsert(rows);
          if (upsertError) throw upsertError;
        }

        const keep = new Set(currentElements.map((e) => e.id));
        const removed = [...savedIdsRef.current].filter((existing) => !keep.has(existing));
        if (removed.length > 0) {
          const { error: deleteError } = await supabase
            .from("map_elements")
            .delete()
            .in("id", removed);
          if (deleteError) throw deleteError;
        }

        savedIdsRef.current = keep;
        dirtyRef.current = false;
        setStatus("saved");
        track("map_saved", { map_id: map.id });
      } catch {
        setStatus("error");
      }
    },
    [map],
  );

  const scheduleSave = useCallback(
    (nextElements: MapElement[], nextName: string) => {
      dirtyRef.current = true;
      setStatus("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void persist(nextElements, nextName);
      }, 800);
    },
    [persist],
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const applyElements = useCallback(
    (next: MapElement[], options: { history?: boolean } = { history: true }) => {
      setElements(next);
      if (options.history !== false) pushHistory(next);
      scheduleSave(next, name);
    },
    [pushHistory, scheduleSave, name],
  );

  // ---------- actions ----------
  const placeElement = useCallback(
    (point: { x: number; y: number }) => {
      if (tool === "select" || !map) return;
      if (tool === "road") {
        setDraft((prev) => [...prev, { x: Math.round(point.x), y: Math.round(point.y) }]);
        return;
      }
      const size = DEFAULT_SIZE[tool];
      const element: MapElement = {
        id: newId(),
        map_id: map.id,
        type: tool,
        x: Math.round(point.x),
        y: Math.round(point.y),
        width: size.width,
        height: size.height,
        name: null,
        description: null,
        points: null,
      };
      applyElements([...elements, element]);
      setSelectedId(element.id);
      track("element_added", { type: tool });
    },
    [tool, map, elements, applyElements],
  );

  const finishRoad = useCallback(() => {
    if (draft.length < 2 || !map) {
      setDraft([]);
      return;
    }
    const element: MapElement = {
      id: newId(),
      map_id: map.id,
      type: "road",
      x: draft[0]!.x,
      y: draft[0]!.y,
      width: 0,
      height: 0,
      name: null,
      description: null,
      points: draft,
    };
    applyElements([...elements, element]);
    setSelectedId(element.id);
    setDraft([]);
    track("element_added", { type: "road" });
  }, [draft, map, elements, applyElements]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (typing) return;
      if (tool === "road" && (e.key === "Enter" || e.key === "Escape")) {
        e.preventDefault();
        finishRoad();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        applyElements(elements.filter((el) => el.id !== selectedId));
        setSelectedId(null);
        track("element_deleted");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tool, finishRoad, selectedId, elements, applyElements]);

  const selected = useMemo(
    () => elements.find((el) => el.id === selectedId) ?? null,
    [elements, selectedId],
  );

  const updateSelected = (patch: Partial<MapElement>, withHistory = false) => {
    if (!selected) return;
    const next = elements.map((el) => (el.id === selected.id ? { ...el, ...patch } : el));
    applyElements(next, { history: withHistory });
  };

  const deleteSelected = () => {
    if (!selected) return;
    applyElements(elements.filter((el) => el.id !== selected.id));
    setSelectedId(null);
    track("element_deleted", { type: selected.type });
  };

  const canUndo = historyRef.current.index > 0;
  const canRedo = historyRef.current.index < historyRef.current.stack.length - 1;

  const undo = () => {
    const h = historyRef.current;
    if (h.index <= 0) return;
    h.index -= 1;
    const snapshot = h.stack[h.index]!;
    setElements(snapshot);
    setHistoryVersion((v) => v + 1);
    scheduleSave(snapshot, name);
  };

  const redo = () => {
    const h = historyRef.current;
    if (h.index >= h.stack.length - 1) return;
    h.index += 1;
    const snapshot = h.stack[h.index]!;
    setElements(snapshot);
    setHistoryVersion((v) => v + 1);
    scheduleSave(snapshot, name);
  };

  void historyVersion;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        {t("dash.loading")}
      </div>
    );
  }

  if (notFound || !map) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">{t("editor.notFound")}</p>
        <Button asChild>
          <Link to="/dashboard">{t("editor.back")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{t("editor.back")}</span>
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            dirtyRef.current = true;
            setStatus("saving");
            if (saveTimer.current) clearTimeout(saveTimer.current);
            const nextName = e.target.value;
            saveTimer.current = setTimeout(() => void persist(elements, nextName), 800);
          }}
          className="h-9 w-40 border-transparent bg-transparent font-display text-base font-semibold focus-visible:border-input sm:w-64"
        />
        <div className="flex min-w-24 items-center gap-1.5 text-xs">
          {status === "saving" && (
            <span className="flex items-center text-muted-foreground">
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              {t("editor.saving")}
            </span>
          )}
          {status === "saved" && (
            <span className="flex items-center text-muted-foreground">
              <Check className="mr-1.5 h-3.5 w-3.5 text-primary" />
              {t("editor.saved")}
            </span>
          )}
          {status === "error" && (
            <button
              className="flex items-center text-destructive"
              onClick={() => void persist(elements, name)}
            >
              <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
              {t("editor.saveFailed")} — {t("editor.retry")}
            </button>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title={t("editor.undo")}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} title={t("editor.redo")}>
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => setShareOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t("editor.share")}</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Toolbar */}
        <aside className="flex w-16 shrink-0 flex-col items-center gap-1 border-r border-border bg-card py-3">
          {TOOLS.map(({ tool: toolName, icon: Icon, label }) => (
            <button
              key={toolName}
              title={t(label)}
              onClick={() => {
                if (tool === "road" && toolName !== "road") finishRoad();
                setTool(toolName);
                if (toolName !== "select") setSelectedId(null);
              }}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                tool === toolName && "border-primary/60 bg-primary/15 text-primary",
              )}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </aside>

        {/* Canvas */}
        <div className="relative min-w-0 flex-1">
          <MapCanvas
            elements={elements}
            backgroundColor={map.background_color}
            autoFit
            selectedId={selectedId}
            onSelect={(elementId) => {
              if (tool === "select") setSelectedId(elementId);
            }}
            onPlace={placeElement}
            placing={tool !== "select"}
            draftPoints={tool === "road" ? draft : []}
            onMove={(elementId, x, y) =>
              setElements((prev) =>
                prev.map((el) => (el.id === elementId ? { ...el, x, y } : el)),
              )
            }
            onMoveCommit={() => {
              setElements((prev) => {
                pushHistory(prev);
                scheduleSave(prev, name);
                return prev;
              });
            }}
            handleRef={canvasRef}
          />
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-card/90 px-3 py-1.5 text-xs text-muted-foreground shadow">
            {tool === "road" ? t("editor.roadHint") : t("editor.hint")}
          </div>
          <div className="absolute bottom-3 right-3 flex gap-1 rounded-lg border border-border bg-card/90 p-1 shadow">
            <Button variant="ghost" size="icon" title={t("editor.zoomOut")} onClick={() => canvasRef.current?.zoomBy(1 / 1.25)}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title={t("editor.reset")} onClick={() => canvasRef.current?.resetView()}>
              <Crosshair className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title={t("editor.zoomIn")} onClick={() => canvasRef.current?.zoomBy(1.25)}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Properties */}
        <aside className="hidden w-72 shrink-0 flex-col border-l border-border bg-card p-4 lg:flex">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("editor.props")}
          </h2>
          {!selected ? (
            <p className="text-sm text-muted-foreground">{t("editor.emptyProps")}</p>
          ) : (
            <div className="space-y-4 overflow-y-auto">
              <p className="text-xs uppercase tracking-wide text-primary">
                {t(`tool.${selected.type}` as TranslationKey)}
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="el-name">{t("editor.name")}</Label>
                <Input
                  id="el-name"
                  value={selected.name ?? ""}
                  placeholder={t("editor.namePlaceholder")}
                  onChange={(e) => updateSelected({ name: e.target.value })}
                  onBlur={() => pushHistory(elements)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="el-desc">{t("editor.description")}</Label>
                <Textarea
                  id="el-desc"
                  rows={5}
                  value={selected.description ?? ""}
                  placeholder={t("editor.descPlaceholder")}
                  onChange={(e) => updateSelected({ description: e.target.value })}
                  onBlur={() => pushHistory(elements)}
                />
              </div>
              {selected.type !== "road" && (
                <>
                  <div className="space-y-1.5">
                    <Label>{t("editor.position")}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={Math.round(selected.x)}
                        onChange={(e) => updateSelected({ x: Number(e.target.value) })}
                        onBlur={() => pushHistory(elements)}
                      />
                      <Input
                        type="number"
                        value={Math.round(selected.y)}
                        onChange={(e) => updateSelected({ y: Number(e.target.value) })}
                        onBlur={() => pushHistory(elements)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t("editor.size")}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={20}
                        value={Math.round(selected.width)}
                        onChange={(e) => updateSelected({ width: Math.max(20, Number(e.target.value)) })}
                        onBlur={() => pushHistory(elements)}
                      />
                      <Input
                        type="number"
                        min={20}
                        value={Math.round(selected.height)}
                        onChange={(e) => updateSelected({ height: Math.max(20, Number(e.target.value)) })}
                        onBlur={() => pushHistory(elements)}
                      />
                    </div>
                  </div>
                </>
              )}
              <Button variant="destructive" className="w-full" onClick={deleteSelected}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t("editor.deleteElement")}
              </Button>
            </div>
          )}
        </aside>
      </div>

      <ShareDialog
        map={map}
        open={shareOpen}
        onOpenChange={setShareOpen}
        onUpdated={(updated) => {
          setMap(updated);
          toast.success(updated.is_public ? t("share.publicHint") : t("share.privateHint"));
        }}
      />
    </div>
  );
}
