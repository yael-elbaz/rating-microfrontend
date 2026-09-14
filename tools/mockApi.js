// Dev-only mock backend: echoes the tracing headers it received so they can be verified in the UI and Network tab.
const TRACKED_HEADERS = [
  "idntobjectppr",
  "ips_pprid",
  "microfrontentrefrerr",
  "resolution",
  "isfirsthostrequest",
  "idnthostmafil",
  "sessionguid",
  "microfrontendreferrer",
  "isfirstmferequest",
];

function echoHeaders(req, res) {
  const receivedHeaders = Object.fromEntries(
    TRACKED_HEADERS.filter((h) => h in req.headers).map((h) => [h, req.headers[h]])
  );
  res.json({ path: req.path, receivedHeaders });
}

module.exports = function setupMockApi(middlewares, devServer) {
  devServer.app.get("/api/example/:id", echoHeaders);
  devServer.app.get("/api/host/ping", echoHeaders);
  return middlewares;
};
