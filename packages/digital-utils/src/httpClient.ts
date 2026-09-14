import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosRequestHeaders
} from "axios";

let instance: AxiosInstance | null = null;

export interface HttpClientConfig extends AxiosRequestConfig {
  timeout?: number;
  getHeaders?: () => Record<string, string>;
}

export function initHttpClient(config: HttpClientConfig, force = false): void {
  if (instance && !force) {
    console.warn("httpClient already initialized. Pass force=true to reinitialize.");
    return;
  }

  instance = axios.create({ ...config });

  instance.interceptors.request.use(
    (req: InternalAxiosRequestConfig) => {
      req.withCredentials = true;

      if (config.timeout !== undefined) {
        req.timeout = config.timeout;
      }

      const dynamicHeaders = config.getHeaders?.() ?? {};

      req.headers = {
        ...dynamicHeaders,   // שכבת הוסט/סשן
        ...req.headers,      // שכבת ה-MFE הספציפי - מנצחת בהתנגשות מפתחות
      } as AxiosRequestHeaders;

      return req;
    },
    (error) => Promise.reject(error)
  );
}

export function http(): AxiosInstance {
  if (!instance) {
    throw new Error("httpClient not initialized");
  }
  return instance;
}
