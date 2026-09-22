import { createMfeHttp } from "digital-utils";

export const http = createMfeHttp({
  idntObjectPPR: Number(process.env.IDNT_OBJECT_PPR ?? 2001),
  ipsPprId: process.env.IPS_PPRID ?? "poc-mfe-example-ips-pprid",
  microFrontentRefrerr: process.env.MFE_BASE_URL ?? "http://localhost:3001",
});

// Bound to this MFE's identity once, so call sites can import `get` directly instead of going through `http`.
// Safe to destructure: createMfeHttp returns closures over the identity, not `this`-bound methods.
export const { get, post, put, patch, delete: del, head, options, request, release } = http;
