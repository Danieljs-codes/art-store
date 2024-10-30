import { ThemeProvider } from "@components/theme-provider";
import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useFetchers,
	useHref,
	useLoaderData,
	useNavigate,
	useNavigation,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/server-runtime";
import { Toast } from "@ui/toast";
import { Analytics } from "@vercel/analytics/react";
import type { LoaderFunctionArgs } from "@vercel/remix";
import NProgress from "nprogress";
import { useEffect, useMemo } from "react";
import { RouterProvider } from "react-aria-components";
import { type NavigateOptions, json } from "react-router-dom";
import { toast as showToast } from "sonner";
import appCss from "./globals.css?url";
import { combineHeaders } from "./lib/utils/misc.server";
import { getToast } from "./lib/utils/redirect.server";

export const links: LinksFunction = () => {
	// if you already have one only add this stylesheet to your list of links
	return [{ rel: "stylesheet", href: appCss }];
};

declare module "react-aria-components" {
	interface RouterConfig {
		routerOptions: NavigateOptions;
	}
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const { headers: toastHeaders, toast } = await getToast(request);

	return json({ toast }, { headers: combineHeaders(toastHeaders) });
};

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="font-sans bg-bg antialiased">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
				<Analytics />
			</body>
		</html>
	);
}

export default function App() {
	const fetchers = useFetchers();
	const navigate = useNavigate();
	const navigation = useNavigation();
	const { toast } = useLoaderData<typeof loader>();

	const state = useMemo<"idle" | "loading">(
		function getGlobalState() {
			const states = [
				navigation.state,
				...fetchers.map((fetcher) => fetcher.state),
			];
			if (states.every((state) => state === "idle")) return "idle";
			return "loading";
		},
		[navigation.state, fetchers],
	);

	useEffect(() => {
		NProgress.configure({ showSpinner: false });
		// and when it's something else it means it's either submitting a form or
		// waiting for the loaders of the next location so we start it
		if (state === "loading") NProgress.start();
		// when the state is idle then we can to complete the progress bar
		if (state === "idle") NProgress.done();
	}, [state]);

	useEffect(() => {
		if (toast) {
			showToast[toast.intent as "success" | "error" | "info" | "warning"](
				toast.message,
			);
		}
	}, [toast]);

	return (
		<RouterProvider navigate={navigate} useHref={useHref}>
			<ThemeProvider attribute="class">
				<Outlet />
				<Toast />
			</ThemeProvider>
		</RouterProvider>
	);
}
