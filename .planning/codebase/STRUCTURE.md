# Codebase Structure

**Analysis Date:** 2026-04-27

## Directory Layout

```
riskmap/
├── src/
│   ├── components/          # React UI components
│   │   ├── ContagionMap.tsx # Main interactive tree map with SVG lines
│   │   ├── RiskDrawer.tsx   # Slide-out detail panel for L4 nodes
│   │   ├── RiskNode.tsx     # Individual node card (L0-L3 compact, L4 detailed)
│   │   └── TopHeader.tsx    # App header with nav, search, filters
│   ├── lib/
│   │   └── utils.ts         # Shared utilities: cn(), formatNumber()
│   ├── App.tsx              # Root component: state orchestration
│   ├── index.css            # Global styles, Tailwind theme, custom animations
│   ├── main.tsx             # React DOM entry point
│   ├── mockData.ts          # Static mock datasets: nodes, paths, trends
│   └── types.ts             # TypeScript domain models and enums
├── index.html               # HTML entry point
├── metadata.json            # AI Studio app metadata
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript compiler config
├── vite.config.ts           # Vite build config with React + Tailwind plugins
├── .env.example             # Environment variable template
└── .gitignore               # Git ignore rules
```

## Directory Purposes

**`src/components/`:**
- Purpose: All React functional components
- Contains: `.tsx` files only; no subdirectories
- Key files:
  - `src/components/ContagionMap.tsx`: Renders the 5-level hierarchical tree, SVG Bezier lines, and expansion logic
  - `src/components/RiskDrawer.tsx`: Detail drawer with tabs, charts, and data tables
  - `src/components/RiskNode.tsx`: Node card with status indicators and metrics
  - `src/components/TopHeader.tsx`: Static header bar (non-interactive nav buttons)

**`src/lib/`:**
- Purpose: Shared utility functions reused across components
- Contains: `utils.ts` only
- Key files: `src/lib/utils.ts`

**`src/` (root):**
- Purpose: Application bootstrap, domain models, static data, global styles
- Contains: Entry scripts, type definitions, mock data, CSS
- Key files: `src/main.tsx`, `src/App.tsx`, `src/types.ts`, `src/mockData.ts`, `src/index.css`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React root creation and mount
- `index.html`: Browser entry; loads `src/main.tsx` via Vite

**Configuration:**
- `vite.config.ts`: Vite + React + Tailwind plugin setup; `@` path alias
- `tsconfig.json`: TypeScript with `paths: { "@/*": ["./*"] }`
- `package.json`: Scripts (`dev`, `build`, `preview`, `lint`)

**Core Logic:**
- `src/App.tsx`: Top-level state (`selectedNode`, `isDrawerOpen`), event handlers
- `src/components/ContagionMap.tsx`: Tree layout, SVG line rendering, ResizeObserver position syncing
- `src/components/RiskDrawer.tsx`: Tab switching, conditional table rendering, chart integration

**Data:**
- `src/types.ts`: All TypeScript interfaces and enums (`RiskNodeData`, `ContagionPath`, `RiskStatus`, `NodeTier`, etc.)
- `src/mockData.ts`: Static arrays `MOCK_NODES`, `MOCK_PATHS`, `MOCK_TREND`

**Styling:**
- `src/index.css`: Tailwind v4 import, custom theme colors, `breathe` animation, `.bento-card` utilities

## Naming Conventions

**Files:**
- Components: PascalCase matching exported component name, e.g., `RiskDrawer.tsx`
- Utilities/models: camelCase, e.g., `mockData.ts`, `utils.ts`
- Entry files: `main.tsx`, `App.tsx`, `index.html`, `index.css`

**Directories:**
- Lowercase, kebab-case if needed: `src/components/`, `src/lib/`

**Exports:**
- Components: Named exports using `export const ComponentName: React.FC = ...`
- App: Default export (`export default function App()`)
- Types: Named exports (`export interface`, `export enum`, `export type`)
- Data: Named exports (`export const MOCK_NODES`)

**CSS Classes:**
- Tailwind utility-first approach
- Custom utility classes prefixed with `bento-`: `bento-card`, `bento-header`
- Custom animation: `animate-breathe`
- Theme colors: `risk-red`, `risk-orange`, `risk-green`

## Where to Add New Code

**New Feature (e.g., new chart or filter):**
- Primary code: `src/components/` (new `.tsx` file)
- Import into: `src/App.tsx` or `src/components/ContagionMap.tsx`

**New Component/Module:**
- Implementation: `src/components/{ComponentName}.tsx`
- Follow existing pattern: named export, `React.FC` type, props interface at top of file

**New Domain Model / Type:**
- Add to: `src/types.ts`
- Import from: `import { NewType } from '../types'` (relative) or `import { NewType } from '@/src/types'` (alias)

**New Mock Data:**
- Add to: `src/mockData.ts`
- Follow existing pattern: named const export, typed arrays

**New Utility Function:**
- Add to: `src/lib/utils.ts`
- Import from: `import { newHelper } from '../lib/utils'`

**New API Integration (when backend is added):**
- Create: `src/lib/api.ts` or `src/services/` directory
- Call from: `src/App.tsx` or `src/components/ContagionMap.tsx` (replace `MOCK_NODES` consumption)

## Special Directories

**`node_modules/`:**
- Purpose: NPM dependencies
- Generated: No (committed lockfile `package-lock.json`)
- Committed: No

**`.git/`:**
- Purpose: Git repository metadata
- Generated: Yes
- Committed: N/A

**`.planning/`:**
- Purpose: GSD planning documents (this codebase map)
- Generated: Yes (by GSD tooling)
- Committed: Yes (intended)

---

*Structure analysis: 2026-04-27*
