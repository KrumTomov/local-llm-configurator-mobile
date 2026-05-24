import { NextResponse } from "next/server";

import { apiError, parsePagination, requireApiSession } from "@/lib/api";
import { listBenchmarks, runBenchmark } from "@/lib/neuroforge";

export async function GET(request: Request) {
  const { response, session } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const data = await listBenchmarks(session, parsePagination(request.url));

    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  const { response, session } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const body = await request.json();
    const benchmark = await runBenchmark(session, {
      modelId: Number(body.modelId),
      configurationId: body.configurationId ? Number(body.configurationId) : undefined,
      deviceProfileId: body.deviceProfileId ? Number(body.deviceProfileId) : undefined,
      benchmarkName: body.benchmarkName,
      benchmarkPrompt: String(body.benchmarkPrompt ?? "Explain local LLM orchestration."),
    });

    return NextResponse.json({ data: benchmark }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
