// Approve, reject or upload images from the review page. Refused outside `next dev` on localhost,
// so the live site can never write files or change which picture a word shows.
import { refuseUnlessLocal } from "@/lib/local-dev";

const MAX_UPLOAD = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const refused = refuseUnlessLocal(request);
  if (refused) return refused;
  // Loaded only after the check, so production never even loads sharp for this route.
  const { addCandidate, approve, reject } = await import("@/lib/image-pipeline.mjs");

  try {
    if ((request.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
      const form = await request.formData();
      const id = String(form.get("id") ?? "");
      const file = form.get("file");
      const tool = String(form.get("tool") ?? "").trim() || "AI image tool (not named)";
      const origin = form.get("origin") === "own" ? "own" : "ai";
      if (!(file instanceof File) || file.size === 0) return Response.json({ error: "ไม่ได้เลือกไฟล์" }, { status: 400 });
      if (file.size > MAX_UPLOAD) return Response.json({ error: "ไฟล์ใหญ่เกิน 25MB" }, { status: 413 });
      const entry = await addCandidate(id, Buffer.from(await file.arrayBuffer()), {
        origin,
        tool: origin === "ai" ? tool : undefined,
        site: origin === "ai" ? "AI" : "Own photo",
        by: origin === "ai" ? tool : undefined,
        license: origin === "ai" ? "AI-generated for this project by its owner" : "Owned by the project owner",
        originalName: file.name,
      });
      return Response.json({ ok: true, warnings: entry.candidate.warnings });
    }

    const body = (await request.json()) as { action?: string; id?: string; reason?: string };
    if (!body.id) return Response.json({ error: "ไม่มีรหัสคำ" }, { status: 400 });
    if (body.action === "approve") approve(body.id);
    else if (body.action === "reject") reject(body.id, body.reason?.slice(0, 200));
    else return Response.json({ error: "ไม่รู้จักคำสั่งนี้" }, { status: 400 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
