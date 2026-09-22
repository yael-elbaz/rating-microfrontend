# rating-microfrontend — MFE HTTP Client POC

Module Federation POC: a host, an example micro-frontend, and a shared `digital-utils` package providing a singleton axios instance with two header layers (host/session + MFE) and a per-identity `isFirstMfeRequest` flag derived centrally in the request interceptor.
Implemented according to the main spec: `../spec/בריף-לקלוד-קוד-מימוש-MFE-HTTP-Client (2).md`.

```
packages/digital-utils   shared generic infra: httpClient.ts (axios singleton + header merge + isFirstMfeRequest), mfeContext.ts (MFE identity headers), mfeRegistry.ts (which identities already called), sharedConfig.js (MF shared config)
apps/host                host (port 3000): httpDecService.ts, manageCookies.ts, bootstrap.ts, api/ (host is an identity like any MFE, identified by the numeric IDNT_OBJECT_PPR), loads mfeExample remote
apps/mfe-example         example MFE (port 3001): exposes ./App, binds its identity once in api/httpClient.ts (createMfeHttp) and calls /api/example/:id
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
| `IDNT_OBJECT_PPR` | host, mfe-example (each app's own **numeric** id; the MFE layer overrides the host one) | host: `1001`, mfe-example: `2001` |
| `IPS_PPRID` | host, mfe-example (idnt system of each app, sent as `IPS_PPRID`; the MFE layer overrides the host one) | host: `poc-host-ips-pprid`, mfe-example: `poc-mfe-example-ips-pprid` |
| `IDNT_HOST_MAFIL` | host | `poc-idnt-host-mafil` |
| `COOKIE_DOMAIN` | host (cookie `domain`) | empty (host-only cookie; set `.ips.gov.il` in real environments) |
| `MFE_EXAMPLE_URL` | host (remote URL) | `http://localhost:3001` |
| `MFE_BASE_URL` | mfe-example (`microFrontentRefrerr`) | `http://localhost:3001` |

## Notes

- `axios` and `digital-utils` must resolve to the same versions in all projects; both apps spread `digital-utils/sharedConfig` into their `shared` so the singleton config can't drift.
- In the host, `bootstrap.ts` calls `initHttpClient` and only then dynamically imports `App` — never call `http()` from code that is statically imported before init.
- `isFirstHostRequest` is `true` on the first request of **every application load** (F5, new tab, full navigation) and `false` for the rest of that load — it is a page-global in-memory flag in `httpDecService.ts`, not a cookie, and it is sent on every request regardless of which MFE made it. `isFirstMfeRequest` is per **identity**: it is derived in the `httpClient.ts` request interceptor from the request's effective `idntObjectPPR` (the MFE's when an MFE layer is present, otherwise the host's from `getHeaders()`), against the registry in `mfeRegistry.ts`. So each MFE — and the host — has its own flag, and one MFE's request can never consume another's. An MFE clears its entry on unmount via `release()` (or `releaseMfe(idntObjectPPR)`), so closing and reopening it reports `true` again; an MFE that never calls `release()` keeps `false` until the next page load. The only cookie left is `__GUID_O` (`sessionGuid`), which does persist for the whole browser session.
- `idntObjectPPR` is a **number** in code (`MfeIdentity.idntObjectPPR: number`, `IDNT_OBJECT_PPR` in `httpDecService.ts`) but a string on the wire, since headers always are. `mfeRegistry.ts` therefore keys on the string form, so `release(<number>)` and the interceptor's `<string>` address the same entry.
- An MFE binds its identity once, in its own `api/httpClient.ts`, and re-exports the bound methods — so call sites do `import { get } from "./httpClient"` instead of going through the client object. That file is app-local, not shared, which is why binding there is safe: `digital-utils` itself is a Module Federation **singleton**, so it cannot hold a current-MFE identity in module state without MFEs overwriting each other. Destructuring the client is safe because `createMfeHttp` returns closures over the identity, not `this`-bound methods; `delete` needs renaming (`delete: del`) since it is a reserved word.
- `getMfeHeaders(identity)` returns **identity only** (`idntObjectPPR`, `IPS_PPRID`, `microFrontentRefrerr`). It deliberately does not include `isFirstMfeRequest` — that is derived in one place, the interceptor — so building headers by hand with it and bypassing the shared instance will not produce the flag.
- The host is treated as an identity like any MFE, but it does **not** use `createMfeHttp`: its `idntObjectPPR`, `IPS_PPRID` and `microFrontentRefrerr` already come from the host layer in `httpDecService.ts`, and the interceptor derives `isFirstMfeRequest` from them. Host API calls therefore use the plain `get`/`post` helpers from `digital-utils` (see `apps/host/src/api/hostApi.ts`). An MFE still needs `createMfeHttp`, which overrides that identity per request.
