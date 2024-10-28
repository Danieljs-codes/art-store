import { Logo } from "@/components/logo";
import { Link, Outlet } from "@remix-run/react";

function AuthLayout() {
	return (
		<div>
			<div className="h-full flex flex-col items-center pt-12 md:pt-24 px-4">
				<Link to="/">
					<Logo classNames={{ container: "mb-6", icon: "h-10 w-10" }} />
				</Link>
				<div className="w-full max-w-[400px]">
					<Outlet />
				</div>
			</div>
		</div>
	);
}
export default AuthLayout;
