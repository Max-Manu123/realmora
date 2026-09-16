import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Compass, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { LanguageToggle, ThemeToggle } from "@/components/LanguageThemeControls";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to MapCraft" },
      { name: "description", content: "Log in or create a free MapCraft account to build and share fantasy maps." },
      { property: "og:title", content: "Sign in to MapCraft" },
      { property: "og:description", content: "Log in or create a free MapCraft account to build and share fantasy maps." },
    ],
  }),
  component: AuthPage,
});

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [forgot, setForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") navigate({ to: "/dashboard", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const reset = () => {
    setError(null);
    setNotice(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!emailRe.test(email)) return setError(t("auth.invalidEmail"));
    if (password.length < 6) return setError(t("auth.shortPassword"));
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) return setError(err.message);
    track("login");
    navigate({ to: "/dashboard", replace: true });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!emailRe.test(email)) return setError(t("auth.invalidEmail"));
    if (password.length < 6) return setError(t("auth.shortPassword"));
    if (password !== confirm) return setError(t("auth.mismatch"));
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (err) return setError(err.message);
    track("sign_up");
    if (data.session) {
      navigate({ to: "/dashboard", replace: true });
      return;
    }
    setNotice(t("auth.checkEmail"));
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!emailRe.test(email)) return setError(t("auth.invalidEmail"));
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setNotice(t("auth.resetSent"));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Compass className="h-5 w-5 text-primary" />
          MapCraft
        </Link>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <Card className="w-full max-w-md border-border bg-card">
          <CardContent className="pt-6">
            <h1 className="mb-1 text-center text-2xl font-semibold">{t("auth.title")}</h1>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              {t("brand.tagline")}
            </p>

            {forgot ? (
              <form onSubmit={handleForgot} className="space-y-4">
                <h2 className="text-base font-semibold">{t("auth.forgotTitle")}</h2>
                <div className="space-y-1.5">
                  <Label htmlFor="fp-email">{t("auth.email")}</Label>
                  <Input
                    id="fp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {notice && <p className="text-sm text-primary">{notice}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("auth.sendReset")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setForgot(false);
                    reset();
                  }}
                >
                  {t("auth.backToLogin")}
                </Button>
              </form>
            ) : (
              <Tabs
                value={mode}
                onValueChange={(v) => {
                  setMode(v as "login" | "register");
                  reset();
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                  <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email">{t("auth.email")}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="login-password">{t("auth.password")}</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {notice && <p className="text-sm text-primary">{notice}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? t("auth.loggingIn") : t("auth.login")}
                    </Button>
                    <button
                      type="button"
                      className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      onClick={() => {
                        setForgot(true);
                        reset();
                      }}
                    >
                      {t("auth.forgot")}
                    </button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-email">{t("auth.email")}</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-password">{t("auth.password")}</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-confirm">{t("auth.confirmPassword")}</Label>
                      <Input
                        id="reg-confirm"
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {notice && <p className="text-sm text-primary">{notice}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {loading ? t("auth.creating") : t("auth.register")}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
