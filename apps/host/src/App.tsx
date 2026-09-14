import { lazy, Suspense, useState } from "react";
import { http } from "digital-utils";
import { pingHost } from "./api/hostApi";

const MfeExampleApp = lazy(() => import("mfeExample/App"));

(window as any).__hostHttp = http();
console.log("[host] same instance?", http() === http());

export default function App() {
  const [hostResponse, setHostResponse] = useState<unknown>(null);

  const callFromHost = () => pingHost().then(setHostResponse).catch(console.error);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Host</h1>
      <button onClick={callFromHost}>Host request</button>
      <pre id="host-response">{hostResponse ? JSON.stringify(hostResponse, null, 2) : ""}</pre>

      <section style={{ border: "1px dashed #888", padding: 16, marginTop: 16 }}>
        <Suspense fallback={<div>Loading mfe-example…</div>}>
          <MfeExampleApp />
        </Suspense>
      </section>
    </main>
  );
}
