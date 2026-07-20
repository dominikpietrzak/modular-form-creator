# Modular Form Creator

A Resources Management frontend: create resources, fill in their modules, track status and
module progress, provision them to completion, and review a summary — all driven by the
existing backend contract.

The backend (Express + MongoDB) and the design system are provided and left unmodified; all
work here is in the frontend application code.

## Tech stack

- **React 19** + **TypeScript 6** (strict) + **Vite 8**
- **react-router 7** — routing
- **axios 1** — HTTP client
- **@tanstack/react-query 5** — server state (caching, invalidation)
- **react-hook-form 7** + **zod 4** + **@hookform/resolvers** — forms and validation
- **styled-components 6** — styling, consuming the design system's theme
- Provided design system (`src/design-system`) and backend (`backend/`) — not modified

## Quick start

### Full stack with Docker (one command)

```bash
docker compose up -d --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5001 (Swagger at `/docs`)
- MongoDB: `mongodb://localhost:27017`

The frontend is served as a production preview build. `VITE_API_URL` is baked in at build time
(Vite inlines `import.meta.env`), defaulting to `http://localhost:5001` — the host-published
backend that the browser reaches and that the backend's CORS origin already allows.

### Local development

Backend and database in Docker, frontend on the host with hot reload:

```bash
docker compose up -d backend mongo
npm install
npm run dev        # http://localhost:5173
```

`.env` is optional — the API URL defaults to `http://localhost:5001`; override with a
`VITE_API_URL` entry if needed.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Type-check (`tsc -b`) and production build |
| `npm run lint` | ESLint over the project |
| `npm test` | Unit tests (domain rules and form schemas) via Vitest |
| `npm run preview` | Serve the production build locally |

## Project structure

The app follows a feature-sliced layout. A single feature (`resources`) owns its API, domain
rules, forms, buffer and pages; `shared/` holds infrastructure with no domain knowledge; `app/`
wires everything together.

```
src/
  app/                     Bootstrap: providers, router, shell
  shared/
    api/client.ts          axios instance; an interceptor normalizes failures to ApiError
    api/query-client.ts    TanStack Query configuration
    ui/                    Breadcrumb, PageHeader, StateMessage (built on the design system)
  features/resources/
    api/                   Endpoints, DTO types, React Query hooks
    domain/                rules.ts (completion & transition predicates), constants.ts
    forms/                 Zod schemas + Basic Info / Project Details forms
    state/                 PendingChangesProvider (completed-resource edit buffer)
    pages/                 List, Layout, Overview, Details, Basic Info, Project Details
    components/            StatusBadge, ModuleProgress, create/delete drawers
    index.ts               Public surface of the feature
  design-system/           Provided — not modified
```

## Key design decisions

- **Domain rules mirror the backend** (`domain/rules.ts`). The backend validates everything;
  reproducing its predicates on the client lets the UI show progress and disable impossible
  actions instead of surfacing rules through `400` responses. Every predicate is kept in sync
  with `resource.service.ts`.

- **Zod schemas mirror the backend validators** (same regexes, limits, allowed values), so a
  rule rejected locally reads the same as one rejected by the server. Types are inferred from
  the schemas, so schema and type cannot drift. Name uniqueness is server-only, so that error
  is surfaced from the API response.

- **Module PATCHes send the full module.** The backend rejects partial payloads despite the
  PATCH verb, so the forms always submit every field.

- **The completed-resource edit buffer lives in memory only** (`PendingChangesProvider`, mounted
  on the resource layout). Edits survive navigation between the two module pages but are
  intentionally lost on refresh, and persist only on an explicit submit — one full `PUT`
  combining both modules.

- **Server state via React Query.** Mutations return the updated resource, which is written
  straight into the cache; the list is invalidated. Business errors (`4xx`) are not retried.

- **List state lives in the URL** (`?page`, `?status`, `?name`, `?sortOrder`), so a filtered
  view survives refresh and works with the back button. Search is debounced.

- **Details shows server state, not the buffer.** It reports what the resource actually is and
  flags unsaved changes separately, rather than presenting buffered edits as saved fact.

## Business rules

Beyond the decisions above: the resource name is locked after creation (locked field, and the
backend rejects changes); provisioning is the only `draft → completed` transition and is offered
only when both modules are complete; and `completed` is terminal — the backend exposes no
reverse transition, and `PUT` preserves status.

## Design-system notes

The design system is used as-is and never modified. Two of its components needed app-level
layout adjustments (CSS applied to the rendered elements from the app, not changes to the
design-system source):

- **Checkbox hit area.** The design-system checkbox visually hides the real `<input>`, leaving
  its square not clickable — only the text label toggled it. The forms stretch the input over
  its wrapper (with `z-index`, since the visual square is `position: relative`) so the whole row
  is a hit target.
- **Control heights.** A native `<select>` renders ~2px taller than an `<input>` with identical
  padding. Single-line controls are pinned to one height so form and filter columns line up.

## Verification

Unit tests (`npm test`) cover the domain rules and form schemas — the completion and
transition predicates and the backend-mirrored validation, including their edge cases.

Beyond that, the full lifecycle was exercised end-to-end in a real browser against the
containerized stack: creation and validation, the Project Details gate, provisioning, the
completed-resource buffer (including that it does not touch the backend and is lost on
refresh), the full `PUT` submit, deletion, and pagination. `npm run build` and `npm run lint`
are clean.
