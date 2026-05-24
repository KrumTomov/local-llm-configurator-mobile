import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { promptTemplates } from "@/db/schema";
import {
  handleMobileError,
  mobileSuccess,
  parseMobileQuery,
  requireMobileSession,
  requiredString,
} from "@/lib/mobile-api";

export async function GET(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { limit, offset, page, pageSize, searchParams } = parseMobileQuery(request.url);
  const filters = [
    eq(promptTemplates.userId, session.id),
    isNull(promptTemplates.deletedAt),
  ];
  const category = searchParams.get("category");

  if (category) {
    filters.push(eq(promptTemplates.category, category));
  }

  const data = await db
    .select()
    .from(promptTemplates)
    .where(and(...filters))
    .orderBy(desc(promptTemplates.updatedAt))
    .limit(limit)
    .offset(offset);

  return mobileSuccess(data, { meta: { page, pageSize } });
}

export async function POST(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  try {
    const body = await request.json();
    const [prompt] = await db
      .insert(promptTemplates)
      .values({
        userId: session.id,
        title: requiredString(body.title, "title"),
        description: body.description,
        content: requiredString(body.content, "content"),
        category: body.category ?? "general",
        tags: body.tags,
        visibility: body.visibility ?? "private",
        version: Number(body.version ?? 1),
        isActive: true,
        metadata: body.metadata,
      })
      .returning();

    return mobileSuccess(prompt, { status: 201 });
  } catch (error) {
    return handleMobileError(error);
  }
}
