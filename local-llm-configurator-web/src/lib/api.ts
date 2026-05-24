import { NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth";

export type ApiSession = NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>;

export async function requireApiSession() {
  const session = await getCurrentSession();

  if (!session) {
    return {
      response: NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      ),
      session: null,
    };
  }

  return { response: null, session };
}

export function parsePagination(url: string) {
  const searchParams = new URL(url).searchParams;
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(
    Math.max(Number(searchParams.get("pageSize") ?? 20), 1),
    100,
  );

  return {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    page,
    pageSize,
  };
}

export function apiError(error: unknown) {
  console.error(error);

  return NextResponse.json(
    { message: "Unexpected server error." },
    { status: 500 },
  );
}
