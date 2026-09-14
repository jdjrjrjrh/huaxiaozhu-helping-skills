import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const HOST = "127.0.0.1";
const PORT = Number.parseInt(process.env.PORT || process.argv[2] || "8080", 10);

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent((urlPath || "/").split("?")[0]);
  const relative = normalize(decoded).replace(/^[/\\]+/, "");
  const candidate = resolve(join(ROOT, relative || "index.html"));
  if (candidate !== ROOT && !candidate.startsWith(ROOT + sep)) return null;
  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    return resolve(join(candidate, "index.html"));
  }
  return candidate;
}

const server = createServer((request, response) => {
  let filePath;
  try {
    filePath = safePath(request.url);
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  if (!filePath) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
    return;
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    filePath = join(ROOT, "404.html");
    response.statusCode = 404;
  }

  response.setHeader("Content-Type", MIME_TYPES[extname(filePath).toLowerCase()] || "application/octet-stream");
  response.setHeader("Cache-Control", "no-cache");
  createReadStream(filePath).pipe(response);
});

server.listen(PORT, HOST, () => {
  console.log(`Huaxiaozhu is available at http://${HOST}:${PORT}`);
});

process.on("SIGINT", () => server.close(() => process.exit(0)));
