import { stopSession } from "@/lib/neuroforge";
import { mobileError, mobileSuccess, requireMobileSession } from "@/lib/mobile-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { response, session } = await requireMobileSession(request);

  if (response) return response;

  const { id } = await context.params;
  const data = await stopSession(session, Number(id));

  if (!data) return mobileError("Session not found.", { code: "NOT_FOUND", status: 404 });

  return mobileSuccess(data);
}
