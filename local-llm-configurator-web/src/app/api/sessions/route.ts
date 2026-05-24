import { NextResponse } from "next/server";

import { apiError, parsePagination, requireApiSession } from "@/lib/api";
import { listSessions, startSession } from "@/lib/neuroforge";

export async function GET(request: Request) {
  const { response, session } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const searchParams = new URL(request.url).searchParams;
    const data = await listSessions(session, {
      ...parsePagination(request.url),
      status: searchParams.get("status") as never,
    });

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
    const data = await startSession(session, {
      modelId: Number(body.modelId),
      configurationId: Number(body.configurationId),
      agentPresetId: body.agentPresetId ? Number(body.agentPresetId) : undefined,
      sessionName: body.sessionName,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
