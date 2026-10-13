import "server-only";

/** The image review tools write files into the project, so they only run in `next dev` on the developer's machine. */
export const IS_LOCAL_DEV = process.env.NODE_ENV === "development";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

/** A response that refuses the request, or null when it comes from `next dev` on this computer. */
export function refuseUnlessLocal(request: Request): Response | null {
  if (!IS_LOCAL_DEV) return new Response("Not found", { status: 404 });
  if (!LOCAL_HOSTS.has(new URL(request.url).hostname)) return new Response("Only from localhost", { status: 403 });
  return null;
}
