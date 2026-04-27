# External Integrations

**Analysis Date:** 2026-04-27

## APIs & External Services

**AI/ML:**
- Google Gemini AI API - Planned integration for AI contagion prediction
  - SDK: `@google/genai` 1.29.0 (installed in `package.json` but not currently imported in source)
  - Auth: `GEMINI_API_KEY` (injected at build time via Vite `define` in `vite.config.ts`)
  - Note: Currently all AI explanations are hardcoded mock data in `src/mockData.ts`

## Data Storage

**Databases:**
- Not applicable - No database client or ORM detected

**File Storage:**
- Local filesystem only - No cloud storage SDKs

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- None - No authentication library or auth-related imports
- UI shows a static user avatar ("CCO 专家 / 集团风险管理部") in `src/components/TopHeader.tsx`

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Browser console only

## CI/CD & Deployment

**Hosting:**
- Google AI Studio (inferred from `metadata.json` and `.env.example` comments)
- Cloud Run (referenced in `.env.example`: "AI Studio automatically injects this at runtime with the Cloud Run service URL")

**CI Pipeline:**
- None detected - No GitHub Actions, Travis, or other CI config files

## Environment Configuration

**Required env vars:**
- `GEMINI_API_KEY` - Google AI API key for Gemini integration
- `APP_URL` - Self-referential application URL

**Secrets location:**
- `.env` file (not committed, per `.gitignore`)
- AI Studio Secrets panel (per `.env.example` comments)

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Data Sources

**Current:**
- All data is static mock data in `src/mockData.ts`
  - `MOCK_NODES`: Risk node hierarchy with KRI metrics
  - `MOCK_PATHS`: Contagion path definitions
  - `MOCK_TREND`: Health score time-series data

**Planned (based on code structure):**
- Real-time KRI (Key Risk Indicator) data feed
- Regulatory penalty database
- Audit accountability system
- Operational risk event log
- RCSA (Risk Control Self Assessment) defect registry

---

*Integration audit: 2026-04-27*
