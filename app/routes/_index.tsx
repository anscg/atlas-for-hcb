import { json, type MetaFunction, ActionFunctionArgs, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getHcbConfig } from "~/env.server";
import { Button } from "~/components/ui/loginwithhcb";
import { getUserId } from "~/session.server";
import { motion } from "framer-motion";

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
    scope: 'write',
  });

  return json({ authUrl: `${authorizationEndpoint}?${params.toString()}` });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Atlas for HCB" },
    { name: "description", content: "Welcome to Atlas!" },
  ];
};

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]`}
        />
      </motion.div>
    </motion.div>
  );
}

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
    console.log("Hello")
    window.location.href = fetcher.data.authUrl;
  }

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-rose-500/[0.03] blur-3xl" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.1]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.1]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.1]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.1]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.1]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      <div className="relative z-10">
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="flex h-screen items-center justify-center"
        >
          <div className="flex flex-col items-center gap-16 w-full max-w-md px-4">
            <motion.header 
              custom={1}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-9"
            >
              <h1 className="leading text-2xl font-bold text-gray-800">
                Welcome to Atlas
              </h1>
              {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                  {error === "no_code" && "Authentication failed: No authorization code received."}
                  {error === "auth_failed" && "Authentication failed: Could not obtain access token."}
                  {error === "user_fetch_failed" && "Authentication failed: Could not fetch user data."}
                </div>
              )}
            </motion.header>
            <motion.div 
              custom={2}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center gap-4"
            >
              <Button
                onClick={handleLogin}
                disabled={fetcher.state !== "idle" || cooldown}
              >
              </Button>
              <p className="text-xs text-left select-none text-stone-500">
                By clicking "Continue with HCB", you acknowledge that you have read, understood, and agree to Atlas' <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="underline hover:text-stone-700">Terms & Conditions</a> and <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="underline hover:text-stone-700">Privacy Policy</a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/80 pointer-events-none" />
    </div>
  );
}