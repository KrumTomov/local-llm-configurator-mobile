import { NextResponse } from "next/server";

import { apiError, requireApiSession } from "@/lib/api";
import { getSystemHealth } from "@/lib/neuroforge";

export async function GET() {
  const { response, session } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const data = await getSystemHealth(session);

    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error);
  }
}
