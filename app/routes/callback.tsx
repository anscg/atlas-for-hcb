import { LoaderFunction, redirect } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    const tokenResponse = await fetch(`${process.env.HCB_API_BASE}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.HCB_CLIENT_ID,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.HCB_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    // Here you would typically store the token in a session or cookie
    // For now, we'll just redirect back to the home page
    return redirect("/");
  }

  return redirect("/?error=no_code");
};
