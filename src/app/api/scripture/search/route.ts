import { z } from "zod";
import { COMPANIONS } from "@/lib/companions";
import { rateLimit } from "@/lib/rateLimit";
import { EMBEDDINGS, WORKS } from "@/lib/scripture/data";
import { searchScripture } from "@/lib/scripture/search";

const companionIds = COMPANIONS.map((c) => c.id) as [string, ...string[]];
const workIds = WORKS.map((w) => w.id) as [string, ...string[]];

const Body = z.object({
  query: z
    .string()
    .trim()
    .min(2, "Type at least 2 characters.")
    .max(300, "Keep searches under 300 characters."),
  vector: z.array(z.number().finite().min(-1.01).max(1.01)).length(EMBEDDINGS.dims).optional(),
  workId: z.enum(workIds).optional(),
  companion: z.enum(companionIds).optional(),
  limit: z.number().int().min(1).max(30).optional(),
});

export type SearchRequest = z.input<typeof Body>;

/** POST /api/scripture/search — hybrid keyword + meaning search over the verified scripture data. */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(`search:${ip}`, 60);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many searches at once. Wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "The request could not be read." }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid search." },
      { status: 400 },
    );
  }
  const { query, vector, workId, companion, limit: max } = parsed.data;
  const hits = searchScripture({
    query,
    vector,
    workId,
    companion: companion as (typeof COMPANIONS)[number]["id"] | undefined,
    limit: max ?? 10,
  });
  return Response.json({ hits, usedMeaning: Boolean(vector) });
}
