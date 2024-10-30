import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { vercelPreset } from "@vercel/remix/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
	plugins: [
		remix({
			presets: [vercelPreset()],
			routes(defineRoutes) {
				return defineRoutes((route) => {
					route("/", "routes/index.tsx");
					route("api/auth/*", "routes/api.auth.$.ts");
					route("api/uploadthing", "routes/api.uploadthing.ts");
					route("", "routes/auth/layout.tsx", () => {
						route("sign-in", "routes/auth/sign-in.tsx");
						route("sign-up", "routes/auth/sign-up.tsx");
					});
					route("create-artist", "routes/main/create-artist.tsx");
					route("", "routes/main/layout.tsx", () => {
						route("dashboard", "routes/main/dashboard.tsx");
						route("artworks", "routes/main/artworks.tsx");
						route("artworks/new", "routes/main/artworks-new.tsx");
					});
				});
			},
		}),
		tsconfigPaths(),
	],
});
