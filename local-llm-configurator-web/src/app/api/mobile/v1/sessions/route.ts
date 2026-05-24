import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { modelSessions } from "@/db/schema";
import { startSession } from "@/lib/neuroforge";
import {
  handleMobileError,
  mobileSuccess,
  parseMobileQuery,
  requireMobileSession,
  requiredNumber,
} from "@/lib/mobile-api";

export async function GET(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { limit, offset, page, pageSize, searchParams } = parseMobileQuery(request.url);
  const filters = [eq(modelSessions.userId, session.id)];

  if (searchParams.get("status")) {
    filters.push(eq(modelSessions.status, searchParams.get("status") as never));
  }

  const data = await db
    .select()
    .from(modelSessions)
    .where(and(...filters))
    .orderBy(desc(modelSessions.startedAt))
    .limit(limit)
    .offset(offset);

  return mobileSuccess(data, { meta: { page, pageSize } });
}

export async function POST(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  try {
    const body = await request.json();
    const data = await startSession(session, {
      modelId: requiredNumber(body.modelId, "modelId"),
      configurationId: requiredNumber(body.configurationId, "configurationId"),
      agentPresetId: body.agentPresetId ? Number(body.agentPresetId) : undefined,
      sessionName: body.sessionName,
    });

    return mobileSuccess(data, { status: 201 });
  } catch (error) {
    return handleMobileError(error);
  }
}
