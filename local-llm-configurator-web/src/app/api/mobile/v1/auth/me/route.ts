import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { mobileSuccess, requireMobileSession } from "@/lib/mobile-api";

export async function GET(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) {
    return response;
  }

  const [user] = await db
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

  return mobileSuccess(user);
}
