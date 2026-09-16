# Map Weaver

Build MapCraft — a visual 2D fantasy/TTRPG world map creation web app.

Core Requirements & Architecture:
1. Backend & Data (Lovable Cloud / Supabase):
   - Tables with RLS:
     - `profiles`: id (uuid references auth.users), email, created_at
     - `maps`: id (uuid), user_id (uuid references auth.users), name (text), type (text: 'World' | 'Region' | 'Dungeon'), is_public (boolean default false), share_slug (text unique nullable), background_color (text default '#131722'), created_at, updated_at
     - `map_elements`: id (uuid), map_id (uuid references maps on delete cascade), type (text: 'mountain' | 'forest' | 'water' | 'city' | 'castle' | 'road' | 'marker'), x (numeric), y (numeric), width (numeric), height (numeric), name (text nullable), description (text nullable), points (jsonb nullable for roads/paths), created_at, updated_at (OR store elements in maps.elements jsonb if simpler and reliable)
     - `pro_waitlist`: id (uuid), email (text unique), created_at
   - Strict RLS: Users can only select/insert/update/delete their own maps and elements. Anyone (public anon) can read maps and elements where `is_public = true` via `share_slug`.

2. Authentication (/auth):
   - Supabase email/password sign-up, login, logout, password recovery, session restoration.
   - Polished auth form with tab switching, validation, error/loading feedback.

3. Routes:
   - `/`: Marketing landing page (Hero with fantasy map visual preview, CTAs "Create Your Map" & "Explore an Example", How it Works, Features, Interactive Example Map preview, Use Cases, Pro section with $5/mo waitlist CTA, Footer with language & theme selector).
   - `/auth`: Login / Register / Forgot password.
   - `/dashboard`: Map library, search, map count badge (e.g. 1/3 free maps used), "Create Map" modal (name, type: World/Region/Dungeon), map cards with open, rename, delete (with confirmation dialog), share. Enforce 3-map free limit with "Join Pro Waitlist" modal.
   - `/maps/:id`: Full 2D Map Editor.
     - Top bar: branding, map name editable, debounced autosave status indicator (Saving... / Saved / Save failed retry), undo/redo buttons with active history tracking, Share button, Back to dashboard.
     - Left Toolbar: Select, Mountain, Forest, Water, City, Castle, Road, Marker tools. Active tool highlight.
     - Main Canvas: 2D rendering (SVG or Canvas) with smooth pan, zoom (with min/max clamps), element placement, element selection, drag/reposition, delete element.
     - Right Properties Panel: For selected City, Castle, or Marker (or any element), allow editing Name and Description (e.g. "Eldoria", lore notes), coordinates/size, and Delete Element button. Empty state when nothing is selected.
   - `/play/:shareSlug`: Public read-only viewer for shared maps. Visitors can pan, zoom, click on locations/markers to view names and lore descriptions in a popover or details sheet. Has "Create Your Own Map" CTA leading to /auth or /dashboard.
   - `/settings`: Appearance (Light/Dark/System), Language (English / Portuguese), Account info, Logout.

4. Public Sharing:
   - Share modal on dashboard & editor: Toggle Public/Private, generate unique clean slug (e.g., `eldoria-x9k2`), Copy Link button (with "Link copied!" feedback), "Open Map" button.

5. Pro Waitlist:
   - Modal triggered from landing page, dashboard limit warning, or settings: "MapCraft Pro — $5/month", benefits list (unlimited maps, private maps, HD export), email input with validation, saves to `pro_waitlist` table, handles duplicate emails gracefully.

6. Visuals & Themes:
   - Dark theme primary: Background #0F1117, Panels #171A23, Borders #272B36, Primary text #F5F7FA, Secondary text #A7ACB8, Accent #7C5CFC (purple/indigo).
   - Light theme supported with subtle neutral borders and #7C5CFC accent.
   - All map elements use cohesive fantasy vector SVG styling (custom icons/shapes for mountains, trees, water waves, towers/castles, walled cities, flags/markers, styled road paths).

7. Internationalization (i18n):
   - English and Portuguese (pt-BR) support with translation dictionary and language switcher in header/footer/settings.

8. Analytics:
   - Safe client-side analytics event logging helper (sign_up, login, map_created, map_opened, element_added, element_deleted, map_saved, map_shared, public_map_viewed, pro_clicked, pro_waitlist_joined, free_limit_reached) that never throws or blocks UI.

Ensure all buttons, navigation flows, modals, and persistence work completely without any mock data or dead placeholders.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://realmora.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/561ac9d7-bdea-40a3-8161-92c7e809f309).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
