import { NextResponse } from "next/server";

import { apiError, requireApiSession } from "@/lib/api";
import { generateSmartConfiguration } from "@/lib/neuroforge";

export async function POST(request: Request) {
  const { response, session } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const body = await request.json();
    const configuration = await generateSmartConfiguration(session, {
      modelId: Number(body.modelId),
      configName: body.configName,
      useCaseCategory: String(body.useCaseCategory ?? "general_chat"),
      gpuModel: body.gpuModel,
      gpuVramMb: body.gpuVramMb ? Number(body.gpuVramMb) : undefined,
      cpuCores: body.cpuCores ? Number(body.cpuCores) : undefined,
      totalRamMb: body.totalRamMb ? Number(body.totalRamMb) : undefined,
    });

    return NextResponse.json({ data: configuration }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
