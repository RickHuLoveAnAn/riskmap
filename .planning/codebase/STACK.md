# Technology Stack

**Analysis Date:** 2026-04-27

## Languages

**Primary:**
- TypeScript 5.8.2 - All application source code (`src/**/*.ts`, `src/**/*.tsx`)
- CSS (Tailwind v4) - Styling via `src/index.css`
- HTML - Single entry point (`index.html`)

**Secondary:**
- JSON - Configuration manifests (`package.json`, `tsconfig.json`, `metadata.json`)

## Runtime

**Environment:**
- Node.js (implied by `package-lock.json` presence and npm scripts)
- Browser (client-side SPA)

**Package Manager:**
- npm (lockfile: `package-lock.json` present)

## Frameworks

**Core:**
- React 19.0.0 - UI framework
- React DOM 19.0.0 - DOM renderer
- Vite 6.2.0 - Build tool and dev server

**Styling:**
- Tailwind CSS 4.1.14 - Utility-first CSS framework
- `@tailwindcss/vite` 4.1.14 - Tailwind Vite plugin
- autoprefixer 10.4.21 - PostCSS plugin

**Animation:**
- motion 12.23.24 - Animation library (Framer Motion successor, imported as `motion/react`)

**Data Visualization:**
- recharts 3.8.1 - React charting library (LineChart used in `src/components/RiskDrawer.tsx`)

**Icons:**
- lucide-react 0.546.0 - Icon library

**Utilities:**
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.5.0 - Merge Tailwind classes without conflicts

**Build/Dev:**
- `@vitejs/plugin-react` 5.0.4 - React Fast Refresh and JSX transform
- tsx 4.21.0 - TypeScript execution (dev dependency)

**Server (listed but unused in source):**
- express 4.21.2 - Node.js web framework (dependency, no server entry point found)
- dotenv 17.2.3 - Environment variable loading (dependency, Vite handles env natively)

## Key Dependencies

**Critical:**
- `react` / `react-dom` 19.0.0 - Core UI framework
- `vite` 6.2.0 - Build tooling, dev server, and production bundler
- `@google/genai` 1.29.0 - Google GenAI SDK (listed in dependencies, not currently imported in source)

**Infrastructure:**
- `@tailwindcss/vite` 4.1.14 - Tailwind CSS Vite integration
- `typescript` 5.8.2 - TypeScript compiler

## Configuration

**TypeScript:**
- `tsconfig.json` - Compiler configuration
  - Target: ES2022
  - Module: ESNext with bundler resolution
  - JSX: react-jsx (automatic runtime)
  - Path alias: `@/*` maps to `./*`
  - `noEmit: true` - TypeScript used for type-checking only (Vite handles compilation)
  - `allowImportingTsExtensions: true` - Allows `.ts`/`.tsx` imports

**Vite:**
- `vite.config.ts` - Build configuration
  - Plugins: `react()`, `tailwindcss()`
  - Path alias: `@` resolves to project root
  - Environment variable injection: `process.env.GEMINI_API_KEY` exposed to client
  - HMR: Disabled when `DISABLE_HMR=true`
  - Dev server: port 3000, host 0.0.0.0

**Tailwind CSS:**
- `src/index.css` - Tailwind entry with `@import "tailwindcss"`
  - Custom theme colors: `--color-risk-red`, `--color-risk-orange`, `--color-risk-green`
  - Custom animations: `breathe` keyframe for alert pulse effect
  - Custom utility classes: `bento-card`, `bento-card-hover`, `bento-header`

**Environment:**
- `.env.example` - Template for required environment variables
  - `GEMINI_API_KEY` - Google AI API key
  - `APP_URL` - Application hosting URL

**Package Scripts:**
- `dev`: `vite --port=3000 --host=0.0.0.0` - Start dev server
- `build`: `vite build` - Production build
- `preview`: `vite preview` - Preview production build
- `clean`: `rm -rf dist` - Remove build output
- `lint`: `tsc --noEmit` - Type-check only

## Platform Requirements

**Development:**
- Node.js with npm
- Modern browser with ES2022 support

**Production:**
- Static file hosting (SPA)
- Google AI Studio deployment target (inferred from `metadata.json` and `.env.example` comments)

---

*Stack analysis: 2026-04-27*
