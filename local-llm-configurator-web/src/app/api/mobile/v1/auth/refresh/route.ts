import { createJwtToken } from "@/lib/auth";
import { mobileSuccess, requireMobileSession } from "@/lib/mobile-api";

export async function POST(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) {
    return response;
  }

  return mobileSuccess({
    accessToken: createJwtToken(session),
    tokenType: "Bearer",
    expiresIn: 3600,
  });
}
