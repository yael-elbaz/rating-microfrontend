// Standalone dev entry only — when loaded inside the host, just "./App" is consumed and the host owns initHttpClient
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { initHttpClient } from "digital-utils";
import App from "./App";

initHttpClient({ timeout: 15000 });

createRoot(document.getElementById("root")!).render(createElement(App));
