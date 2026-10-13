// Serves pictures waiting for review (image-review/, never in public/) to the local review page only.
import fs from "node:fs/promises";
import path from "node:path";
import { refuseUnlessLocal } from "@/lib/local-dev";

const FOLDERS = new Set(["candidates", "rejected"]);

export async function GET(request: Request, { params }: { params: Promise<{ folder: string; name: string }> }) {
  const refused = refuseUnlessLocal(request);
  if (refused) return refused;
  const { folder, name } = await params;
  if (!FOLDERS.has(folder) || !/^[\w-]+\.webp$/.test(name)) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(path.join(process.cwd(), "image-review", folder, name));
    return new Response(new Uint8Array(data), { headers: { "content-type": "image/webp", "cache-control": "no-store" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
