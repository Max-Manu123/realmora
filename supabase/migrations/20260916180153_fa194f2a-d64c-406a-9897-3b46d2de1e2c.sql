CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'World',
  is_public boolean NOT NULL DEFAULT false,
  share_slug text UNIQUE,
  background_color text NOT NULL DEFAULT '#131722',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX maps_user_id_idx ON public.maps(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maps TO authenticated;
GRANT SELECT ON public.maps TO anon;
GRANT ALL ON public.maps TO service_role;
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maps_owner_all" ON public.maps FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "maps_public_read_anon" ON public.maps FOR SELECT TO anon USING (is_public = true AND share_slug IS NOT NULL);
CREATE POLICY "maps_public_read_auth" ON public.maps FOR SELECT TO authenticated USING (is_public = true AND share_slug IS NOT NULL);

CREATE TABLE public.map_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id uuid NOT NULL REFERENCES public.maps(id) ON DELETE CASCADE,
  type text NOT NULL,
  x numeric NOT NULL DEFAULT 0,
  y numeric NOT NULL DEFAULT 0,
  width numeric NOT NULL DEFAULT 80,
  height numeric NOT NULL DEFAULT 80,
  name text,
  description text,
  points jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX map_elements_map_id_idx ON public.map_elements(map_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.map_elements TO authenticated;
GRANT SELECT ON public.map_elements TO anon;
GRANT ALL ON public.map_elements TO service_role;
ALTER TABLE public.map_elements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "elements_owner_all" ON public.map_elements FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.maps m WHERE m.id = map_id AND m.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.maps m WHERE m.id = map_id AND m.user_id = auth.uid()));
CREATE POLICY "elements_public_read_anon" ON public.map_elements FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.maps m WHERE m.id = map_id AND m.is_public = true AND m.share_slug IS NOT NULL));
CREATE POLICY "elements_public_read_auth" ON public.map_elements FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.maps m WHERE m.id = map_id AND m.is_public = true AND m.share_slug IS NOT NULL));

CREATE TABLE public.pro_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.pro_waitlist TO anon, authenticated;
GRANT ALL ON public.pro_waitlist TO service_role;
ALTER TABLE public.pro_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "waitlist_insert_anyone" ON public.pro_waitlist FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER maps_set_updated_at BEFORE UPDATE ON public.maps FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER map_elements_set_updated_at BEFORE UPDATE ON public.map_elements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();