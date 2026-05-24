import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createJwtToken, hashPassword } from "@/lib/auth";
import {
  handleMobileError,
  mobileError,
  mobileSuccess,
  requiredString,
  ValidationError,
} from "@/lib/mobile-api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const displayName = requiredString(body.name, "name");
    const email = requiredString(body.email, "email").toLowerCase();
    const password = requiredString(body.password, "password");

    if (password.length < 8) {
      throw new ValidationError("password must be at least 8 characters.");
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return mobileError("An account with this email already exists.", {
        code: "EMAIL_EXISTS",
        status: 409,
      });
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
    const accessToken = createJwtToken({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    });

    return mobileSuccess(
      {
        accessToken,
        tokenType: "Bearer",
        expiresIn: 3600,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleMobileError(error);
  }
}
