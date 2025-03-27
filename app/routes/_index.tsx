import { json, type MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getHcbConfig } from "~/env.server";
import { Button } from "~/components/ui/loginwithhcb";

export const loader = async () => {
  const config = getHcbConfig();
  
  return json({
    clientId: config.clientId,
    redirectUri: config.redirectUri,
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
  const config = useLoaderData<typeof loader>();
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