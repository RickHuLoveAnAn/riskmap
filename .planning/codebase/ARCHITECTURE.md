# Architecture

**Analysis Date:** 2026-04-27

## Pattern Overview

**Overall:** Monolithic Single-Page Application (SPA) with a flat component hierarchy and centralized mock data.

**Key Characteristics:**
- React 19 functional components with hooks (no class components)
- Client-side only; no backend API layer (all data is static mock data)
- Component-driven UI with inline styling via Tailwind CSS utility classes
- SVG overlay for relationship lines rendered as a background layer
- Drawer-based detail view (slide-out panel) for L4 node inspection

## Layers

**Presentation Layer (Components):**
- Purpose: Render UI, handle user interactions, manage local visual state
- Location: `src/components/`
- Contains: React functional components, inline JSX table components, animation wrappers
- Depends on: `src/types.ts`, `src/mockData.ts`, `src/lib/utils.ts`, Tailwind classes, `lucide-react`, `recharts`, `motion/react`
- Used by: `src/App.tsx`

**Application/Container Layer:**
- Purpose: Orchestrate top-level state and compose child components
- Location: `src/App.tsx`
- Contains: Selected node state, drawer open/close state, node click handler
- Depends on: `src/components/*`, `src/types.ts`
- Used by: `src/main.tsx`

**Data Layer:**
- Purpose: Define domain models and provide static mock datasets
- Location: `src/types.ts`, `src/mockData.ts`
- Contains: TypeScript interfaces/enums, static `MOCK_NODES`, `MOCK_PATHS`, `MOCK_TREND`
- Depends on: Nothing
- Used by: All components and `App.tsx`

**Utility Layer:**
- Purpose: Shared helper functions and class-name merging
- Location: `src/lib/utils.ts`
- Contains: `cn()` (Tailwind class merge), `formatNumber()` (zh-CN number formatting)
- Depends on: `clsx`, `tailwind-merge`
- Used by: All components

**Styling Layer:**
- Purpose: Global CSS, custom animations, Tailwind theme extensions
- Location: `src/index.css`
- Contains: Tailwind import, custom `@theme` colors (`risk-red`, `risk-orange`, `risk-green`), `breathe` keyframe, `.bento-card` utilities
- Depends on: Tailwind CSS v4
- Used by: All components

## Data Flow

**Node Selection Flow:**
1. User clicks a `RiskNode` (`src/components/RiskNode.tsx`)
2. `onClick` callback propagates up to `ContagionMap` (`src/components/ContagionMap.tsx`)
3. `ContagionMap` invokes `onNodeClick` prop passed from `App.tsx`
4. `App.tsx` updates `selectedNode` state and conditionally opens `RiskDrawer` if `level === 4`
5. `RiskDrawer` receives `selectedNode` and `isOpen` props, renders detail panel

**Tree Expansion Flow:**
1. User clicks a non-L4 node with children in `RiskNode`
2. `RiskNode` calls `onToggle(data.id)`
3. `ContagionMap` updates `expandedIds` Set state
4. `ContagionMap` recalculates `visibleNodes` and triggers `useEffect` to re-measure DOM positions
5. SVG lines (`renderTreeLines`, `renderPath`) re-render based on new `nodePositions`

**State Management:**
- All state is local React state (`useState`, `useRef`, `useEffect`, `useMemo`)
- No external state management library (Redux, Zustand, Context API not used)
- `selectedNode` and `isDrawerOpen` live in `App.tsx`
- `expandedIds` and `nodePositions` live in `ContagionMap`
- `activeTab` lives in `RiskDrawer`

## Key Abstractions

**RiskNodeData:**
- Purpose: Central domain entity representing a node in the risk hierarchy
- Location: `src/types.ts`
- Pattern: Flat interface with optional nested detail arrays (`regulatoryPenalties`, `auditAccountabilities`, etc.)
- Hierarchy levels: `level: 0` (member company) through `level: 4` (sub-process)

**ContagionPath:**
- Purpose: Represents a directed relationship between two nodes (physical or AI-predicted)
- Location: `src/types.ts`
- Pattern: Simple edge structure with `isAI` flag to distinguish confirmed vs predicted links

**IndicatorConfig / Tab System:**
- Purpose: Drive the four detail tabs inside `RiskDrawer` (penalty, audit, risk, rcsa)
- Location: `src/components/RiskDrawer.tsx` (inline `getIndicatorConfigs` helper)
- Pattern: Config array derived from node data; first tab with data is auto-selected on node change

**SVG Overlay for Lines:**
- Purpose: Render Bezier curves for parent-child tree edges and contagion paths
- Location: `src/components/ContagionMap.tsx`
- Pattern: Absolute-positioned `<svg>` as a background layer inside a relative content wrapper; DOM positions measured via `getBoundingClientRect` and synced via `ResizeObserver` + `requestAnimationFrame`

## Entry Points

**Browser Entry Point:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html`, Vite serves module
- Responsibilities: Create React root, render `<App />` inside `<StrictMode>`, import global CSS

**Application Root:**
- Location: `src/App.tsx`
- Triggers: Mounted by `main.tsx`
- Responsibilities: Hold `selectedNode` and `isDrawerOpen` state, compose `TopHeader`, `ContagionMap`, `RiskDrawer`, render stats banner

**Build Entry Point:**
- Location: `vite.config.ts`
- Triggers: `npm run build` or `npm run dev`
- Responsibilities: Configure React plugin, Tailwind CSS plugin, path alias `@`, inject `GEMINI_API_KEY` into `process.env`

## Error Handling

**Strategy:** Minimal; no explicit error boundaries or global error handlers.

**Patterns:**
- Non-null assertion operator used for DOM element access: `document.getElementById('root')!`
- Conditional rendering guards: `if (!node) return null;` in `RiskDrawer`
- No try/catch blocks in component code
- TypeScript `tsc --noEmit` used as lint step (`package.json` scripts)

## Cross-Cutting Concerns

**Logging:** Not implemented (no logging framework or console logging patterns)

**Validation:** Not implemented (no runtime validation of node data; assumes mock data is well-formed)

**Authentication:** Not implemented (no auth guards, no protected routes, no user session)

**Internationalization:** Partial; UI labels mix English and Simplified Chinese. No i18n framework.

**Theming:** Custom Tailwind theme colors (`risk-red`, `risk-orange`, `risk-green`) defined in `src/index.css`. No dark mode toggle.

---

*Architecture analysis: 2026-04-27*
