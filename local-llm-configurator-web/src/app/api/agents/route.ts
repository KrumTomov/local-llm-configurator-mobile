import { NextResponse } from "next/server";

import { apiError, parsePagination, requireApiSession } from "@/lib/api";
import { createAgent, listAgents } from "@/lib/neuroforge";

export async function GET(request: Request) {
  const { response, session } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const data = await listAgents(session, parsePagination(request.url));

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
    const agent = await createAgent(session, {
      name: String(body.name ?? "New agent"),
      description: body.description,
      systemPrompt: body.systemPrompt,
      modelId: Number(body.modelId),
      configurationId: body.configurationId ? Number(body.configurationId) : undefined,
      category: body.category ?? "assistant",
      visibility: body.visibility ?? "private",
      toolPermissions: body.toolPermissions ?? [],
      maxContextTokens: Number(body.maxContextTokens ?? 4096),
      temperature: body.temperature ?? "0.40",
      isActive: true,
      metadata: body.metadata,
    });

    return NextResponse.json({ data: agent }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
