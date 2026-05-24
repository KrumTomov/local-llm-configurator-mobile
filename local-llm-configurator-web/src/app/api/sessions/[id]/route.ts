import { NextResponse } from "next/server";

import { apiError, requireApiSession } from "@/lib/api";
import { sendSessionMessage, stopSession } from "@/lib/neuroforge";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { response, session } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();

    if (body.action === "stop") {
      const data = await stopSession(session, Number(id));

      return NextResponse.json({ data });
    }

    if (body.action === "message") {
      const data = await sendSessionMessage(session, Number(id), String(body.content ?? ""));

      return NextResponse.json({ data });
    }

    return NextResponse.json({ message: "Unsupported action." }, { status: 400 });
  } catch (error) {
    return apiError(error);
  }
}
