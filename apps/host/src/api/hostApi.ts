// The host has no MFE client: its idntObjectPPR / IPS_PPRID / microFrontentRefrerr come from the
// host layer in httpDecService, and isFirstMfeRequest is derived from them by the interceptor.
import { get } from "digital-utils";

export const pingHost = () => get("/api/host/ping").then((res) => res.data);
