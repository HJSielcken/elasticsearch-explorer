# CLAUDE.md — elasticsearch-explorer

## What This Project Is

A browser extension (Chrome and Firefox, Manifest V3) that provides a developer UI for exploring and managing local Elasticsearch clusters. It lists indices, filters and browses documents, inspects mappings, and supports CRUD operations — all against `http://localhost:9200`.

---

## Repository Layout

```
elasticsearch-explorer/
├── src/                    # All application source code
│   ├── App.js              # Root React component; sets up QueryClient + LocationProvider
│   ├── routeMap.js         # Hash-based route definitions
│   ├── api.js              # Elasticsearch HTTP client (apiUrls + apiCall)
│   ├── background.js       # Extension background script (opens tab on icon click)
│   ├── index.html.js       # JSX HTML template (compiled to index.html)
│   ├── manifest.json.js    # Generates manifest.json (v3) for Chrome or Firefox
│   ├── reset.entry.css     # CSS reset
│   ├── pages/              # Full-page view components
│   │   ├── IndexOverview.js/css    # Index listing, search, bulk delete/clear
│   │   ├── DocumentOverview.js/css # Document search with filters + CRUD
│   │   ├── FormFields.js/css       # MultiSelect dropdown component
│   │   └── Page.js/css             # Base layout with site header
│   ├── features/           # Reusable UI components
│   │   ├── Button.js/css   # Styled button wrapper
│   │   ├── Dialog.js/css   # MappingModal + DocumentModal + useMapping hook
│   │   └── Grid.js/css     # CSS-grid table primitives
│   └── machinery/          # Low-level hooks and utilities
│       ├── normalizeLink.js          # Strips leading # from hash links
│       └── useHashLocationMatch.js   # Combines hash location + route matching
├── config/
│   ├── default.js          # esbuild config — lists kaliber server packages
│   └── dev.js              # Dev overrides (currently empty)
├── types/
│   └── global.d.ts         # Global TypeScript declarations (cx, styles, etc.)
├── build.js                # Runs @sielcken/esbuild production build
├── watch.js                # Runs @sielcken/esbuild in watch mode
├── serve.js                # Runs @sielcken/esbuild dev server (port 8000)
├── docker-compose.yaml     # Elasticsearch 8.1.0 dev container
├── package.json
├── tsconfig.json
└── yarn.lock
```

---

## Development Setup

### Prerequisites

- Node.js + Yarn
- Docker (for the local Elasticsearch instance)

### Start local Elasticsearch

```bash
docker-compose up -d
# Elasticsearch becomes available at http://localhost:9200
# Security is disabled; CORS is open
```

### Run the dev server

```bash
yarn start          # watch + serve in parallel (port 8000)
# or separately:
yarn watch          # esbuild in watch mode
yarn serve          # dev server only
```

### Load the extension locally

After building, load the `target/` directory as an unpacked extension in your browser.

---

## Build & Distribution

```bash
yarn build                       # Production build (NODE_ENV=production)
yarn build.dev                   # Development build

# Firefox
yarn build-firefox               # build + sign (requires WEB_EXT_* env vars)
yarn sign-firefox                # sign only

# Chrome
yarn build-chrome                # packs target/ into target.crx via google-chrome CLI
```

**Key env vars for builds:**

| Variable | Used in | Description |
|---|---|---|
| `NODE_ENV` | build scripts | `production` or development |
| `CONFIG_ENV` | esbuild config | selects `config/dev.js` or `config/default.js` |
| `BROWSER` | `manifest.json.js` | `firefox` or `chrome` — controls manifest output |
| `PORT` | serve scripts | dev server port (default `8000`) |
| `WEB_EXT_API_KEY` / `WEB_EXT_API_SECRET` | Firefox sign | AMO credentials |

Build output goes to `target/`. The manifest version is currently `0.2.4`.

---

## Architecture

### Extension model

- **Manifest V3** — uses a background service worker (`background.js`) that opens the app in a new tab when the toolbar icon is clicked.
- The UI itself is a standard React SPA hosted in the extension context.

### Routing

Hash-based routing via `@kaliber/routing`. All routes live in `src/routeMap.js`:

