import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { initHttpClient } from "digital-utils";
import HttpDecService from "./httpDecService";

export function initializeHttpClient() {
  initHttpClient({
    timeout: 15000,
    getHeaders: () => HttpDecService.getHeaders(),
  });
}

// חייב לרוץ *לפני* טעינת ה-MFEs
initializeHttpClient();

// App is imported dynamically (not statically) so it is guaranteed to evaluate after initHttpClient — static imports are hoisted
import("./App").then(({ default: App }) => {
  createRoot(document.getElementById("root")!).render(createElement(App));
});
