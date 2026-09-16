import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MapIcon, Pencil, Plus, Search, Share2, Sparkles, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppHeader } from "@/components/AppHeader";
import { ShareDialog } from "@/components/ShareDialog";
import { ProWaitlistDialog } from "@/components/ProWaitlistDialog";
import { MapDefs, ElementShape } from "@/components/map/MapArt";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { FREE_MAP_LIMIT, type MapRecord, type MapType } from "@/lib/map-types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const TYPE_ART: Record<MapType, "mountain" | "forest" | "castle"> = {
  World: "mountain",
  Region: "forest",
  Dungeon: "castle",
};

function MapThumb({ type }: { type: MapType }) {
  return (
    <svg viewBox="0 0 200 110" className="h-28 w-full" style={{ backgroundColor: "#131722" }}>
      <MapDefs />
      <g transform="translate(20,12) scale(0.75)">
        <ElementShape type={TYPE_ART[type]} w={120} h={100} />
      </g>
      <g transform="translate(120,30) scale(0.55)">
        <ElementShape type="city" w={110} h={90} />
      </g>
    </svg>
  );
}

function DashboardPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<MapType>("World");
  const [renameTarget, setRenameTarget] = useState<MapRecord | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<MapRecord | null>(null);
  const [shareTarget, setShareTarget] = useState<MapRecord | null>(null);
  const [proOpen, setProOpen] = useState(false);

  const mapsQuery = useQuery({
    queryKey: ["maps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maps")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MapRecord[];
    },
  });

  const maps = useMemo(() => mapsQuery.data ?? [], [mapsQuery.data]);
  const filtered = useMemo(
    () => maps.filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase())),
    [maps, search],
  );
  const atLimit = maps.length >= FREE_MAP_LIMIT;

  const createMap = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("no user");
      const { data, error } = await supabase
        .from("maps")
        .insert({ name: newName.trim() || "Untitled world", type: newType, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data as MapRecord;
    },
    onSuccess: (map) => {
      track("map_created", { type: map.type });
      setCreateOpen(false);
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["maps"] });
      navigate({ to: "/maps/$id", params: { id: map.id } });
    },
    onError: () => toast.error(t("common.error")),
  });

  const renameMap = useMutation({
    mutationFn: async () => {
      if (!renameTarget) return;
      const { error } = await supabase
        .from("maps")
        .update({ name: renameValue.trim() || renameTarget.name })
        .eq("id", renameTarget.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setRenameTarget(null);
      queryClient.invalidateQueries({ queryKey: ["maps"] });
    },
    onError: () => toast.error(t("common.error")),
  });

  const deleteMap = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) return;
      const { error } = await supabase.from("maps").delete().eq("id", deleteTarget.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["maps"] });
    },
    onError: () => toast.error(t("common.error")),
  });

  const onCreateClick = () => {
    if (atLimit) {
      track("free_limit_reached");
      setProOpen(true);
      return;
    }
    setCreateOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{t("dash.title")}</h1>
            <Badge variant={atLimit ? "destructive" : "secondary"} className="mt-2">
              {t("dash.mapsUsed", { used: maps.length, total: FREE_MAP_LIMIT })}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-56 pl-9"
                placeholder={t("dash.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={onCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              {t("dash.create")}
            </Button>
          </div>
        </div>

        {atLimit && (
          <Card className="mb-6 border-primary/40 bg-primary/5">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{t("dash.limitTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("dash.limitBody")}</p>
              </div>
              <Button
                onClick={() => {
                  track("pro_clicked", { source: "dashboard_limit" });
                  setProOpen(true);
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t("landing.proCta")}
              </Button>
            </CardContent>
          </Card>
        )}

        {mapsQuery.isLoading ? (
          <div className="flex items-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("dash.loading")}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
            <MapIcon className="mx-auto mb-3 h-8 w-8 opacity-60" />
            {maps.length === 0 ? t("dash.empty") : t("dash.noResults")}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((map) => (
              <Card key={map.id} className="overflow-hidden border-border bg-card pt-0">
                <MapThumb type={map.type} />
                <CardContent className="space-y-3 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold">{map.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {t(`type.${map.type}` as "type.World")}
                        {map.is_public ? " · " + t("share.public") : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        track("map_opened", { map_id: map.id });
                        navigate({ to: "/maps/$id", params: { id: map.id } });
                      }}
                    >
                      {t("dash.open")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRenameTarget(map);
                        setRenameValue(map.name);
                      }}
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" />
                      {t("dash.rename")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShareTarget(map)}>
                      <Share2 className="mr-1.5 h-3.5 w-3.5" />
                      {t("dash.share")}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(map)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      {t("dash.delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dash.newMapTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="map-name">{t("dash.mapName")}</Label>
              <Input
                id="map-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Eldoria"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dash.mapType")}</Label>
              <Select value={newType} onValueChange={(v) => setNewType(v as MapType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="World">{t("type.World")}</SelectItem>
                  <SelectItem value="Region">{t("type.Region")}</SelectItem>
                  <SelectItem value="Dungeon">{t("type.Dungeon")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              {t("dash.cancel")}
            </Button>
            <Button onClick={() => createMap.mutate()} disabled={createMap.isPending}>
              {createMap.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("dash.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename */}
      <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dash.renameTitle")}</DialogTitle>
          </DialogHeader>
          <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>
              {t("dash.cancel")}
            </Button>
            <Button onClick={() => renameMap.mutate()} disabled={renameMap.isPending}>
              {t("dash.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dash.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dash.deleteBody", { name: deleteTarget?.name ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dash.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteMap.mutate();
              }}
            >
              {t("dash.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShareDialog
        map={shareTarget}
        open={!!shareTarget}
        onOpenChange={(o) => !o && setShareTarget(null)}
        onUpdated={(updated) => {
          setShareTarget(updated);
          queryClient.invalidateQueries({ queryKey: ["maps"] });
        }}
      />
      <ProWaitlistDialog open={proOpen} onOpenChange={setProOpen} source="dashboard" />
      <DialogDescription className="sr-only">MapCraft dashboard</DialogDescription>
    </div>
  );
}
