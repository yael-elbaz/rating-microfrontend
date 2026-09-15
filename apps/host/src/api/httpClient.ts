import { createMfeHttp } from "digital-utils";
import { HOST_CLIENT_URL, IDNT_OBJECT_PPR, IPS_PPRID } from "../httpDecService";

// The host is itself an MFE: its own calls carry the MFE layer (idntObjectPPR, IPS_PPRID, microFrontentRefrerr, isFirstMfeRequest) too
export const http = createMfeHttp({
  idntObjectPPR: IDNT_OBJECT_PPR,
  ipsPprId: IPS_PPRID,
  microFrontentRefrerr: HOST_CLIENT_URL,
});
