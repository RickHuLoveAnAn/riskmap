# Codebase Concerns

**Analysis Date:** 2026-04-27

## Tech Debt

### Hardcoded Mock Data Throughout
- **Issue:** All application data is hardcoded in `src/mockData.ts`. No API integration, no data fetching layer, no state management for async data.
- **Files:** `src/mockData.ts`, `src/App.tsx`, `src/components/ContagionMap.tsx`, `src/components/RiskDrawer.tsx`
- **Impact:** The application is a pure prototype/demo. It cannot display real data, cannot scale beyond the 11 hardcoded nodes, and requires a full rewrite of data plumbing to become production-ready.
- **Fix approach:** Introduce a data service layer with async fetching. Replace direct `MOCK_NODES` / `MOCK_PATHS` / `MOCK_TREND` imports with a hook or context that loads data from an API. Keep mock data as a fallback or for storybook/tests.

### Inline Styles Mixed with Tailwind
- **Issue:** Global scrollbar styles and an animation keyframe are defined both in `src/index.css` and inline inside `src/App.tsx` via a `<style>` tag.
- **Files:** `src/App.tsx` (lines 72-88), `src/index.css` (lines 37-50)
- **Impact:** Style duplication and maintenance overhead. The inline `<style>` in App.tsx is unnecessary since the same rules exist in `index.css`.
- **Fix approach:** Remove the inline `<style>` block from `App.tsx` and consolidate all global styles in `src/index.css`.

### `any` Type Usage
- **Issue:** `MOCK_TREND` is typed as `Record<string, any[]>`, and two casts to `any` are used in `ContagionMap.tsx` to access a non-declared property on position objects.
- **Files:** `src/mockData.ts` (line 389), `src/components/ContagionMap.tsx` (lines 115, 156)
- **Impact:** Loss of type safety. The `leftX` property exists on the position type but is accessed via `as any`, masking potential refactoring errors.
- **Fix approach:** Extend the position type to include `leftX` explicitly and remove the `any` casts. Change `any[]` to `HealthTrend[]` in `mockData.ts`.

### Missing Path Alias Usage
- **Issue:** `tsconfig.json` and `vite.config.ts` define `@/*` path aliases, but every import uses relative paths (`../types`, `./lib/utils`).
- **Files:** `tsconfig.json`, `vite.config.ts`, all source files under `src/`
- **Impact:** Inconsistent codebase. Relative paths become brittle as the directory structure grows.
- **Fix approach:** Adopt the `@/` alias consistently for all cross-module imports.

## Known Bugs

### Hardcoded Stats in App Banner
- **Issue:** The dashboard banner in `App.tsx` displays hardcoded counts ("02 Nodes", "05 Nodes", "12% Systemic Risk") that do not derive from the actual `MOCK_NODES` data.
- **Files:** `src/App.tsx` (lines 36, 44, 54)
- **Trigger:** Always visible; counts are static text, not computed.
- **Workaround:** None. The numbers will be wrong as soon as mock data changes.

### Level Label Positioning Bug
- **Issue:** The level label (`Level 0 成员公司`, etc.) inside `ContagionMap.tsx` uses `absolute` positioning within a `relative` flex column. On narrow viewports or when nodes wrap, the label may overlap nodes because it is not constrained by the column width.
- **Files:** `src/components/ContagionMap.tsx` (line 186)
- **Trigger:** Resize browser to a narrow width or expand many nodes.
- **Workaround:** None.

### Missing `key` on Table Row Fragments
- **Issue:** Table rows in `RiskDrawer.tsx` use array index `i` as `key`. While not a critical bug for static data, it can cause React reconciliation issues if rows are reordered or filtered.
- **Files:** `src/components/RiskDrawer.tsx` (lines 299, 329, 371, 415)
- **Trigger:** Reordering data or adding/removing rows dynamically.
- **Workaround:** Use stable unique identifiers from the data (e.g., `documentNo`, `eventCode`, `defectCode`) instead of index.

## Security Considerations

