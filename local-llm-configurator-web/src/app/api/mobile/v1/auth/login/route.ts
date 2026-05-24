import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createJwtToken, verifyPassword } from "@/lib/auth";
import {
  handleMobileError,
  mobileError,
  mobileSuccess,
  requiredString,
} from "@/lib/mobile-api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = requiredString(body.email, "email").toLowerCase();
    const password = requiredString(body.password, "password");
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return mobileError("Invalid email or password.", {
        code: "INVALID_CREDENTIALS",
        status: 401,
      });
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, user.id));

    return mobileSuccess({
      accessToken: createJwtToken({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      }),
      tokenType: "Bearer",
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    });
  } catch (error) {
    return handleMobileError(error);
  }
}
