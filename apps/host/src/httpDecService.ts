import ManageCookies from "./manageCookies";

const ENV = process.env.SVIVA ?? "dev-";
export const HOST_CLIENT_URL = `https://${ENV}workspace.ips.gov.il/Host_Client`;
export const IDNT_OBJECT_PPR = process.env.IDNT_OBJECT_PPR ?? ""; // קבוע, מגיע מ-config/env
export const IPS_PPRID = process.env.IPS_PPRID ?? ""; // קבוע, מגיע מ-config/env - idnt system של ההוסט
const IDNT_HOST_MAFIL = process.env.IDNT_HOST_MAFIL ?? ""; // קבוע, מגיע מ-config/env - לא נוצר ב-runtime

const HttpDecService = (function () {
  function createGuid(): string {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
      (
        Number(c) ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
      ).toString(16)
    );
  }

  const staticHeaders: Record<string, string> = {
    idntObjectPPR: IDNT_OBJECT_PPR,
    IPS_PPRID: IPS_PPRID,
    idntHostMafil: IDNT_HOST_MAFIL,
    microFrontentRefrerr: HOST_CLIENT_URL,
  };

  function resolveIsFirstHostRequest(): string {
    const current = ManageCookies.GetCookie("isFirstHostRequest");
    if (current === undefined || current === "") {
      // Session cookie (no Expires/max-age): survives F5 and new tabs, resets only when the browser closes
      ManageCookies.SetCookie("isFirstHostRequest", "false");
      return "true";
    }
    return "false";
  }

  function ensureSessionGuid(): string {
    let guid = ManageCookies.GetCookie("__GUID_O");
    if (!guid) {
      guid = createGuid();
      ManageCookies.SetCookie("__GUID_O", guid, null, ManageCookies.SameSiteOptions.None);
    }
    return guid;
  }

  return {
    getHeaders: (): Record<string, string> => ({
      ...staticHeaders,
      resolution: `${window.screen.width}/${window.screen.height}`,
      isFirstHostRequest: resolveIsFirstHostRequest(),
      sessionGuid: ensureSessionGuid(),
    }),
  };
})();

export default HttpDecService;
