# MapCraft — 2D fantasy world map builder

A full app for creating, editing, and sharing fantasy/TTRPG maps, with accounts, saved maps, public share links, dark/light themes, and English + Portuguese.

## What gets built

**Landing page (/)**
Hero with an animated fantasy map preview, "Create Your Map" and "Explore an Example" buttons, How it Works, Features, a live interactive example map, Use Cases, a Pro section ($5/month waitlist), and a footer with language + theme switchers.

**Accounts (/auth)**
Sign up, log in, log out, forgot password, and staying signed in between visits. One polished form with tabs, inline validation, and clear error/loading states.

**Dashboard (/dashboard)**
Your map library with search, a counter such as "1 / 3 free maps used", a Create Map dialog (name + World/Region/Dungeon), and cards with open, rename, delete (with confirmation), and share. Hitting 3 maps opens the Pro waitlist.

**Map editor (/maps/:id)**
- Top bar: map name you can edit inline, autosave indicator (Saving… / Saved / Save failed — Retry), undo/redo, Share, back to dashboard.
- Left toolbar: Select, Mountain, Forest, Water, City, Castle, Road, Marker — active tool highlighted.
- Canvas: smooth pan and zoom with limits, place elements by clicking, select and drag them, delete with keyboard or panel.
- Right panel: edit the selected element's name, lore description, position and size, plus Delete. Friendly empty state when nothing is selected.

**Public viewer (/play/:slug)**
Read-only shared map. Visitors pan, zoom, and click locations to read names and lore in a details panel, plus a "Create Your Own Map" call to action.

**Settings (/settings)**
Theme (Light / Dark / System), language (English / Português), account info, log out.

**Sharing**
A share dialog in both the dashboard and the editor: public/private toggle, an auto-generated clean link like `eldoria-x9k2`, Copy Link with "Link copied!" feedback, and Open Map.

**Pro waitlist**
Dialog from the landing page, the map limit warning, or settings: benefits list, email field with validation, saved to the waitlist, duplicate emails handled gracefully.

## Look and feel

Dark theme by default: background #0F1117, panels #171A23, borders #272B36, text #F5F7FA / #A7ACB8, accent purple #7C5CFC. Light theme uses the same accent with soft neutral borders. All map art is hand-built vector artwork — layered mountains, clustered trees, wave-textured water, towered castles, walled cities, banner markers, and tapered road paths — so maps look like one illustrated world rather than clip art.

## Technical notes

- Lovable Cloud (Supabase) provides the database and accounts. Tables: `profiles`, `maps`, `map_elements`, `pro_waitlist`, each with row-level security so people only reach their own maps; anonymous readers can load only maps flagged public, by slug. A trigger creates a profile on sign-up; email/password sign-in is enabled.
- Editor state is local for instant feedback, with a debounced save (~800ms) writing changed elements; undo/redo keeps a bounded in-memory history stack.
- Canvas is SVG with a viewBox-driven pan/zoom transform, clamped between 0.25x and 4x.
- Routes: `src/routes/index.tsx`, `auth.tsx`, `_authenticated/dashboard.tsx`, `_authenticated/maps.$id.tsx`, `_authenticated/settings.tsx`, `play.$slug.tsx` (public, server-side loaded for previews).
- i18n via a lightweight dictionary + context, language stored locally; theme via a class-based provider.
- Analytics helper wraps every event in try/catch so it can never break the UI.

## Build order

1. Enable Lovable Cloud, create tables, security rules, and the profile trigger.
2. Theme tokens, i18n, analytics helper, shared layout chrome.
3. Auth + dashboard + create/rename/delete/share flows.
4. Map editor: canvas, tools, artwork, properties panel, autosave, undo/redo.
5. Public viewer, landing page, settings, Pro waitlist.
6. Click through every flow in the browser and fix what breaks.
