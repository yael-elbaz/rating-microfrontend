import { http } from "./httpClient";

export const pingHost = () => http.get("/api/host/ping");
