import { createMfeHttp } from "digital-utils";

export const http = createMfeHttp({
  idntObjectPPR: process.env.IDNT_OBJECT_PPR ?? "mfe-example",
  ipsPprId: process.env.IPS_PPRID ?? "poc-mfe-example-ips-pprid",
  microFrontentRefrerr: process.env.MFE_BASE_URL ?? "http://localhost:3001",
});
