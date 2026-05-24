import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { users } from "@/db/schema";
import { createSessionToken, hashPassword, sessionCookieName } from "@/lib/auth";

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterBody;
  const displayName = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!displayName || !email || password.length < 8) {
    return NextResponse.json(
      { message: "Name, valid email, and an 8+ character password are required." },
      { status: 400 },
    );
  }

  const { db } = await import("@/db");
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return NextResponse.json(
      { message: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const [user] = await db
    .insert(users)
    .values({
      email,
      displayName,
      passwordHash: hashPassword(password),
      role: "user",
      status: "active",
    })
    .returning();

  const response = NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    },
    { status: 201 },
  );

  response.cookies.set({
    name: sessionCookieName,
    value: createSessionToken({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    }),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
