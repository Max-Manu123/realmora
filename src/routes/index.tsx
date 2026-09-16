import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  MousePointerClick,
  Layers,
  Save,
  ScrollText,
  Share2,
  Palette,
  Sparkles,
  Swords,
  BookOpen,
  Gamepad2,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapCanvas } from "@/components/map/MapCanvas";
import { ProWaitlistDialog } from "@/components/ProWaitlistDialog";
import { LanguageToggle, ThemeToggle } from "@/components/LanguageThemeControls";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import type { MapElement } from "@/lib/map-types";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MapCraft — Build and share fantasy world maps" },
      {
        name: "description",
        content:
          "MapCraft is a 2D fantasy map editor for TTRPG worlds, regions and dungeons. Place mountains, cities and roads, add lore, and share a public link.",
      },
      { property: "og:title", content: "MapCraft — Build and share fantasy world maps" },
      {
        property: "og:description",
        content:
          "MapCraft is a 2D fantasy map editor for TTRPG worlds, regions and dungeons. Place mountains, cities and roads, add lore, and share a public link.",
      },
    ],
  }),
  component: LandingPage,
});

function demoElement(
  id: string,
  type: MapElement["type"],
  x: number,
  y: number,
  width: number,
  height: number,
  name?: string,
  description?: string,
  points?: { x: number; y: number }[],
): MapElement {
  return {
    id,
    map_id: "demo",
    type,
    x,
    y,
    width,
    height,
    name: name ?? null,
    description: description ?? null,
    points: points ?? null,
  };
}

const DEMO_EN: MapElement[] = [
  demoElement("w1", "water", 620, 430, 320, 210),
  demoElement("m1", "mountain", 200, 180, 190, 150, "Ironspine Peaks", "Snow never leaves these ridges. The dwarven road climbs through Grey Pass on the eastern slope."),
  demoElement("m2", "mountain", 350, 240, 150, 120),
  demoElement("f1", "forest", 230, 430, 180, 140, "Thornwood", "Old growth, older grudges. Travellers keep to the road after dusk."),
  demoElement("f2", "forest", 780, 200, 150, 120),
  demoElement(
    "r1",
    "road",
    0,
    0,
    0,
    0,
    "The King's Road",
    undefined,
    [
      { x: 180, y: 520 },
      { x: 380, y: 470 },
      { x: 520, y: 330 },
      { x: 700, y: 250 },
      { x: 880, y: 300 },
    ],
  ),
  demoElement("c1", "city", 520, 310, 120, 96, "Eldoria", "A city of silver spires ruled by the Pale Council. Its markets never close, and neither do its debts."),
  demoElement("k1", "castle", 880, 300, 110, 110, "Castle Vhorn", "A black keep on a salt cliff. The banner has not changed in nine hundred years."),
  demoElement("p1", "marker", 300, 600, 56, 72, "The Sunken Shrine", "Locals leave coins here. Nobody agrees on what answers them."),
];

function LandingPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [proOpen, setProOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>("c1");
  const exampleRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => DEMO_EN.find((e) => e.id === selectedId) ?? null, [selectedId]);
  const startHref = user ? "/dashboard" : "/auth";

  const features: { icon: typeof Layers; title: TranslationKey; body: TranslationKey }[] = [
    { icon: Palette, title: "landing.f1Title", body: "landing.f1Body" },
    { icon: MousePointerClick, title: "landing.f2Title", body: "landing.f2Body" },
    { icon: Save, title: "landing.f3Title", body: "landing.f3Body" },
    { icon: ScrollText, title: "landing.f4Title", body: "landing.f4Body" },
    { icon: Share2, title: "landing.f5Title", body: "landing.f5Body" },
    { icon: Layers, title: "landing.f6Title", body: "landing.f6Body" },
  ];

  const steps: { title: TranslationKey; body: TranslationKey }[] = [
    { title: "landing.how1Title", body: "landing.how1Body" },
    { title: "landing.how2Title", body: "landing.how2Body" },
    { title: "landing.how3Title", body: "landing.how3Body" },
    { title: "landing.how4Title", body: "landing.how4Body" },
  ];

  const useCases: { icon: typeof Swords; title: TranslationKey; body: TranslationKey }[] = [
    { icon: Swords, title: "landing.uc1", body: "landing.uc1Body" },
    { icon: BookOpen, title: "landing.uc2", body: "landing.uc2Body" },
    { icon: Gamepad2, title: "landing.uc3", body: "landing.uc3Body" },
    { icon: GraduationCap, title: "landing.uc4", body: "landing.uc4Body" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <Compass className="h-5 w-5 text-primary" />
            MapCraft
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground">{t("nav.how")}</a>
            <a href="#features" className="hover:text-foreground">{t("nav.features")}</a>
            <a href="#example" className="hover:text-foreground">{t("nav.example")}</a>
            <a href="#pro" className="hover:text-foreground">{t("nav.pro")}</a>
          </nav>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
            <Button size="sm" asChild>
              <Link to={startHref}>{user ? t("nav.dashboard") : t("nav.signIn")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {t("brand.tagline")}
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{t("landing.heroTitle")}</h1>
            <p className="mt-4 max-w-xl text-muted-foreground">{t("landing.heroSubtitle")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to={startHref}>
                  {t("landing.ctaPrimary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => exampleRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                {t("landing.ctaSecondary")}
              </Button>
            </div>
          </div>
          <div className="glow-primary h-80 overflow-hidden rounded-2xl border border-border lg:h-[26rem]">
            <MapCanvas
              elements={DEMO_EN}
              backgroundColor="#131722"
              readOnly
              autoFit
              onSelect={setSelectedId}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-semibold sm:text-3xl">{t("landing.howTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Card key={step.title} className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
                  {i + 1}
                </div>
                <h3 className="mb-1 text-base font-semibold">{t(step.title)}</h3>
                <p className="text-sm text-muted-foreground">{t(step.body)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-semibold sm:text-3xl">{t("landing.featuresTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="border-border bg-card">
                <CardContent className="pt-6">
                  <Icon className="mb-3 h-6 w-6 text-primary" />
                  <h3 className="mb-1 text-base font-semibold">{t(title)}</h3>
                  <p className="text-sm text-muted-foreground">{t(body)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive example */}
      <section id="example" ref={exampleRef} className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-2 text-2xl font-semibold sm:text-3xl">{t("landing.exampleTitle")}</h2>
        <p className="mb-6 text-muted-foreground">{t("landing.exampleBody")}</p>
        <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
          <div className="h-[28rem] overflow-hidden rounded-2xl border border-border">
            <MapCanvas
              elements={DEMO_EN}
              backgroundColor="#131722"
              readOnly
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              {selected ? (
                <>
                  <p className="text-xs uppercase tracking-wide text-primary">
                    {t(`tool.${selected.type}` as TranslationKey)}
                  </p>
                  <h3 className="mb-2 font-display text-xl font-semibold">
                    {selected.name || t("editor.namePlaceholder")}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selected.description || t("play.noLore")}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t("play.clickHint")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-8 text-2xl font-semibold sm:text-3xl">{t("landing.useCasesTitle")}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map(({ icon: Icon, title, body }) => (
              <Card key={title} className="border-border bg-card">
                <CardContent className="pt-6">
                  <Icon className="mb-3 h-6 w-6 text-primary" />
                  <h3 className="mb-1 text-base font-semibold">{t(title)}</h3>
                  <p className="text-sm text-muted-foreground">{t(body)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pro */}
      <section id="pro" className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h2 className="text-2xl font-semibold sm:text-3xl">{t("landing.proTitle")}</h2>
        <p className="mt-2 font-display text-4xl font-bold text-primary">{t("landing.proPrice")}</p>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("landing.proBody")}</p>
        <Button
          size="lg"
          className="mt-6"
          onClick={() => {
            track("pro_clicked", { source: "landing" });
            setProOpen(true);
          }}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {t("landing.proCta")}
        </Button>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            MapCraft — {t("footer.rights")}
          </div>
          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to={startHref}>{user ? t("nav.dashboard") : t("nav.signIn")}</Link>
            </Button>
          </div>
        </div>
      </footer>

      <ProWaitlistDialog open={proOpen} onOpenChange={setProOpen} source="landing" />
    </div>
  );
}
