# br-fridges-web — Multi-Stage Build Guide

Each stage is a self-contained session for an AI agent. Read only the stage you're executing. Prerequisites list what must be done first.

---

## Architecture

```
HugoJF/br-fridges          ← data repo: fridges.json + models/*.md
HugoJF/br-fridges-web      ← this repo: React 19 + Vite SPA → GitHub Pages
```

**Raw data URL:** `https://raw.githubusercontent.com/HugoJF/br-fridges/main/fridges.json`
**Frontend URL:** `https://hugojf.github.io/br-fridges-web/`

Design source: `~/Downloads/b_BE7zozIJ7Ld.zip` — V0 Next.js project (App Router, shadcn/ui, Tailwind v4).
Reference: `/home/hugo/code/br-chairs-web` — existing Vite+React project with same repo split pattern.

---

## Stage 1 — Data Extraction & br-fridges Cleanup

**Goal:** Convert `/home/hugo/code/br-fridges` from a vanilla HTML frontend into a pure data repo.

**Working dir:** `/home/hugo/code/br-fridges`

### Steps

**1. Extract V0 zip**
```bash
unzip ~/Downloads/b_BE7zozIJ7Ld.zip -d /tmp/br-fridges-v0
```

**2. Write `/tmp/convert-fridges.mjs`** to extract data from `index.html` and write `fridges.json`:

```js
import { readFileSync, writeFileSync } from 'fs'
import vm from 'vm'

const html = readFileSync('/home/hugo/code/br-fridges/index.html', 'utf8')
const match = html.match(/const D=(\[[\s\S]*?\]);/)
if (!match) throw new Error('Could not find data array')

const raw = vm.runInNewContext(`(${match[1]})`)

// Old schema: {brand, model, cap, type(c/d/i/s/f), alt, lar, pro, rev(0/1), inv, kwh, pr}
// New schema: Fridge interface from fridge-types.ts
const typeMap = {
  c: 'compact',
  d: 'top-freezer',      // Duplex = freezer on top
  i: 'bottom-freezer',   // Inverse = freezer on bottom
  s: 'side-by-side',
  f: 'french-door',
}

const fridges = raw.map(d => ({
  id: `${d.brand}-${d.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  brand: d.brand,
  model: d.model,
  capacity: d.cap,
  type: typeMap[d.type] ?? d.type,
  width: d.lar,
  height: d.alt,
  depth: d.pro,
  depthWithDoors: null,
  reversibleDoors: d.rev === 1 ? true : d.rev === 0 ? false : null,
  inverterCompressor: d.inv ?? null,
  monthlyKwh: d.kwh ?? null,
  price: d.pr,
}))

writeFileSync('/home/hugo/code/br-fridges/fridges.json', JSON.stringify(fridges, null, 2))
console.log(`Written ${fridges.length} fridges`)
```

Run: `node /tmp/convert-fridges.mjs`

**3. Copy fridge-types.ts as schema reference**
```bash
cp /tmp/br-fridges-v0/lib/fridge-types.ts /home/hugo/code/br-fridges/fridge-types.ts
```

**4. Remove the old HTML frontend from br-fridges**
```bash
cd /home/hugo/code/br-fridges
git rm index.html
git rm .github/workflows/deploy.yml
```

**5. Update `README.md`** — add note that this is now a data repo; frontend at `HugoJF/br-fridges-web`; canonical data URL is `https://raw.githubusercontent.com/HugoJF/br-fridges/main/fridges.json`.

**6. Commit and push**
```bash
cd /home/hugo/code/br-fridges
git add fridges.json fridge-types.ts README.md
git commit -m "feat: convert to data-only repo, add fridges.json"
git push
```

**Verify:** `curl https://raw.githubusercontent.com/HugoJF/br-fridges/main/fridges.json | head -30`

---

## Stage 2 — Scaffold br-fridges-web

**Goal:** Initialize Vite + React 19 + TypeScript + Tailwind v4 project at `/home/hugo/code/br-fridges-web`.

**Prerequisites:** Stage 1 complete.

> NOTE: `/home/hugo/code/br-fridges-web` directory may already exist with just this STAGES.md in it.

### Steps

**1. Scaffold (from parent dir)**
```bash
cd /home/hugo/code
# If br-fridges-web dir already exists, scaffold into it:
npm create vite@latest br-fridges-web -- --template react-ts
cd br-fridges-web
```
If Vite complains the directory is not empty, move STAGES.md aside, scaffold, then move it back.

**2. Upgrade to React 19** (Vite template defaults to React 18):
```bash
npm install react@^19 react-dom@^19 @types/react@^19 @types/react-dom@^19
```

