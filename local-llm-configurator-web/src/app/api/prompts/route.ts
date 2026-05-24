import { NextResponse } from "next/server";

import { apiError, parsePagination, requireApiSession } from "@/lib/api";
import { createPrompt, listPrompts } from "@/lib/neuroforge";

export async function GET(request: Request) {
  const { response, session } = await requireApiSession();

  if (response) {
    return response;
  }

  try {
    const data = await listPrompts(session, parsePagination(request.url));

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
    const prompt = await createPrompt(session, {
      title: String(body.title ?? "Untitled prompt"),
      description: body.description,
      content: String(body.content ?? ""),
      category: body.category ?? "general",
      tags: body.tags,
      visibility: body.visibility ?? "private",
      version: Number(body.version ?? 1),
      isActive: true,
      metadata: body.metadata,
    });

    return NextResponse.json({ data: prompt }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
