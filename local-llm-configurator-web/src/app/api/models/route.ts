import { NextResponse } from "next/server";

import { apiError, parsePagination, requireApiSession } from "@/lib/api";
import { listModels } from "@/lib/neuroforge";

export async function GET(request: Request) {
  const { response } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const models = await listModels(parsePagination(request.url));

    return NextResponse.json({ data: models });
  } catch (error) {
    return apiError(error);
  }
}