### API Key Exposed to Client Bundle
- **Risk:** `vite.config.ts` inlines `GEMINI_API_KEY` into the client bundle via `define: { 'process.env.GEMINI_API_KEY': ... }`.
- **Files:** `vite.config.ts` (line 11)
- **Current mitigation:** None. The key is compiled into the static JS sent to the browser.
- **Recommendations:** Move all API calls that require the Gemini key to a backend proxy. The Vite `define` approach is only safe for non-sensitive public configuration. If a backend is not feasible, use environment variables only in SSR/server context, never in client bundles.

### No Input Sanitization
- **Risk:** The search input in `TopHeader.tsx` accepts raw text with no validation or sanitization. Since there is no backend, this is currently harmless, but it sets a bad precedent.
- **Files:** `src/components/TopHeader.tsx` (lines 37-41)
- **Current mitigation:** Input is not wired to any functionality.
- **Recommendations:** If/when search is implemented, sanitize input before sending to any API or using in DOM manipulation.

### No Content Security Policy
- **Risk:** `index.html` has no `<meta http-equiv="Content-Security-Policy" ...>` tag.
- **Files:** `index.html`
- **Current mitigation:** None.
- **Recommendations:** Add a CSP meta tag to mitigate XSS, especially if dynamic HTML injection is introduced later.

## Performance Bottlenecks

### Layout Thrashing in ContagionMap
- **Problem:** `ContagionMap.tsx` reads `getBoundingClientRect()` inside `updatePositions()` and then writes state, which triggers a React re-render. This happens on every `requestAnimationFrame` during the 500ms transition and on every `ResizeObserver` callback.
- **Files:** `src/components/ContagionMap.tsx` (lines 50-66, 69-100)
- **Cause:** Synchronous read-write loop on the main thread.
- **Improvement path:** Batch position updates. Use `requestAnimationFrame` only for the transition period, and debounce `ResizeObserver` callbacks. Consider using a canvas or SVG-based layout engine (e.g., D3) instead of DOM measurement for edges.

### Unnecessary Re-renders in RiskDrawer
- **Problem:** `RiskDrawer` receives the entire `node` object as a prop. `useMemo` on `indicatorConfigs` depends on `node`, which changes reference on every parent render even if the same node is selected.
- **Files:** `src/components/RiskDrawer.tsx` (line 42)
- **Cause:** No memoization of the `node` prop or its derived data.
- **Improvement path:** Memoize the `node` selection in `App.tsx` or use `React.memo` on `RiskDrawer` with a custom comparison. Alternatively, pass only `nodeId` and let `RiskDrawer` look up its own data.

## Fragile Areas

### ContagionMap SVG Edge Calculation
- **Files:** `src/components/ContagionMap.tsx`
- **Why fragile:** Edge coordinates are computed by querying DOM elements by ID (`node-${node.id}`) and measuring their positions. This breaks if:
  - Node IDs contain characters invalid for HTML IDs.
  - The component is rendered in a portal or iframe where `getBoundingClientRect()` returns unexpected values.
  - CSS changes affect layout timing.
- **Safe modification:** Any changes to node card dimensions, margins, or animation durations must be accompanied by manual verification of edge alignment. Consider adding visual regression tests.
- **Test coverage:** No tests exist.

### RiskDrawer Table Components
- **Files:** `src/components/RiskDrawer.tsx` (lines 284-453)
- **Why fragile:** Four large inline table components (`PenaltyTable`, `AuditTable`, `RiskEventTable`, `RCSADefectTable`) are defined in the same file. They share repetitive markup but are not abstracted. Adding a new column requires editing all four tables.
- **Safe modification:** Extract a generic `DataTable` component with column definitions before adding new tables or columns.
- **Test coverage:** No tests exist.

### TopHeader Navigation Stubs
- **Files:** `src/components/TopHeader.tsx` (lines 21-31)
- **Why fragile:** Navigation buttons (REPORTS, AI RULES) are non-functional placeholders. They appear clickable but do nothing. This creates UX debt.
- **Safe modification:** Either remove stub buttons or implement route handling before adding more navigation items.

