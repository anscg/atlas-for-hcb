import { json, LoaderFunctionArgs } from "@remix-run/node";
import { validateExternalLoginSession } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  
  if (!sessionId) {
    return json({ success: false, error: "Missing session ID" });
  }
  
  // Validate the session ID but don't consume it yet
  // We'll just check if it's valid
  const userId = validateExternalLoginSession(sessionId);
  
  if (!userId) {
    return json({ success: false, error: "Invalid or expired session" });
  }
  
  // Return success without consuming the session
  // The actual consumption will happen in the instalogin route
  return json({ success: true });
}