**3. Install runtime deps**
```bash
npm install \
  react-router-dom \
  class-variance-authority clsx tailwind-merge \
  lucide-react sonner next-themes \
  @radix-ui/react-accordion \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-aspect-ratio \
  @radix-ui/react-avatar \
  @radix-ui/react-checkbox \
  @radix-ui/react-collapsible \
  @radix-ui/react-context-menu \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-hover-card \
  @radix-ui/react-label \
  @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu \
  @radix-ui/react-popover \
  @radix-ui/react-progress \
  @radix-ui/react-radio-group \
  @radix-ui/react-scroll-area \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-slider \
  @radix-ui/react-slot \
  @radix-ui/react-switch \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-toggle \
  @radix-ui/react-toggle-group \
  @radix-ui/react-tooltip \
  cmdk embla-carousel-react input-otp vaul \
  react-hook-form @hookform/resolvers zod \
  recharts react-day-picker date-fns \
  react-resizable-panels
```

**4. Install dev deps**
```bash
npm install -D @tailwindcss/vite tailwindcss tw-animate-css @types/node
```

**5. Replace `vite.config.ts`**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/br-fridges-web/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**6. Update `tsconfig.app.json`** — add to `compilerOptions`:
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

**7. Replace `src/index.css`** with Tailwind v4 + CSS variables:
```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-inter);
}
```
Then append the full CSS variable block from `/tmp/br-fridges-v0/app/globals.css` (contains `--radius`, `--background`, `--foreground`, etc. for light/dark themes). Copy everything after the `@tailwind` lines in that file.

**8. Clean Vite boilerplate**
```bash
rm src/App.css src/assets/react.svg public/vite.svg
# Also clear src/App.tsx and src/main.tsx — will be rewritten in Stage 3
```

**9. Update `index.html`** — set title and add favicon `<link>` tags matching the V0 `app/layout.tsx` metadata:
- Title: `FridgeFinder — Fridge Catalog`
- Icons: `icon-light-32x32.png`, `icon-dark-32x32.png`, `icon.svg`, `apple-icon.png`

**10. Git init + initial commit**
```bash
cd /home/hugo/code/br-fridges-web
git init
git add .
git commit -m "feat: scaffold br-fridges-web (Vite + React 19 + Tailwind v4)"
```

**11. Create GitHub repo and push**
```bash
gh repo create HugoJF/br-fridges-web --public --source=. --remote=origin --push
```

**Verify:** `npm run dev` — opens in browser without errors.

---

## Stage 3 — Migrate V0 Components

**Goal:** Copy all components/hooks/lib from V0 zip, strip Next.js specifics, wire up Vite entry.

**Prerequisites:** Stage 2 complete. `~/Downloads/b_BE7zozIJ7Ld.zip` still present.

### Steps

**1. Extract zip**
```bash
unzip ~/Downloads/b_BE7zozIJ7Ld.zip -d /tmp/br-fridges-v0 2>/dev/null || true
```

**2. Copy source files**
```bash
cd /home/hugo/code/br-fridges-web
cp -r /tmp/br-fridges-v0/components src/
cp -r /tmp/br-fridges-v0/hooks src/
mkdir -p src/lib
cp /tmp/br-fridges-v0/lib/fridge-types.ts src/lib/fridge-types.ts
cp /tmp/br-fridges-v0/lib/utils.ts src/lib/utils.ts
cp /tmp/br-fridges-v0/public/* public/
```

Do NOT copy: `lib/fridge-data.ts`, `app/`, `next.config.mjs`, `next-env.d.ts`, `pnpm-lock.yaml`, `components.json`.

**3. Create `src/main.tsx`**
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**4. Create `src/App.tsx`** (replaces Next.js `app/layout.tsx` + `app/page.tsx`):
```tsx
import { ThemeProvider } from '@/components/theme-provider'
import FridgeCatalog from '@/components/catalog/fridge-catalog'

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="br-fridges-theme">
      <div className="bg-background min-h-screen font-sans antialiased">
        <FridgeCatalog />
      </div>
    </ThemeProvider>
  )
}
```

**5. Strip Next.js from copied files**

Check what needs fixing:
```bash
grep -rn "from 'next/" src/
```

Replace patterns:
| Pattern | Action |
|---------|--------|
| `from 'next/navigation'` | `from 'react-router-dom'` (map hooks: `useRouter`→`useNavigate`, `usePathname`→`useLocation`) |
| `from 'next/link'` | `from 'react-router-dom'` |
| `from 'next/image'` | Use plain `<img>` |
| `@vercel/analytics` | Delete import + `<Analytics />` usage |
| `next/font/google` | Delete — Inter can be loaded from Google Fonts CDN in `index.html` if needed |

For this catalog app (no routing), likely only `@vercel/analytics` in layout needs removal — but it was already removed by not copying `app/layout.tsx`.

**6. Verify fridge-data imports** — fridge-catalog.tsx likely imports `ALL_FRIDGES` from `@/lib/fridge-data`. This will fail since we didn't copy that file. Leave as a compile error to fix in Stage 4, OR temporarily mock it:
```tsx
// Temporary placeholder — replaced in Stage 4
export const ALL_FRIDGES = []
```

