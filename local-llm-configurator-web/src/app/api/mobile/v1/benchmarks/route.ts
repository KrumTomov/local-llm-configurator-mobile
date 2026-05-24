import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { benchmarks } from "@/db/schema";
import { runBenchmark } from "@/lib/neuroforge";
import {
  handleMobileError,
  mobileSuccess,
  parseMobileQuery,
  requireMobileSession,
  requiredNumber,
  requiredString,
} from "@/lib/mobile-api";

export async function GET(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { limit, offset, page, pageSize, searchParams } = parseMobileQuery(request.url);
  const filters = [eq(benchmarks.userId, session.id)];

  if (searchParams.get("modelId")) {
    filters.push(eq(benchmarks.modelId, Number(searchParams.get("modelId"))));
  }

  const data = await db
    .select()
    .from(benchmarks)
    .where(and(...filters))
    .orderBy(desc(benchmarks.createdAt))
    .limit(limit)
    .offset(offset);

  return mobileSuccess(data, { meta: { page, pageSize } });
}

export async function POST(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  try {
    const body = await request.json();
    const benchmark = await runBenchmark(session, {
      modelId: requiredNumber(body.modelId, "modelId"),
      configurationId: body.configurationId ? Number(body.configurationId) : undefined,
      deviceProfileId: body.deviceProfileId ? Number(body.deviceProfileId) : undefined,
      benchmarkName: body.benchmarkName,
      benchmarkPrompt: requiredString(body.benchmarkPrompt, "benchmarkPrompt"),
    });

    return mobileSuccess(benchmark, { status: 201 });
  } catch (error) {
    return handleMobileError(error);
  }
}
