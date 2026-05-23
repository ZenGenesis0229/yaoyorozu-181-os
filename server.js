import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const port = Number(process.env.PORT || 4173);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function safePath(pathname) {
  const cleaned = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  return join(root, cleaned === "/" ? "index.html" : cleaned);
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://localhost:${port}`);
    let filePath = safePath(url.pathname);
    let ext = extname(filePath);
    if (!ext) {
      filePath = join(root, "index.html");
      ext = ".html";
    }
    const data = await readFile(filePath);
    res.writeHead(200, { "content-type": types[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    try {
      const data = await readFile(join(root, "index.html"));
      res.writeHead(200, { "content-type": types[".html"] });
      res.end(data);
    } catch {
      res.writeHead(500);
      res.end("Server error");
    }
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`YAOYOROZU-181 OS is running at http://localhost:${port}`);
});
