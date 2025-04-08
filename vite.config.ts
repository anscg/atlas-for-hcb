import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig((config) => {
  return {
    ssr: {
      noExternal: ["@silk-hq/components"],
    },

    plugins: [
      remix({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
    ],
    resolve:
      config.command === "build" // Apply only when building for production
        ? {
            alias: {
              // Force 'react-dom/server' to resolve to the Node.js version
              "react-dom/server": "react-dom/server.node.js",
            },
          }
        : {}, // No alias needed for development server
  };
});
