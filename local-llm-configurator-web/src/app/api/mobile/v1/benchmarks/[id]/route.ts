import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { benchmarks } from "@/db/schema";
import { mobileError, mobileSuccess, requireMobileSession } from "@/lib/mobile-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { id } = await context.params;
  const [benchmark] = await db
    .select()
    .from(benchmarks)
    .where(and(eq(benchmarks.id, Number(id)), eq(benchmarks.userId, session.id)))
    .limit(1);

  if (!benchmark) {
    return mobileError("Benchmark not found.", { code: "NOT_FOUND", status: 404 });
  }

  return mobileSuccess(benchmark);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { id } = await context.params;
  const [benchmark] = await db
    .delete(benchmarks)
    .where(and(eq(benchmarks.id, Number(id)), eq(benchmarks.userId, session.id)))
    .returning({ id: benchmarks.id });

  if (!benchmark) {
    return mobileError("Benchmark not found.", { code: "NOT_FOUND", status: 404 });
  }

  return mobileSuccess({ deleted: true, id: benchmark.id });
}
