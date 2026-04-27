# Testing Patterns

**Analysis Date:** 2026-04-27

## Test Framework

**Runner:** Not detected. No test framework is installed or configured.

**Assertion Library:** Not detected.

**Config Files:** None found. No `jest.config.*`, `vitest.config.*`, `playwright.config.*`, or similar files exist.

**Run Commands:**
```bash
npm run lint    # tsc --noEmit (type-checking only)
npm run build   # vite build
npm run dev     # vite dev server
```

There is no `test`, `test:unit`, `test:e2e`, or similar script in `package.json`.

## Test File Organization

**Location:** Not applicable. Zero test files exist in the codebase.

**Naming:** Not applicable.

**Structure:**
```
/Users/rick/Projects/07_riskmap1/riskmap/src/
├── App.tsx
├── main.tsx
├── types.ts
├── mockData.ts
├── index.css
├── lib/
│   └── utils.ts
└── components/
    ├── ContagionMap.tsx
    ├── RiskDrawer.tsx
    ├── RiskNode.tsx
    └── TopHeader.tsx
```

No `__tests__/` directories, no `*.test.ts`, no `*.spec.tsx` files.

## Test Structure

**Suite Organization:** Not applicable. No tests exist.

**Patterns:** None observed.

## Mocking

**Framework:** Not applicable.

**Patterns:** None observed.

**What to Mock:** Not defined.

**What NOT to Mock:** Not defined.

## Fixtures and Factories

**Test Data:**
- Mock data is present in `src/mockData.ts` but is production/demo data, not test fixtures
- `MOCK_NODES`, `MOCK_PATHS`, `MOCK_TREND` are used to populate the UI with demo risk data
- This data could potentially be repurposed as test fixtures if testing were introduced

**Location:** `src/mockData.ts` (production mock data, not test fixtures)

## Coverage

**Requirements:** None enforced. No coverage tooling configured.

**View Coverage:** Not applicable.

## Test Types

**Unit Tests:** Not present.

**Integration Tests:** Not present.

**E2E Tests:** Not present. No Playwright, Cypress, or similar framework detected.

## Testing-Related Dependencies

From `package.json`:
```json
"dependencies": {
  "@google/genai": "^1.29.0",
  "@tailwindcss/vite": "^4.1.14",
  "@vitejs/plugin-react": "^5.0.4",
  "clsx": "^2.1.1",
  "dotenv": "^17.2.3",
  "express": "^4.21.2",
  "lucide-react": "^0.546.0",
  "motion": "^12.23.24",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "recharts": "^3.8.1",
  "tailwind-merge": "^3.5.0",
  "vite": "^6.2.0"
},
"devDependencies": {
  "@types/express": "^4.17.21",
  "@types/node": "^22.14.0",
  "autoprefixer": "^10.4.21",
  "tailwindcss": "^4.1.14",
  "tsx": "^4.21.0",
  "typescript": "~5.8.2",
  "vite": "^6.2.0"
}
```

No testing libraries (Jest, Vitest, React Testing Library, Playwright, Cypress) are installed.

## Recommendations for Adding Tests

If tests are to be added to this codebase, the following patterns would be consistent with the existing architecture:

**Suggested Test Locations:**
- Co-located: `src/components/RiskNode.test.tsx` alongside `RiskNode.tsx`
- Or separate: `src/components/__tests__/RiskNode.test.tsx`

**Suggested Framework (given Vite stack):**
- Vitest for unit/integration tests (aligns with Vite build tool)
- React Testing Library for component tests
- Playwright for E2E tests

**Testable Units:**
- `src/lib/utils.ts` - `cn()` and `formatNumber()` are pure functions, ideal for unit tests
- `src/types.ts` - Type definitions could have runtime validation tests
- Component rendering tests for `RiskNode`, `TopHeader`
- Interaction tests for `ContagionMap` (expand/collapse, node selection)
- `RiskDrawer` tab switching logic

**Mock Data Reuse:**
- `MOCK_NODES` from `src/mockData.ts` can serve as fixture data for component tests

---

*Testing analysis: 2026-04-27*
