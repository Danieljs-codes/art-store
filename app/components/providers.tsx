import { RouterProvider } from "react-aria-components";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
	

	return (
		<RouterProvider navigate={router.push}>
			<ThemeProvider attribute="class">{children}</ThemeProvider>
		</RouterProvider>
	);
}
