import { get } from "./httpClient";

export const getExampleData = (id: string) => get(`/api/example/${id}`).then((res) => res.data);
