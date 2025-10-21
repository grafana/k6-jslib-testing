import { serveFile } from "@std/http/file-server";

const port = Number(Deno.env.get("TEST_SERVER_PORT") ?? "8000");

Deno.serve({ hostname: "127.0.0.1", port }, (req: Request) => {
  const pathname = new URL(req.url).pathname;
  if (pathname === "/") {
    const filepath = new URL("./test.html", import.meta.url).pathname;

    // Try to read the file content to verify it exists and has content
    try {
      Deno.readFileSync(filepath);
    } catch (e) {
      console.error(`Error reading file: ${e}`);
    }

    return serveFile(req, filepath);
  }

  return new Response("Not found", { status: 404 });
});
