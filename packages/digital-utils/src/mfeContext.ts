import { AxiosRequestConfig, AxiosResponse } from "axios";
import { http } from "./httpClient";
import { releaseMfe } from "./mfeRegistry";

export interface MfeIdentity {
  idntObjectPPR: number;
  ipsPprId: string; // idnt system of the MFE, sent as IPS_PPRID
  microFrontentRefrerr: string;
}

/**
 * Identity headers for this MFE. isFirstMfeRequest is deliberately NOT here: it is derived in the
 * httpClient request interceptor from the request's effective idntObjectPPR, so the host — which has
 * no MFE client and supplies its idntObjectPPR through initHttpClient's getHeaders — gets the flag too.
 */
export function getMfeHeaders(identity: MfeIdentity): Record<string, string> {
  return {
    idntObjectPPR: String(identity.idntObjectPPR), // numeric id, sent as its string form; overrides the host-layer idntObjectPPR for this MFE's requests
    IPS_PPRID: identity.ipsPprId, // overrides the host-layer IPS_PPRID for this MFE's requests
    microFrontentRefrerr: identity.microFrontentRefrerr,
  };
}

function withMfeHeaders(identity: MfeIdentity, config: AxiosRequestConfig = {}): AxiosRequestConfig {
  return { ...config, headers: { ...config.headers, ...getMfeHeaders(identity) } };
}

// Same shape as the shared axios instance: the full AxiosResponse is returned, nothing is unwrapped.
// T defaults to `any` exactly as axios does, so `http()({...})` call sites migrate to request({...})
// without their `response.data` handling changing type. Pass T explicitly for a typed response.
export interface MfeHttpClient {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  post: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  put: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  patch: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  head: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  options: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  request: <T = any>(config: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  /** releaseMfe() bound to this client's identity — call it on unmount */
  release: () => void;
}

export function createMfeHttp(identity: MfeIdentity): MfeHttpClient {
  // Only the MFE headers are added; response and errors pass through exactly as the shared client returns them
  return {
    get: (url, config) => http().get(url, withMfeHeaders(identity, config)),
    post: (url, data, config) => http().post(url, data, withMfeHeaders(identity, config)),
    put: (url, data, config) => http().put(url, data, withMfeHeaders(identity, config)),
    patch: (url, data, config) => http().patch(url, data, withMfeHeaders(identity, config)),
    delete: (url, config) => http().delete(url, withMfeHeaders(identity, config)),
    head: (url, config) => http().head(url, withMfeHeaders(identity, config)),
    options: (url, config) => http().options(url, withMfeHeaders(identity, config)),
    request: (config) => http().request(withMfeHeaders(identity, config)),
    release: () => releaseMfe(identity.idntObjectPPR),
  };
}
