import { json, type MetaFunction, ActionFunctionArgs, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getHcbConfig } from "~/env.server";
import { Button } from "~/components/ui/loginwithhcb";
import { getUserId } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/dashboard");
  }
  
  const config = getHcbConfig();
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  
  return json({
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    error,
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const config = getHcbConfig();
  const authorizationEndpoint = `${config.apiBase}/oauth/authorize`;
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'read write',
  });

  return json({ authUrl: `${authorizationEndpoint}?${params.toString()}` });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Atlas for HCB" },
    { name: "description", content: "Welcome to Atlas!" },
  ];
};

export default function Index() {
  const { clientId, redirectUri, error } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const fetcher = useFetcher();
  const [cooldown, setCooldown] = useState(false);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (fetcher.state === "idle" && fetcher.data && cooldown) {
      timeoutId = setTimeout(() => {
        setCooldown(false);
      }, 3000); 
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetcher.state, fetcher.data, cooldown]);
  
  const handleLogin = () => {
    fetcher.submit({}, { method: "post" });
    setCooldown(true);
  };
  
  if (fetcher.state === "idle" && fetcher.data?.authUrl) {
    window.location.href = fetcher.data.authUrl;
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16 w-full max-w-md px-4">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to Atlas
          </h1>
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              {error === "no_code" && "Authentication failed: No authorization code received."}
              {error === "auth_failed" && "Authentication failed: Could not obtain access token."}
              {error === "user_fetch_failed" && "Authentication failed: Could not fetch user data."}
            </div>
          )}
        </header>
        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handleLogin}
            disabled={fetcher.state !== "idle" || cooldown}
            >
          </Button>
          <p className="text-xs text-left select-none text-stone-400 dark:text-stone-400">
            By clicking "Continue with HCB", you acknowledge that you have read, understood, and agree to Atlas' <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="underline hover:text-stone-500 dark:hover:text-stone-300">Terms & Conditions</a> and <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="underline hover:text-stone-500 dark:hover:text-stone-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}