# FridgeFinder Brasil

Compare refrigerator models sold in Brazil by size, capacity, power consumption, price, and fit constraints.

[Open the app](https://hugojf.github.io/br-fridges-web/) · [Data repository](https://github.com/HugoJF/br-fridges) · [Raw dataset](https://raw.githubusercontent.com/HugoJF/br-fridges/main/fridges.json)

## Why This Exists

Buying a refrigerator in Brazil usually means cross-checking scattered retailer listings, manufacturer spec sheets, dimensions, energy labels, and door-clearance measurements. FridgeFinder turns that into a searchable catalog built around practical comparison:

- Will it fit the available width, height, and depth?
- Which models are more efficient in kWh/month?
- Which capacity, freezer layout, and price range make sense?
- Which finalists are better side by side?

The app is a static React frontend deployed to GitHub Pages. It fetches canonical fridge data from the separate [`HugoJF/br-fridges`](https://github.com/HugoJF/br-fridges) data repository.

## Features

- Search by brand, model, or refrigerator type.
- Filter by brand, layout, capacity, price, monthly kWh, reversible doors, and inverter compressor.
- Fit check for available width, height, and depth, using doors-open depth when available.
- Sortable table for dense spec comparison.
- Card view for easier scanning.
- Comparison tray for up to 3 models, with best-value highlights where lower or higher is objectively better.
- Eliminate and restore models while narrowing a shortlist.
- Live data fetch from `fridges.json`, so frontend deploys do not need to bundle the catalog.

## Data

The frontend reads:

```txt
https://raw.githubusercontent.com/HugoJF/br-fridges/main/fridges.json
```

The dataset currently covers 109 Brazilian refrigerator models. Each entry follows the shared `Fridge` schema:

```ts
type Fridge = {
  id: string
  brand: string
  model: string
  capacity: number
  type: 'compact' | 'top-freezer' | 'bottom-freezer' | 'side-by-side' | 'french-door'
  width: number
  height: number
  depth: number
  depthWithDoors: number | null
  reversibleDoors: boolean | null
  inverterCompressor: boolean | null
  monthlyKwh: number | null
  price: number | null
}
```

Notes:

- Dimensions are in centimeters.
- Capacity is in liters.
- Price is approximate BRL and may be `null` when unavailable.
- Monthly consumption is kWh/month and may be `null` when no reliable match is available.
- Specs and prices are research data, not a purchase guarantee.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Radix UI primitives
- lucide-react icons
- GitHub Pages deploy via GitHub Actions

## Local Development

Requirements:

- Node.js 20+
- npm

Install dependencies:

```bash
npm ci
```

Run the dev server:

```bash
npm run dev
```

Build production assets:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Project Structure

```txt
src/
  components/catalog/   catalog shell, filters, table, cards, comparison tray
  components/ui/        shared UI primitives
  lib/data.ts           raw GitHub data fetch
  lib/fridge-data.ts    filtering and sorting helpers
  lib/fridge-types.ts   shared catalog types and fit-check helpers
```

## Deployment

The app is deployed from `main` to GitHub Pages:

```txt
https://hugojf.github.io/br-fridges-web/
```

`vite.config.ts` uses:

```ts
base: '/br-fridges-web/'
```

The deployment workflow builds with `npm ci` and `npm run build`, uploads `dist`, then publishes through GitHub Pages.

## Contributing

Frontend changes belong in this repository. Data corrections, added models, source notes, and schema changes belong in [`HugoJF/br-fridges`](https://github.com/HugoJF/br-fridges).

When changing the data contract:

- Update `fridge-types.ts` in both repositories.
- Keep `src/lib/data.ts` compatible with the published JSON.
- Build this frontend before merging.

## License

[MIT](LICENSE)
