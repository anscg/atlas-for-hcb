import { HeroButton } from "~/components/ui/herobutton";
import { MetaFunction, LoaderFunction, redirect, json } from "@remix-run/node";
import { motion } from "framer-motion";
import { getUserId, createExternalLoginSession } from "~/session.server";
import { useNavigate, useNavigation, Link, useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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
  
  // Create an external login session for QR code
  const sessionId = createExternalLoginSession(userId);
  
  // Get the base URL for the application
  const baseUrl = new URL(request.url).origin;
  const loginUrl = `${baseUrl}/instalogin?sessionId=${sessionId}`;
  
  return json({ loginUrl });
};

// Component for client-side prefetching
function ClientPrefetch() {
  return typeof window !== "undefined" ? (
    <Link to="/dashboard" prefetch="render" className="hidden" />
  ) : null;
}

export default function MobileGate() {
  const { loginUrl } = useLoaderData<{ loginUrl: string }>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isQrVisible, setIsQrVisible] = useState(false);
  
  // Check if we're in the browser
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate QR code on client side
  useEffect(() => {
    if (isClient && loginUrl) {
      import('qrcode').then((QRCode) => {
        QRCode.toDataURL(loginUrl)
          .then(url => setQrCodeUrl(url))
          .catch(err => console.error('QR Code generation error:', err));
      });
    }
  }, [isClient, loginUrl]);

  // Handle navigation state to show loading state
  useEffect(() => {
    if (navigation.state === "loading" && isNavigating) {
      // Do something with loading state if needed
    }
  }, [navigation.state, isNavigating]);

  const handleContinue = () => {
    setIsNavigating(true);
    // Simulate a delay for loading state
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  };

  const toggleQrVisibility = () => {
    setIsQrVisible(!isQrVisible);
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

          <div className="mx-auto aspect-square w-64 border-[1.5px] border-neutral-200 p-4 rounded-[17px] relative">
            {qrCodeUrl ? (
              <>
                <div className="relative h-full w-full rounded-md bg-white overflow-hidden">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for mobile login" 
                    className={`h-full w-full transition-all duration-300 ${isQrVisible ? 'filter-none' : 'blur-lg'}`} 
                  />
                  
                  <button 
                    onClick={toggleQrVisibility} 
                    className="absolute inset-0 flex items-center justify-center hover:bg-opacity-20 transition-all duration-300"
                    aria-label={isQrVisible ? "Hide QR Code" : "Show QR Code"}
                  >
                    
                      {isQrVisible ? (
                        <div></div>
                      ) : (
                        <div className="bg-white bg-opacity-80 rounded-full p-3 shadow-lg">
                        <EyeSlashIcon className="h-6 w-6 text-gray-700" />
                        </div>
                      )}
                    
                  </button>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-md bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
              </div>
            )}
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
            spinnerSize={20}
          >
            Continue
          </HeroButton>
        </div>
      </motion.div>
    </>
  );
}
