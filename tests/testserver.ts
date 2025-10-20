import { serveFile } from "@std/http/file-server";

const portArg = Number(Deno.args[0] ?? "8000");

Deno.serve({ hostname: "0.0.0.0", port: portArg }, (req: Request) => {
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
