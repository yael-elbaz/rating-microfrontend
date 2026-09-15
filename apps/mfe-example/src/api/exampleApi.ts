import { http } from "./httpClient";

export const getExampleData = (id: string) => http.get(`/api/example/${id}`).then((res) => res.data);
