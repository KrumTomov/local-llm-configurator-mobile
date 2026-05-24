import { mobileSuccess, requireMobileSession } from "@/lib/mobile-api";

export async function POST(request: Request) {
  const { response } = await requireMobileSession(request);

  if (response) {
    return response;
  }

  return mobileSuccess({ loggedOut: true });
}
