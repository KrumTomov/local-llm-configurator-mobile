import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { promptTemplates } from "@/db/schema";
import { handleMobileError, mobileError, mobileSuccess, requireMobileSession } from "@/lib/mobile-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { id } = await context.params;
  const [prompt] = await db
    .select()
    .from(promptTemplates)
    .where(and(eq(promptTemplates.id, Number(id)), eq(promptTemplates.userId, session.id), isNull(promptTemplates.deletedAt)))
    .limit(1);

  if (!prompt) return mobileError("Prompt template not found.", { code: "NOT_FOUND", status: 404 });

  return mobileSuccess(prompt);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  try {
    const { id } = await context.params;
    const body = await request.json();
    const [prompt] = await db
      .update(promptTemplates)
      .set({
        title: body.title,
        description: body.description,
        content: body.content,
        category: body.category,
        tags: body.tags,
        visibility: body.visibility,
        version: body.version ? Number(body.version) : undefined,
        isActive: body.isActive,
        metadata: body.metadata,
        updatedAt: new Date(),
      })
      .where(and(eq(promptTemplates.id, Number(id)), eq(promptTemplates.userId, session.id)))
      .returning();

    if (!prompt) return mobileError("Prompt template not found.", { code: "NOT_FOUND", status: 404 });

    return mobileSuccess(prompt);
  } catch (error) {
    return handleMobileError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { id } = await context.params;
  const [prompt] = await db
    .update(promptTemplates)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(promptTemplates.id, Number(id)), eq(promptTemplates.userId, session.id)))
    .returning({ id: promptTemplates.id });

  if (!prompt) return mobileError("Prompt template not found.", { code: "NOT_FOUND", status: 404 });

  return mobileSuccess({ deleted: true, id: prompt.id });
}
