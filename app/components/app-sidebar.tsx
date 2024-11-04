import type * as React from "react";

import type { authClient } from "@/lib/auth-client";
import { useLocation } from "@remix-run/react";
import { Avatar } from "@ui/avatar";
import { Button } from "@ui/button";
import { Link } from "@ui/link";
import { Menu } from "@ui/menu";
import { Sidebar } from "@ui/sidebar";
import {
	IconChevronLgDown,
	IconCirclePerson,
	IconDashboard,
	IconLogout,
	IconMoon,
	IconSettings,
	IconSun,
} from "justd-icons";
import { useTheme } from "next-themes";
import { Icons } from "./icons";
import { Logo } from "./logo";

type User = (typeof authClient.$Infer.Session)["user"];

const sidebarRoutes = [
	{
		icon: IconDashboard,
		label: "Overview",
		href: "/dashboard",
	},
	{
		icon: Icons.Artwork,
		label: "Artworks",
		href: "/artworks",
	},
	{
		icon: Icons.Order,
		label: "Orders",
		href: "/orders",
	},
	{
		icon: Icons.Discount,
		label: "Discounts",
		href: "/discounts",
	},
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	user: User;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
	const pathname = useLocation().pathname;
	const { theme, setTheme } = useTheme();

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<Sidebar {...props}>
			<Sidebar.Header>
				<Link
					className="flex items-center group-data-[collapsible=dock]:size-10 group-data-[collapsible=dock]:justify-center gap-x-2"
					href="/"
				>
					<Logo iconOnly classNames={{ icon: "size-6" }} />
					<strong className="font-medium group-data-[collapsible=dock]:hidden">
						BoltShift
					</strong>
				</Link>
			</Sidebar.Header>
			<Sidebar.Content>
				<Sidebar.Section>
					{sidebarRoutes.map((route) => (
						<Sidebar.Item
							key={route.href}
							icon={route.icon}
							href={route.href}
							className={"text-sm"}
							isCurrent={pathname
								.toLowerCase()
								.includes(route.href.toLowerCase())}
						>
							{route.label}
						</Sidebar.Item>
					))}
				</Sidebar.Section>
				{/* <Sidebar.Section collapsible title="Team">
					<Sidebar.Item icon={IconPeople} href="#">
						Team Overview
					</Sidebar.Item>
					<Sidebar.Item icon={IconPersonAdd} href="#">
						Add New Member
					</Sidebar.Item>
					<Sidebar.Item href="#">Manage Roles</Sidebar.Item>
				</Sidebar.Section> */}
			</Sidebar.Content>
			<Sidebar.Footer className="lg:flex lg:flex-row hidden items-center">
				<Menu>
					<Button
						appearance="plain"
						aria-label="Profile"
						slot="menu-trigger"
						className="group"
					>
						<Avatar
							size="small"
							shape="square"
							src={user.image}
							initials={user.name[0]}
						/>
						<span className="group-data-[collapsible=dock]:hidden flex items-center justify-center">
							{user.name}
							<IconChevronLgDown className="right-3 size-4 absolute group-pressed:rotate-180 transition-transform" />
						</span>
					</Button>
					<Menu.Content className="min-w-[--trigger-width]">
						<Menu.Item href="#">
							<IconCirclePerson />
							Profile
						</Menu.Item>
						<Menu.Item href="#">
							<IconSettings />
							Settings
						</Menu.Item>
						<Menu.Separator />
						<Menu.Item onAction={toggleTheme}>
							{theme === "dark" ? <IconSun /> : <IconMoon />}
							Toggle Theme
						</Menu.Item>
						<Menu.Separator />
						<Menu.Item href="#">
							<IconLogout />
							Log out
						</Menu.Item>
					</Menu.Content>
				</Menu>
			</Sidebar.Footer>
			<Sidebar.Rail />
		</Sidebar>
	);
}
