import { AxiosRequestConfig, AxiosResponse } from "axios";
import { http } from "./httpClient";

const calledMfes = new Set<string>();

function getRegistry(): Set<string> {
  const w = window as any;
  if (!w.__mfeCallRegistry) w.__mfeCallRegistry = calledMfes;
  return w.__mfeCallRegistry as Set<string>;
}

export interface MfeIdentity {
  idntObjectPPR: string;
  ipsPprId: string; // idnt system of the MFE, sent as IPS_PPRID
  microFrontentRefrerr: string;
}

export function getMfeHeaders(identity: MfeIdentity): Record<string, string> {
  const registry = getRegistry();
  const isFirstMfeRequest = !registry.has(identity.idntObjectPPR);
  registry.add(identity.idntObjectPPR);

  return {
    idntObjectPPR: identity.idntObjectPPR, // overrides the host-layer idntObjectPPR for this MFE's requests
    IPS_PPRID: identity.ipsPprId, // overrides the host-layer IPS_PPRID for this MFE's requests
    microFrontentRefrerr: identity.microFrontentRefrerr,
    isFirstMfeRequest: String(isFirstMfeRequest),
  };
}

/**
 * Forgets that this MFE already made a request, so its next request reports isFirstMfeRequest=true again.
 * Call it when the MFE is closed/unmounted — otherwise the flag stays false until the next full page load.
 */
export function releaseMfe(idntObjectPPR: string): void {
  getRegistry().delete(idntObjectPPR);
}

function withMfeHeaders(identity: MfeIdentity, config: AxiosRequestConfig = {}): AxiosRequestConfig {
  return { ...config, headers: { ...config.headers, ...getMfeHeaders(identity) } };
}

// Same shape as the shared axios instance: the full AxiosResponse is returned, nothing is unwrapped
export interface MfeHttpClient {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  head: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  options: <T = unknown>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
  request: <T = unknown>(config: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
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
