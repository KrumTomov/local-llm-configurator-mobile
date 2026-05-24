import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { modelSessions, sessionMessages } from "@/db/schema";
import { mobileError, mobileSuccess, requireMobileSession } from "@/lib/mobile-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { id } = await context.params;
  const [modelSession] = await db
    .select()
    .from(modelSessions)
    .where(and(eq(modelSessions.id, Number(id)), eq(modelSessions.userId, session.id)))
    .limit(1);

  if (!modelSession) return mobileError("Session not found.", { code: "NOT_FOUND", status: 404 });

  const messages = await db
    .select()
    .from(sessionMessages)
    .where(eq(sessionMessages.sessionId, modelSession.id));

  return mobileSuccess({ session: modelSession, messages });
}
