import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createUserSession, getTokenData, validateExternalLoginSession } from "~/session.server";
import { getUserById } from "~/db.server";

//so it'll be like /instalogin?sessionId=xxxx

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  
  // If no session ID is provided, return an error
  if (!sessionId) {
    return json({ error: "Missing session ID", success: false });
  }
  
  // Validate the session ID
  const userId = validateExternalLoginSession(sessionId);
  
  // If session is invalid or expired
  if (!userId) {
    return json({ 
      error: "Invalid or expired session", 
      success: false 
    });
  }
  
  // Get the user from the database
  const user = await getUserById(userId);
  if (!user) {
    return json({ error: "User not found", success: false });
  }
  
  // If the user doesn't have tokens, return an error
  if (!user.access_token || !user.refresh_token || !user.token_expires_at) {
    return json({ error: "User authentication required", success: false });
  }
  
  // Create a token data object from the user data
  const tokenData = {
    access_token: user.access_token,
    refresh_token: user.refresh_token,
    expires_at: user.token_expires_at.getTime()
  };
  
  // Create a session for the user and redirect to the dashboard
  return createUserSession({
    request,
    userId,
    tokenData,
    remember: true,
    redirectTo: "/dashboard",
  });
}

export default function InstaLogin() {
  const data = useLoaderData<typeof loader>();
  
  // This will only show if there's an error and we don't redirect
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-2xl font-bold text-center">
          {data.success ? "Login Successful" : "Login Failed"}
        </h1>
        {data.error && (
          <p className="text-red-500 text-center">{data.error}</p>
        )}
        {!data.error && (
          <p className="text-center">Redirecting to your dashboard...</p>
        )}
      </div>
    </div>
  );
}
