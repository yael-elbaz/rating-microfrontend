export {
  initHttpClient,
  http,
  OfflineError,
  // convenience methods over the shared instance
  get,
  post,
  put,
  patch,
  del,
  head,
  options,
  request,
  // defaults
  setBaseURL,
  setDefaultHeader,
  removeDefaultHeader,
  // dynamic interceptors
  addRequestInterceptor,
  addResponseInterceptor,
  removeRequestInterceptor,
  removeResponseInterceptor,
  // cancellation / utils
  createAbortController,
  isCancel,
  isAxiosError,
} from "./httpClient";
export type {
  HttpClientConfig,
  InterceptorHandlers,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "./httpClient";
export { createMfeHttp, getMfeHeaders } from "./mfeContext";
export type { MfeIdentity, MfeHttpClient } from "./mfeContext";
