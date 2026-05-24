import { NextResponse } from "next/server";

import { apiError, parsePagination, requireApiSession } from "@/lib/api";
import { createConfiguration, listConfigurations } from "@/lib/neuroforge";

export async function GET(request: Request) {
  const { response, session } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const configurations = await listConfigurations(session, parsePagination(request.url));

    return NextResponse.json({ data: configurations });
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
    const configuration = await createConfiguration(session, {
      modelId: Number(body.modelId),
      configName: String(body.configName ?? "Custom configuration"),
      description: body.description,
      temperature: body.temperature ?? "0.70",
      topP: body.topP ?? "0.95",
      topK: Number(body.topK ?? 40),
      repeatPenalty: body.repeatPenalty ?? "1.10",
      contextSize: Number(body.contextSize ?? 4096),
      maxTokens: Number(body.maxTokens ?? 2048),
      gpuLayers: Number(body.gpuLayers ?? 24),
      batchSize: Number(body.batchSize ?? 1),
      systemPrompt: body.systemPrompt,
      useCaseCategory: body.useCaseCategory ?? "general_chat",
      isPublic: Boolean(body.isPublic ?? false),
      metadata: body.metadata,
    });

    return NextResponse.json({ data: configuration }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
