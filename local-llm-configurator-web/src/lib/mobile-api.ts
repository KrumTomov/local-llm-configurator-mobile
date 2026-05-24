import { NextResponse } from "next/server";

import { readJwtToken } from "@/lib/auth";

export type MobileSession = NonNullable<ReturnType<typeof readJwtToken>>;

type ErrorOptions = {
  code?: string;
  details?: unknown;
  status?: number;
};

export async function requireMobileSession(
  request: Request,
  roles?: Array<MobileSession["role"]>,
) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const session = readJwtToken(token);

  if (!session) {
    return {
      response: mobileError("Authentication required.", {
        code: "UNAUTHORIZED",
        status: 401,
      }),
      session: null,
    };
  }

  if (roles?.length && !roles.includes(session.role)) {
    return {
      response: mobileError("Insufficient permissions.", {
        code: "FORBIDDEN",
        status: 403,
      }),
      session: null,
    };
  }

  return { response: null, session };
}

export function mobileSuccess<T>(
  data: T,
  init?: {
    meta?: Record<string, unknown>;
    status?: number;
  },
) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: init?.meta ?? {},
    },
    { status: init?.status ?? 200 },
  );
}

export function mobileError(message: string, options: ErrorOptions = {}) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: options.code ?? "ERROR",
        message,
        details: options.details,
      },
    },
    { status: options.status ?? 400 },
  );
}

export function mobileServerError(error: unknown) {
  console.error(error);

  return mobileError("Unexpected server error.", {
    code: "INTERNAL_SERVER_ERROR",
    status: 500,
  });
}

export function parseMobileQuery(url: string) {
  const searchParams = new URL(url).searchParams;
  const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get("pageSize") ?? 20), 1), 100);

  return {
    page,
    pageSize,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    searchParams,
  };
}

export function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new ValidationError(`${field} is required.`);
  }

  return value.trim();
}

export function requiredNumber(value: unknown, field: string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new ValidationError(`${field} must be a number.`);
  }

  return number;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function handleMobileError(error: unknown) {
  if (error instanceof ValidationError) {
    return mobileError(error.message, { code: "VALIDATION_ERROR", status: 422 });
  }

  return mobileServerError(error);
}
