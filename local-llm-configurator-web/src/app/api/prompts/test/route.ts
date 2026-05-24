import { NextResponse } from "next/server";

import { apiError, requireApiSession } from "@/lib/api";
import { testPrompt } from "@/lib/neuroforge";

export async function POST(request: Request) {
  const { response, session } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const body = await request.json();
    const result = await testPrompt(session, Number(body.promptId), Number(body.modelId));

    return NextResponse.json({ data: result });
  } catch (error) {
    return apiError(error);
  }
}
