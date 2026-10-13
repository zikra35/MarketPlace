// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, componentTagger (dev-only),
//     VITE_* env injection, @ path alias, React/TanStack dedupe, error logger plugins,
//     and sandbox detection (port/host/strictPort).
//
// Deployment target: Vercel. The Cloudflare build is turned off and Nitro builds the
// server instead (Nitro picks the Vercel preset automatically when building on Vercel).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// On Vercel, set BACKEND_URL to the Railway backend (e.g. https://xxx.up.railway.app).
// Requests to /api/* on the Vercel domain are then forwarded to Railway, so the browser
// only ever talks to ONE domain and the login cookies work in every browser (Safari and
// others block cookies set by a different domain).
const backendUrl = (process.env.BACKEND_URL || "").replace(/\/+$/, "");

export default defineConfig({
  cloudflare: false,
  vite: {
    plugins: [
      nitro(
        backendUrl
          ? { routeRules: { "/api/**": { proxy: `${backendUrl}/api/**` } } }
          : {}
      ),
    ],
  },
});
