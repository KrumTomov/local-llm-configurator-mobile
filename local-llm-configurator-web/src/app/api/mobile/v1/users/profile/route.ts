import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  handleMobileError,
  mobileSuccess,
  requireMobileSession,
  requiredString,
} from "@/lib/mobile-api";

export async function GET(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) {
    return response;
  }

  const [profile] = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      role: users.role,
      status: users.status,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.id))
    .limit(1);

  return mobileSuccess(profile);
}

export async function PATCH(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) {
    return response;
  }

  try {
    const body = await request.json();
    const [profile] = await db
      .update(users)
      .set({
        displayName: body.displayName
          ? requiredString(body.displayName, "displayName")
          : undefined,
        avatarUrl: body.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.id))
      .returning({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        role: users.role,
        status: users.status,
      });

    return mobileSuccess(profile);
  } catch (error) {
    return handleMobileError(error);
  }
}
