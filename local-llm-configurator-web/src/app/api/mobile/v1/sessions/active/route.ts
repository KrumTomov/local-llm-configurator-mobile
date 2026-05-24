import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { modelSessions } from "@/db/schema";
import { mobileSuccess, requireMobileSession } from "@/lib/mobile-api";

export async function GET(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const data = await db
    .select()
    .from(modelSessions)
    .where(and(eq(modelSessions.userId, session.id), eq(modelSessions.status, "active")))
    .orderBy(desc(modelSessions.startedAt));

  return mobileSuccess(data);
}
