import { HeroButton } from "~/components/ui/herobutton";
import { MetaFunction, LoaderFunction, redirect } from "@remix-run/node";
import { motion } from "framer-motion";
import { getUserId } from "~/session.server";
import { useNavigate, useNavigation, Link } from "@remix-run/react";
import { useState, useEffect } from "react";

// Make sure the route has proper export id for flat routes
export const id = "routes/mobilegate";

export const meta: MetaFunction = () => {
  return [
    { title: "Atlas Mobile Gate" },
    { name: "description", content: "Atlas works best on mobile devices" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    return redirect("/?error=unauthorized");
  }
  return null;
};

// Component for client-side prefetching
function ClientPrefetch() {
  return typeof window !== "undefined" ? (
    <Link to="/dashboard" prefetch="render" className="hidden" />
  ) : null;
}

export default function MobileGate() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Check if we're in the browser
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle navigation state to show loading state
  useEffect(() => {
    if (navigation.state === "loading" && isNavigating) {
      // Do something with loading state if needed
    }
  }, [navigation.state, isNavigating]);

  const handleContinue = () => {
    setIsNavigating(true);
    navigate("/dashboard");
  };

  const isLoading = isNavigating || navigation.state !== "idle";

  return (
    <>
      {/* Only render on the client */}
      {isClient && <ClientPrefetch />}
      
      <motion.div 
        className="flex min-h-screen flex-col items-center justify-center bg-white p-4"
        initial={{ scale: 1.2, opacity: 0, filter: "blur(8px)" }}
        animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ 
          type: "spring", 
          stiffness: 800, 
          damping: 53, 
          mass: 1,
        }}
      >
        <div className="w-64 max-w-md space-y-8 text-center">
          <div className="space-y-4 font-semibold">
            <h1 className="text-2xl text-black leading-7">
              Atlas works best on mobile devices.
            </h1>
            <p className="text-[0.83rem] font-medium text-black opacity-50 leading-4">
              Scan the QR code to login instantly on your device.
            </p>
          </div>

          <div className="mx-auto aspect-square w-64 border-[1.5px] border-neutral-200 p-4 rounded-[17px]">
            {/* QR code would be placed here */}
            <div className="h-full w-full rounded-md bg-white"></div>
          </div>
          <div className="flex items-center justify-center">
            <div className="h-[1px] w-28" style={{ backgroundImage: 'linear-gradient(to right, #bbc0c7 3px, transparent 3px)', backgroundSize: '6px 1px', backgroundRepeat: 'repeat-x' }}></div>
            <span className="px-3 text-xs text-gray-400">OR</span>
            <div className="h-[1px] w-28" style={{ backgroundImage: 'linear-gradient(to right, #bbc0c7 3px, transparent 3px)', backgroundSize: '6px 1px', backgroundRepeat: 'repeat-x' }}></div>
          </div>

          <HeroButton
            variant="default"
            className="w-full rounded-full h-[3.3rem] bg-stone-800 py-6 text-white font-medium text-lg"
            onClick={handleContinue}
            loading={isLoading}
            spinnerSize={16}
          >
            Continue
          </HeroButton>
        </div>
      </motion.div>
    </>
  );
}
