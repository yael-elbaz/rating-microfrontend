# rating-microfrontend — MFE HTTP Client POC

Module Federation POC: a host, an example micro-frontend, and a shared `digital-utils` package providing a singleton axios instance with two header layers (host/session + MFE).
Implemented according to the main spec: `../spec/בריף-לקלוד-קוד-מימוש-MFE-HTTP-Client (2).md`.

```
packages/digital-utils   shared generic infra: httpClient.ts (axios singleton), mfeContext.ts (MFE headers), sharedConfig.js (MF shared config)
apps/host                host (port 3000): httpDecService.ts, manageCookies.ts, bootstrap.ts, api/ (host is itself an MFE, identified by IDNT_OBJECT_PPR), loads mfeExample remote
apps/mfe-example         example MFE (port 3001): exposes ./App, calls /api/example/:id via createMfeHttp
tools/mockApi.js         dev-only mock backend that echoes the tracing headers it received
```

## Run

```bash
npm install
npm start        # builds digital-utils, starts mfe-example (3001) + host (3000)
```

Open http://localhost:3000 — the MFE renders the headers the mock API received; check the Network tab and console (`same instance? true`).

## Config (env vars, read at build time)

| Var | Used by | Default |
| --- | --- | --- |
| `SVIVA` | host | `dev-` |
| `IDNT_OBJECT_PPR` | host, mfe-example (each app's own id; the MFE layer overrides the host one) | host: `poc-idnt-object-ppr`, mfe-example: `mfe-example` |
| `IPS_PPRID` | host, mfe-example (idnt system of each app, sent as `IPS_PPRID`; the MFE layer overrides the host one) | host: `poc-host-ips-pprid`, mfe-example: `poc-mfe-example-ips-pprid` |
| `IDNT_HOST_MAFIL` | host | `poc-idnt-host-mafil` |
| `COOKIE_DOMAIN` | host (cookie `domain`) | empty (host-only cookie; set `.ips.gov.il` in real environments) |
| `MFE_EXAMPLE_URL` | host (remote URL) | `http://localhost:3001` |
| `MFE_BASE_URL` | mfe-example (`microFrontentRefrerr`) | `http://localhost:3001` |

## Notes

- `axios` and `digital-utils` must resolve to the same versions in all projects; both apps spread `digital-utils/sharedConfig` into their `shared` so the singleton config can't drift.
- In the host, `bootstrap.ts` calls `initHttpClient` and only then dynamically imports `App` — never call `http()` from code that is statically imported before init.
- The host is itself an MFE: its own API calls go through `apps/host/src/api/httpClient.ts` (`createMfeHttp` with `idntObjectPPR: IDNT_OBJECT_PPR`), so they carry `idntObjectPPR`, `IPS_PPRID`, `microFrontentRefrerr` and `isFirstMfeRequest` like any other MFE. Don't call `http()` directly for host API calls.
