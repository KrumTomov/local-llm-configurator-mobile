import { getDashboardOverview } from "@/lib/neuroforge";
import { handleMobileError, mobileSuccess, requireMobileSession } from "@/lib/mobile-api";

export async function GET(request: Request) {
  const { response, session } = await requireMobileSession(request);

  if (response) {
    return response;
  }

  try {
    return mobileSuccess(await getDashboardOverview(session));
  } catch (error) {
    return handleMobileError(error);
  }
}
