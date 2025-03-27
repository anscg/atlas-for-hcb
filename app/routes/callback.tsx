import { LoaderFunction, redirect } from "@remix-run/node";
import { getHcbConfig } from "~/env.server";
import { createUserSession } from "~/session.server";
import { findOrCreateUser } from "~/db.server";
import { getHcbUser } from "~/hcb.server";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const config = getHcbConfig();
    
    const tokenResponse = await fetch(`${config.apiBase}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: config.clientId,
        code,
        grant_type: "authorization_code",
        redirect_uri: config.redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return redirect("/?error=auth_failed");
    }
    
    // Format token data with expiration timestamp
    const formattedTokenData = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: Date.now() + tokenData.expires_in * 1000,
    };
    
    // Get user details from HCB
    try {
      const hcbUser = await getHcbUser(tokenData.access_token);
      
      // Create or update user in our database
      const user = await findOrCreateUser(
        hcbUser.id.toString(), 
        hcbUser.name, 
        hcbUser.email
      );
      
      // Create user session and redirect to dashboard
      return createUserSession({
        request,
        userId: user.id,
        tokenData: formattedTokenData,
        redirectTo: "/dashboard",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      return redirect("/?error=user_fetch_failed");
    }
  }

  return redirect("/?error=no_code");
};
