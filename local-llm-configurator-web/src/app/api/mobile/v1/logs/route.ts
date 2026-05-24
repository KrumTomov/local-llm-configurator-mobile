import { and, desc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/db";
import { systemLogs } from "@/db/schema";
import { handleMobileError, mobileSuccess, parseMobileQuery, requireMobileSession } from "@/lib/mobile-api";

export async function GET(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  try {
    const { limit, offset, page, pageSize, searchParams } = parseMobileQuery(request.url);
    const filters = [eq(systemLogs.userId, session.id)];
    const eventType = searchParams.get("eventType");
    const level = searchParams.get("level");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (eventType) filters.push(eq(systemLogs.eventType, eventType as never));
    if (level) filters.push(eq(systemLogs.level, level as never));
    if (dateFrom) filters.push(gte(systemLogs.createdAt, new Date(dateFrom)));
    if (dateTo) filters.push(lte(systemLogs.createdAt, new Date(dateTo)));

    const data = await db
      .select()
      .from(systemLogs)
      .where(and(...filters))
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return mobileSuccess(data, { meta: { page, pageSize } });
  } catch (error) {
    return handleMobileError(error);
  }
}
