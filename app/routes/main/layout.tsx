import { redirectWithToast } from "@/lib/utils/redirect.server";
import { getUserAndArtist } from "@/server/queries.server";
import { AppSidebar } from "@components/app-sidebar";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Avatar } from "@ui/avatar";
import { Button } from "@ui/button";
import { Menu } from "@ui/menu";
import { SearchField } from "@ui/search-field";
import { Separator } from "@ui/separator";
import { Sidebar } from "@ui/sidebar";
import { type LoaderFunctionArgs, json } from "@vercel/remix";
import {
	IconChevronLgDown,
	IconCirclePerson,
	IconLogout,
	IconMoon,
	IconSearch,
	IconSettings,
	IconShield,
	IconSun,
} from "justd-icons";
import { useTheme } from "next-themes";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userAndArtist = await getUserAndArtist(request.headers);

	if (!userAndArtist) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You have to be an artist to access this page",
		});
	}

	return json({
		user: userAndArtist.user.user,
		artist: userAndArtist.artist,
		session: userAndArtist.user.session,
	});
};

const DashboardLayout = () => {
	const { user, artist, session } = useLoaderData<typeof loader>();

	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<Sidebar.Provider>
			<AppSidebar
				user={{
					...user,
					createdAt: new Date(user.createdAt),
					updatedAt: new Date(user.updatedAt),
				}}
				collapsible="offcanvas"
				intent="inset"
			/>
			<Sidebar.Inset>
				<header className="sticky justify-between sm:justify-start top-0 bg-bg h-[3.57rem] px-4 border-b flex items-center gap-x-2">
					<span className="flex items-center">
						<Sidebar.Trigger className="-ml-1" />
						<Separator className="h-6 sm:block hidden" orientation="vertical" />
					</span>
					<SearchField className="sm:inline hidden sm:ml-1.5" />
					<div className="flex sm:hidden items-center gap-x-2">
						<Button
							appearance="plain"
							aria-label="Search..."
							size="square-petite"
						>
							<IconSearch />
						</Button>
						<Menu>
							<Menu.Trigger
								aria-label="Profile"
								className="flex items-center gap-x-2 group"
							>
								<Avatar
									size="small"
									shape="circle"
									src={user.image}
									initials={user.name[0]}
								/>
								<IconChevronLgDown className="size-4 group-pressed:rotate-180 transition-transform" />
							</Menu.Trigger>
							<Menu.Content className="min-w-[--trigger-width]">
								<Menu.Item className="text-sm" href="/profile">
									<IconCirclePerson />
									Profile
								</Menu.Item>
								<Menu.Item className="text-sm" href="/settings">
									<IconSettings />
									Settings
								</Menu.Item>
								<Menu.Item className="text-sm" href="/security">
									<IconShield />
									Security
								</Menu.Item>
								<Menu.Separator />
								<Menu.Item onAction={toggleTheme} className="text-sm">
									{theme === "dark" ? <IconSun /> : <IconMoon />}
									Toggle Theme
								</Menu.Item>
								<Menu.Separator />
								<Menu.Item className="text-sm" href="/sign-out" isDanger>
									<IconLogout />
									Sign out
								</Menu.Item>
							</Menu.Content>
						</Menu>
					</div>
				</header>
				<div className="p-4 lg:p-6">
					<Outlet />
				</div>
			</Sidebar.Inset>
		</Sidebar.Provider>
	);
};
export default DashboardLayout;
