import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { createExternalLoginSession, requireUserId } from "~/session.server";
import { useEffect, useState } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  // Ensure the user is logged in
  const userId = await requireUserId(request);
  
  // Create a new external login session
  const sessionId = createExternalLoginSession(userId);
  
  // Get the base URL for the application
  const baseUrl = new URL(request.url).origin;
  const loginUrl = `${baseUrl}/instalogin?sessionId=${sessionId}`;
  
  return json({ loginUrl });
}

export default function GenerateQR() {
  const { loginUrl } = useLoaderData<typeof loader>();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Dynamically import QRCode library to avoid SSR issues
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(loginUrl)
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('QR Code generation error:', err));
    });
  }, [loginUrl]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Mobile Login</h1>
        
        <div className="flex flex-col items-center">
          {qrCodeUrl ? (
            <img 
              src={qrCodeUrl} 
              alt="QR Code for mobile login" 
              className="mb-4 w-64 h-64"
            />
          ) : (
            <div className="mb-4 w-64 h-64 flex items-center justify-center bg-gray-100">
              <p>Generating QR code...</p>
            </div>
          )}
          
          <p className="text-center mb-4">
            Scan this QR code with your mobile device to log in instantly
          </p>
          
          <div className="text-sm text-gray-500 mt-4 text-center">
            <p>This QR code will expire in 10 minutes</p>
            <p>Only scan QR codes on devices you trust</p>
          </div>
        </div>
      </div>
    </div>
  );
}