## Scaling Limits

### Mock Data Size
- **Current capacity:** 11 nodes, 2 contagion paths, 2 trend series.
- **Limit:** The DOM-based SVG edge calculation in `ContagionMap.tsx` will degrade with more than ~50 visible nodes due to `getBoundingClientRect()` overhead and React re-render cost.
- **Scaling path:** Switch to a canvas or WebGL renderer (e.g., D3 force layout, React Flow) for larger graphs.

### Drawer Content for Large Data Sets
- **Current capacity:** Tables render all rows unconditionally (no pagination or virtual scrolling).
- **Limit:** A node with hundreds of penalties or audit records will cause the drawer to become unresponsive.
- **Scaling path:** Add pagination or virtualized lists (e.g., `react-window`) to table sections.

## Dependencies at Risk

### `@google/genai` (Unused)
- **Risk:** The package is listed in `dependencies` but never imported or used in the source code.
- **Impact:** Increases bundle size and attack surface for no benefit.
- **Migration plan:** Remove `@google/genai` from `package.json` if not needed in the immediate future. If AI features are planned, ensure API calls go through a backend proxy (see Security).

### `motion` (Framer Motion)
- **Risk:** The project uses `motion/react` (Framer Motion v12). This is a large dependency (~100KB+ gzipped).
- **Impact:** Bundle bloat for relatively simple animations (fade, slide, scale).
- **Migration plan:** Evaluate whether native CSS transitions or `react-transition-group` can replace Framer Motion for the current use cases. If not, keep it but tree-shake unused features.

### `recharts` (Large Charting Library)
- **Risk:** `recharts` is used for a single simple line chart in `RiskDrawer.tsx`.
- **Impact:** Significant bundle size for one chart.
- **Migration plan:** Consider lighter alternatives like `chart.js` with react wrapper, or a custom SVG line chart if the charting needs remain simple.

## Missing Critical Features

### No Data Fetching Layer
- **Problem:** There is no `fetch`, `axios`, or API client in the entire codebase. The app is entirely static.
- **Blocks:** Real-time risk monitoring, integration with backend systems, user-specific data.

### No Routing
- **Problem:** The app is a single-page component with no router. The REPORTS and AI RULES tabs in `TopHeader.tsx` are non-functional.
- **Blocks:** Multi-page navigation, deep-linking to specific risk nodes, bookmarking.

### No State Management
- **Problem:** All state is local React state (`useState`). There is no context, Zustand, Redux, or similar for shared state.
- **Blocks:** Cross-component communication, global filters, user preferences, caching.

### No Error Boundaries
- **Problem:** No `React.ErrorBoundary` is implemented. A runtime error in any component (e.g., `ContagionMap` SVG calculation) will crash the entire application.
- **Blocks:** Production resilience.

### No Loading States
- **Problem:** Since there is no async data, there are also no loading skeletons or spinners.
- **Blocks:** Graceful UX when real data fetching is introduced.

## Test Coverage Gaps

### Zero Tests
- **What is not tested:** Everything. There are no `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files in the project.
- **Files:** All files under `src/`
- **Risk:** Any refactoring (e.g., changing the `RiskNodeData` interface, modifying SVG calculation, adding real data fetching) has no safety net.
- **Priority:** High. Add at minimum:
  - Unit tests for `src/lib/utils.ts` (`cn`, `formatNumber`).
  - Component tests for `RiskNode` rendering logic.
  - Integration tests for `ContagionMap` visibility/expansion logic.

### No TypeScript Strictness
- **What is not enforced:** `tsconfig.json` does not enable `strict`, `noImplicitAny`, `strictNullChecks`, or `noUnusedLocals`.
- **Files:** `tsconfig.json`
- **Risk:** Type errors that strict mode would catch are silently allowed.
- **Priority:** Medium. Enable `strict: true` and fix resulting errors.

---

*Concerns audit: 2026-04-27*
