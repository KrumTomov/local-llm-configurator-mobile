import { NextResponse } from "next/server";

import { apiError, parsePagination, requireApiSession } from "@/lib/api";
import { listLogs } from "@/lib/neuroforge";

export async function GET(request: Request) {
  const { response, session } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const data = await listLogs(session, parsePagination(request.url));

    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}
