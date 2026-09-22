import { useEffect, useState } from "react";
import { http as sharedHttp } from "digital-utils";
import { release } from "./api/httpClient";
import { getExampleData } from "./api/exampleApi";

export default function App() {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    console.log("[mfe-example] same instance?", sharedHttp() === sharedHttp());
    const hostHttp = (window as any).__hostHttp;
    if (hostHttp) console.log("[mfe-example] same instance as host?", sharedHttp() === hostHttp);

    getExampleData("1").then(setData).catch(console.error);

    // The MFE is being closed: forget it already called, so the next time it opens
    // its first request reports isFirstMfeRequest=true again
    return () => release();
  }, []);

  return (
    <div>
      MFE Example — data: <pre id="mfe-response">{JSON.stringify(data, null, 2)}</pre>
      <button onClick={() => getExampleData("2").then(setData).catch(console.error)}>Call again</button>
    </div>
  );
}
