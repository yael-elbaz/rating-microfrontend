import { AxiosRequestConfig } from "axios";
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
  microFrontendReferrer: string;
}

export function getMfeHeaders(identity: MfeIdentity): Record<string, string> {
  const registry = getRegistry();
  const isFirstMfeRequest = !registry.has(identity.idntObjectPPR);
  registry.add(identity.idntObjectPPR);

  return {
    idntObjectPPR: identity.idntObjectPPR, // overrides the host-layer idntObjectPPR for this MFE's requests
    IPS_PPRID: identity.ipsPprId, // overrides the host-layer IPS_PPRID for this MFE's requests
    microFrontendReferrer: identity.microFrontendReferrer,
    isFirstMfeRequest: String(isFirstMfeRequest),
  };
}

function withMfeHeaders(identity: MfeIdentity, config: AxiosRequestConfig = {}): AxiosRequestConfig {
  return { ...config, headers: { ...config.headers, ...getMfeHeaders(identity) } };
}

export interface MfeHttpClient {
  get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  put: <T = any>(url: string, data?: unknown, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

export function createMfeHttp(identity: MfeIdentity): MfeHttpClient {
  // Unwrap response.data so the runtime value matches the Promise<T> declared by MfeHttpClient
  return {
    get: (url, config) => http().get(url, withMfeHeaders(identity, config)).then((res) => res.data),
    post: (url, data, config) => http().post(url, data, withMfeHeaders(identity, config)).then((res) => res.data),
    put: (url, data, config) => http().put(url, data, withMfeHeaders(identity, config)).then((res) => res.data),
    delete: (url, config) => http().delete(url, withMfeHeaders(identity, config)).then((res) => res.data),
  };
}