```
/           → redirect to /index/
/index/     → IndexOverview (list all indices)
/index/:index         → DocumentOverview for a given index
/index/:index/:id     → DocumentOverview with a specific document open
*           → 404
```

Links must go through `normalizeLink` (strips the leading `#`) before being passed to `@kaliber/routing` components.

### Data fetching

All server state is managed by **TanStack Query v5** (`@tanstack/react-query`). Every fetch is a `useQuery` call keyed by the relevant index/document identifiers. Mutations use `useMutation` with manual `invalidateQueries` on success.

The raw HTTP layer is `src/api.js`:
- `apiUrls` — typed constants for all Elasticsearch endpoints
- `apiCall(url, method, body?)` — thin wrapper around `fetch` with JSON headers

**Elasticsearch is always assumed to be at `http://localhost:9200`** (hardcoded in `api.js`).

### Query building

Elasticsearch query objects are built with `@kaliber/elasticsearch/query` helpers: `matchAll`, `and`, `or`, `not`, `terms`, `search`. Queries are composed in `DocumentOverview.js` based on the active form filters.

### Forms

Form state is managed by `@kaliber/forms`. Filter rows in `DocumentOverview.js` are array-based field collections that support dynamic add/remove. Field types are `keyword` (exact match via `terms`) or `text` (full-text via `search`).

### Styling

- **CSS Modules** — each component has a paired `.css` file imported as an object.
- **`cx()`** — a global utility (declared in `types/global.d.ts`) for conditional class composition.
- Naming convention: `.componentLayout` for outer layout wrappers, `.component` for the main element, descriptive names like `.headerGridCell` for specific sub-elements.

### Grid / table components

`src/features/Grid.js` exports composable primitives (`GridTable`, `GridTableColumns`, `GridRow`, `GridCell`, etc.) that use CSS grid. Use these instead of raw `<table>` elements.

---

## Key Conventions

### File naming

- React components: `PascalCase.js` with a paired `PascalCase.css`
- Hooks and utilities: `camelCase.js`
- Config/build scripts: `camelCase.js` at root level

### Component structure

Components are functional. Hooks are defined inside the component file they belong to (no separate `hooks/` directory). Small utilities that support a single component live in the same file.

### No test framework

There is no Jest, Vitest, or similar. `src/test.js` is a reference/scratch file, not an executable test suite. Do not add test runner invocations to CI scripts without setting up a test framework first.

### No CI/CD

There are no `.github/workflows` files. All builds are run manually via the scripts in `package.json`.

### TypeScript usage

The project is JavaScript with TypeScript checking enabled (`tsconfig.json` sets `"checkJs": true`). Type annotations use JSDoc where needed. The `types/global.d.ts` file declares ambient globals (`cx`, `styles`, module declarations for CSS/JSON/HTML).

---

## Docker / Elasticsearch Dev Environment

`docker-compose.yaml` runs a single-node Elasticsearch 8.1.0 cluster:

- Port: `9200`
- Security: **disabled** (`xpack.security.enabled=false`)
- CORS: fully open (all origins, all methods, all headers)
- Memory limit: 500 MB (`ES_JAVA_OPTS=-Xms500m -Xmx500m`)

This setup is intentionally insecure and for **local development only**.

---

## Common Tasks

### Add a new page

1. Create `src/pages/MyPage.js` and `src/pages/MyPage.css`.
2. Add a route entry in `src/routeMap.js`.
3. Link it from `src/pages/Page.js` header if it needs top-level navigation.

### Add a new API endpoint

1. Add the URL constant to `apiUrls` in `src/api.js`.
2. Use `apiCall(apiUrls.myEndpoint, 'GET')` inside a `useQuery` or `useMutation`.

### Change the Elasticsearch base URL

Edit the `base` constant at the top of `src/api.js`. There is currently no runtime configuration mechanism.

### Build for a specific browser

```bash
BROWSER=chrome yarn build        # produces Chrome-compatible manifest
BROWSER=firefox yarn build       # produces Firefox-compatible manifest
```

The default (no `BROWSER` set) produces a Chrome manifest.
