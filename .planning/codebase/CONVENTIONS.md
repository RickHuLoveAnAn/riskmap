# Coding Conventions

**Analysis Date:** 2026-04-27

## Naming Patterns

**Files:**
- PascalCase for React components: `RiskDrawer.tsx`, `ContagionMap.tsx`, `RiskNode.tsx`, `TopHeader.tsx`
- camelCase for utility and data files: `utils.ts`, `mockData.ts`, `types.ts`
- Co-located component files live in `src/components/`

**Functions:**
- camelCase for regular functions and handlers: `handleNodeClick`, `handleToggle`, `updatePositions`, `getIndicatorConfigs`
- PascalCase for React components: `App`, `RiskDrawer`, `ContagionMap`, `RiskNode`
- PascalCase for table sub-components within a file: `PenaltyTable`, `AuditTable`, `RiskEventTable`, `RCSADefectTable`

**Variables:**
- camelCase for local variables: `selectedNode`, `isDrawerOpen`, `nodePositions`, `expandedIds`
- Descriptive boolean prefixes: `isActive`, `isOpen`, `isExpanded`, `hasChildren`, `isAlert`, `isL4`

**Types:**
- PascalCase for all type names: `RiskNodeData`, `ContagionPath`, `IndicatorConfig`, `IndicatorTab`
- Props interfaces use `ComponentNameProps` pattern: `RiskDrawerProps`, `ContagionMapProps`, `RiskNodeProps`
- Enums use PascalCase with UPPER_SNAKE_CASE values: `RiskStatus.ALERT`, `NodeTier.TIER1`

## Code Style

**Formatting:**
- No Prettier or ESLint config detected in the repo
- TypeScript compiler (`tsc --noEmit`) is used as the lint step (`npm run lint`)
- Indentation: 2 spaces (observed consistently)
- Semicolons: present and consistent
- Quote style: single quotes for imports and strings

**TypeScript Configuration:**
- Target: ES2022 (`tsconfig.json`)
- Module: ESNext with bundler resolution
- JSX: `react-jsx` (no need to import React for JSX)
- Path alias: `@/*` maps to `./*` (project root)
- `noEmit: true` - TypeScript is used for type-checking only
- `skipLibCheck: true`
- `isolatedModules: true`

## Import Organization

**Order (observed pattern):**
1. React imports first
2. Third-party libraries (motion, lucide-react, recharts)
3. Internal components (`./components/*`)
4. Internal types and utilities (`../types`, `../lib/utils`, `../mockData`)

**Path Aliases:**
- `@/*` configured in both `tsconfig.json` and `vite.config.ts`
- However, the codebase uses relative imports (`../types`, `./components/*`) rather than the `@/` alias

**Import Style Examples:**
```typescript
// From src/components/RiskDrawer.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, FileText } from 'lucide-react';
import { RiskNodeData, RiskStatus } from '../types';
import { cn, formatNumber } from '../lib/utils';
import { LineChart, Line, XAxis } from 'recharts';
import { MOCK_TREND } from '../mockData';
```

## Error Handling

**Patterns:**
- Null-coalescing operator (`??`) for optional array defaults:
  ```typescript
  const penalties = node.regulatoryPenalties ?? [];
  ```
- Optional chaining is not heavily used; explicit null checks are preferred
- Early return for null/undefined guards:
  ```typescript
  if (!node) return null;
  ```
- No try/catch blocks observed in UI code
- No global error boundary detected

## Logging

**Framework:** None detected. No `console.log`, `console.error`, or other console usage found in source files.

**Patterns:**
- No logging utilities present
- No error tracking integration (Sentry, etc.)

## Comments

**When to Comment:**
- Section headers for logical grouping within files:
  ```typescript
  // ===== Detail Table Components =====
  ```
- Inline comments for complex logic:
  ```typescript
  // We need to trigger a re-render after mounting to get node positions for SVG lines
  ```
- Chinese comments used for domain-specific sections:
  ```typescript
  // ==================== 风险指标明细数据模型 ====================
  ```

**JSDoc/TSDoc:**
- Not used in this codebase
- Apache-2.0 license header present in `src/App.tsx` only

## Function Design

**Size:**
- Components range from 65 lines (`TopHeader.tsx`) to 454 lines (`RiskDrawer.tsx`)
- Helper functions are small and focused (e.g., `getIndicatorConfigs`, `formatNumber`)
- Table rendering functions (`PenaltyTable`, `AuditTable`, etc.) are defined as separate functions within the same file

**Parameters:**
- Destructuring preferred in component props:
  ```typescript
  export const RiskDrawer: React.FC<RiskDrawerProps> = ({ node, isOpen, onClose }) => {
  ```

**Return Values:**
- Components return JSX directly
- Helper functions return computed values
- `cn()` utility merges Tailwind classes conditionally

## Module Design

**Exports:**
- Named exports for components: `export const RiskDrawer`, `export const ContagionMap`
- Default export only for `App.tsx`: `export default function App()`
- Utility functions use named exports: `export function cn()`, `export function formatNumber()`
- Types/enums exported from `src/types.ts`
- Mock data exported from `src/mockData.ts`

**Barrel Files:**
- Not used. Components are imported directly from their files.

## React Patterns

**Component Style:**
- Function components with explicit `React.FC<Props>` typing
- Hooks imported explicitly from `react`:
  ```typescript
  import React, { useState, useMemo } from 'react';
  ```
- `React.useEffect` used directly when hook not destructured (observed in `RiskDrawer.tsx`)

**State Management:**
- Local state via `useState` only
- No context API, no external state library (Redux, Zustand, etc.)
- Lifting state up pattern: `App.tsx` holds `selectedNode` and `isDrawerOpen`, passes down via props

**Props Pattern:**
- Callback props for child-to-parent communication: `onNodeClick`, `onToggle`, `onClose`
- Optional props use `?:` syntax: `selectedNodeId?: string`, `isActive?: boolean`

## Tailwind CSS Conventions

**Class Naming:**
- Utility-first Tailwind classes used extensively
- Custom utility classes defined in `src/index.css`:
  - `.bento-card` - card container style
  - `.bento-card-hover` - hover state
  - `.bento-header` - small uppercase header text
  - `.animate-breathe` - custom pulse animation

**Conditional Classes:**
- `cn()` utility from `src/lib/utils.ts` used for conditional class merging:
  ```typescript
  className={cn(
    "p-4 rounded-xl border text-left transition-all",
    activeTab === config.key
      ? "border-blue-500 bg-blue-50 shadow-sm"
      : config.count > 0
        ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
        : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
  )}
  ```

**Custom Theme Colors:**
- Defined in `src/index.css` via `@theme`:
  - `--color-risk-red: #EE3434`
  - `--color-risk-orange: #FFB000`
  - `--color-risk-green: #2ECC71`

## Type Usage

**Enums vs Union Types:**
- Enums used for status/tier classification: `RiskStatus`, `NodeTier`
- String literal union types used for tabs: `type IndicatorTab = 'penalty' | 'audit' | 'risk' | 'rcsa'`

**Type Imports:**
- `type` keyword used for type-only imports:
  ```typescript
  import { RiskStatus, NodeTier, type RiskNodeData } from '../types';
  ```

**Any Usage:**
- One instance of `any[]` in `src/mockData.ts`:
  ```typescript
  export const MOCK_TREND: Record<string, any[]> = { ... };
  ```
- `as any` cast observed in `ContagionMap.tsx`:
  ```typescript
  const endX = (end as any).leftX;
  ```

---

*Convention analysis: 2026-04-27*