**7. TypeScript check**
```bash
npm run build 2>&1 | head -40
```
Fix all errors except those related to `fridge-data` (handled in Stage 4).

**8. Commit**
```bash
git add src/ public/
git commit -m "feat: migrate V0 components from Next.js to Vite"
git push
```

---

## Stage 4 — Wire Data Fetch

**Goal:** Replace static `ALL_FRIDGES` import with async fetch from raw GitHub URL.

**Prerequisites:** Stage 3 complete. `fridges.json` live on `HugoJF/br-fridges` main branch (Stage 1 done).

### Steps

**1. Create `src/lib/data.ts`**
```ts
import type { Fridge } from './fridge-types'

const DATA_URL = 'https://raw.githubusercontent.com/HugoJF/br-fridges/main/fridges.json'

export async function fetchFridges(): Promise<Fridge[]> {
  const res = await fetch(DATA_URL)
  if (!res.ok) throw new Error(`Failed to fetch fridges: ${res.status}`)
  return res.json() as Promise<Fridge[]>
}
```

**2. Update `src/components/catalog/fridge-catalog.tsx`**

Read the file first. It currently imports `ALL_FRIDGES` from `@/lib/fridge-data` and passes it to child components. Replace with:

```tsx
import { useState, useEffect } from 'react'
import { fetchFridges } from '@/lib/data'
import type { Fridge } from '@/lib/fridge-types'

// Inside FridgeCatalog component, before any JSX:
const [fridges, setFridges] = useState<Fridge[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  fetchFridges()
    .then(setFridges)
    .catch(e => setError(String(e.message ?? e)))
    .finally(() => setLoading(false))
}, [])

if (loading) return (
  <div className="flex items-center justify-center min-h-screen">
    <span className="text-muted-foreground">Loading fridges…</span>
  </div>
)
if (error) return (
  <div className="flex items-center justify-center min-h-screen">
    <span className="text-destructive">Error: {error}</span>
  </div>
)
```

Then pass `fridges` (state) wherever `ALL_FRIDGES` was previously passed.

**3. Check child components for direct `fridge-data` imports**
```bash
grep -rn "fridge-data" src/
```
Any found: replace with props passed down from `fridge-catalog.tsx`. The catalog component is the only one that should fetch.

**4. Delete the placeholder if created in Stage 3**
```bash
rm -f src/lib/fridge-data.ts
```

**5. Build + test**
```bash
npm run build   # must pass with 0 errors
npm run dev     # open browser, check Network tab: fridges.json fetched from raw.githubusercontent.com
```

**6. Commit**
```bash
git add src/
git commit -m "feat: fetch fridge data from raw GitHub URL"
git push
```

---

## Stage 5 — GitHub Actions + Deploy

**Goal:** Automated build and deploy to GitHub Pages on every push to main.

**Prerequisites:** Stage 4 complete. `HugoJF/br-fridges-web` repo exists on GitHub.

### Steps

**1. Create `.github/workflows/deploy.yml`**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

**2. Confirm `vite.config.ts` has `base: '/br-fridges-web/'`** — required for GitHub Pages subpath routing. All assets will be served from `/br-fridges-web/assets/...`.

**3. Local build check**
```bash
npm run build
ls dist/
```

**4. Enable GitHub Pages in repo settings**
- `github.com/HugoJF/br-fridges-web` → Settings → Pages → Source: **GitHub Actions**

**5. Commit, push, monitor**
```bash
git add .github/
git commit -m "ci: deploy to GitHub Pages via Actions"
git push
# Monitor: github.com/HugoJF/br-fridges-web/actions
```

**6. Verify**
- URL: `https://hugojf.github.io/br-fridges-web/`
- DevTools → Network: `fridges.json` fetched from raw.githubusercontent.com
- UI: filters, sort, comparison tray all functional

---

## Key Notes (all agents must read)

1. **Tailwind v4**: `@tailwindcss/vite` plugin, NOT PostCSS. CSS uses `@import "tailwindcss"` not `@tailwind base`.

2. **React 19**: Vite template defaults to React 18. Explicitly install `react@^19`.

3. **Data source**: V0 `fridge-data.ts` has placeholder data only. The real 109-model dataset is in `br-fridges/index.html` as `const D=[...]`. Always use the br-fridges data.

4. **Root component**: `fridge-catalog.tsx` is the root. It owns loading state and passes `fridges` to all 5 sibling components.

5. **GitHub Pages base**: `base: '/br-fridges-web/'` in `vite.config.ts` makes asset URLs correct for GitHub Pages. If React Router is added later, use `basename="/br-fridges-web"`.

6. **Raw GitHub URL**: `https://raw.githubusercontent.com/HugoJF/br-fridges/main/fridges.json` — public, no auth, no CORS issues.
