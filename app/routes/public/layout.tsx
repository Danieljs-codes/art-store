import { authClient } from "@/lib/auth-client";
import { Footer } from "@components/footer";
import { Icons } from "@components/icons";
import { Logo } from "@components/logo";
import {
	Link,
	Outlet,
	useLoaderData,
	useLocation,
	useNavigate,
} from "@remix-run/react";
import { getArtist, getUser } from "@server/queries.server";
import type { LoaderFunctionArgs } from "@vercel/remix";
import {
	IconBag2,
	IconChevronLgDown,
	IconCommandRegular,
	IconDashboard,
	IconHeadphones,
	IconLogout,
	IconMoon,
	IconSettings,
	IconSun,
} from "justd-icons";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Avatar, Button, Menu, Navbar, Separator, buttonStyles } from "ui";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getUser(request.headers);

	if (!user) return { user: null, artist: null };

	const artist = await getArtist(user.user.id);
	return { user, artist };
};

const PublicLayout = () => {
	const location = useLocation();
	const pathname = location.pathname;
	const navigate = useNavigate();
	const { theme, setTheme } = useTheme();
	const { user, artist } = useLoaderData<typeof loader>();

	const logout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					navigate("/");
				},
			},
		});
	};

	const toggleTheme = () => {
		setTheme(theme === "dark" ? "light" : "dark");
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar intent="inset">
				<Navbar.Nav>
					<Navbar.Logo href="/">
						<Logo iconOnly classNames={{ icon: "size-7" }} />
					</Navbar.Logo>
					<Navbar.Section>
						<Navbar.Item href="/" isCurrent={pathname === "/"}>
							Home
						</Navbar.Item>
						<Navbar.Item href="/artwork" isCurrent={pathname === "/artwork"}>
							Artworks
						</Navbar.Item>
						<Navbar.Item isCurrent={pathname === "/artist"} href="/artist">
							Artists
						</Navbar.Item>
						<Navbar.Item isCurrent={pathname === "/orders"} href="/orders">
							Orders
						</Navbar.Item>
						<Navbar.Item isCurrent={pathname === "/wishlist"} href="/wishlist">
							Wishlist
						</Navbar.Item>
						<Navbar.Item isCurrent={pathname === "/cart"} href="/cart">
							Cart
						</Navbar.Item>
					</Navbar.Section>
					<Navbar.Section className="ml-auto hidden lg:flex">
						<div className="flex items-center gap-x-2">
							<Button
								appearance="plain"
								size="square-petite"
								aria-label="Toggle Theme"
								onPress={toggleTheme}
							>
								{theme === "dark" ? <IconSun /> : <IconMoon />}
							</Button>
							<Button
								appearance="plain"
								size="square-petite"
								aria-label="Your Bag"
							>
								<IconBag2 />
							</Button>
						</div>
						<Separator orientation="vertical" className="h-6 ml-0 mr-2" />
						{!user && (
							<Link
								className={buttonStyles({
									intent: "secondary",
									size: "small",
								})}
								to={"/sign-in"}
							>
								<Icons.SignIn />
								Sign in
							</Link>
						)}
						{user && artist && (
							<>
								<Menu>
									<Menu.Trigger
										aria-label="Open Menu"
										className="group gap-x-2 flex items-center"
									>
										<Avatar
											alt="slash"
											size="small"
											shape="square"
											initials={user.user.name[0]}
										/>
										<IconChevronLgDown className="size-4 group-pressed:rotate-180 transition-transform" />
									</Menu.Trigger>
									<Menu.Content
										placement="bottom"
										showArrow
										className="sm:min-w-56"
									>
										<Menu.Section>
											<Menu.Header separator>
												<span className="block text-sm">{user.user.name}</span>
												<span className="font-normal text-muted-fg text-sm">
													{user.user.email}
												</span>
											</Menu.Header>
										</Menu.Section>

										<Menu.Item className="text-sm" href="/dashboard">
											<IconDashboard />
											Dashboard
										</Menu.Item>
										<Menu.Item className="text-sm" href="#settings">
											<IconSettings />
											Settings
										</Menu.Item>
										<Menu.Separator />
										<Menu.Item className="text-sm">
											<IconCommandRegular />
											Command Menu
										</Menu.Item>
										<Menu.Separator />
										<Menu.Item className="text-sm" href="#contact-s">
											<IconHeadphones />
											Contact Support
										</Menu.Item>
										<Menu.Separator />
										<Menu.Item
											className="text-sm"
											onAction={() => {
												toast.promise(logout, {
													success: "Logged out",
													error: "Failed to log out",
													loading: "Logging out...",
												});
											}}
										>
											<IconLogout />
											Log out
										</Menu.Item>
									</Menu.Content>
								</Menu>
							</>
						)}
					</Navbar.Section>
				</Navbar.Nav>
				<Navbar.Compact>
					<Navbar.Flex>
						<Navbar.Trigger className="-ml-2" />
					</Navbar.Flex>
					<Navbar.Flex>
						<Navbar.Flex>
							<Button
								appearance="plain"
								size="square-petite"
								aria-label="Toggle Theme"
								onPress={toggleTheme}
							>
								{theme === "dark" ? <IconSun /> : <IconMoon />}
							</Button>
							<Button
								appearance="plain"
								size="square-petite"
								aria-label="Your Bag"
							>
								<IconBag2 />
							</Button>
							<Separator orientation="vertical" className="h-6 ml-0 mr-2" />
							{user && artist && (
								<>
									<Menu>
										<Menu.Trigger
											aria-label="Open Menu"
											className="group gap-x-2 flex items-center"
										>
											<Avatar
												alt="slash"
												size="small"
												shape="square"
												initials={user.user.name[0]}
											/>
											<IconChevronLgDown className="size-4 group-pressed:rotate-180 transition-transform" />
										</Menu.Trigger>
										<Menu.Content
											placement="bottom"
											showArrow
											className="sm:min-w-56"
										>
											<Menu.Section>
												<Menu.Header separator>
													<span className="block text-sm">
														{user.user.name}
													</span>
													<span className="font-normal text-muted-fg text-sm">
														{user.user.email}
													</span>
												</Menu.Header>
											</Menu.Section>

											<Menu.Item className="text-sm" href="/dashboard">
												<IconDashboard />
												Dashboard
											</Menu.Item>
											<Menu.Item className="text-sm" href="#settings">
												<IconSettings />
												Settings
											</Menu.Item>
											<Menu.Separator />
											<Menu.Item className="text-sm">
												<IconCommandRegular />
												Command Menu
											</Menu.Item>
											<Menu.Separator />
											<Menu.Item className="text-sm" href="#contact-s">
												<IconHeadphones />
												Contact Support
											</Menu.Item>
											<Menu.Separator />
											<Menu.Item
												className="text-sm"
												onAction={() => {
													toast.promise(logout, {
														success: "Logged out",
														error: "Failed to log out",
														loading: "Logging out...",
													});
												}}
											>
												<IconLogout />
												Log out
											</Menu.Item>
										</Menu.Content>
									</Menu>
								</>
							)}
							{!user && (
								<Link
									className={buttonStyles({
										intent: "secondary",
										size: "extra-small",
									})}
									to={"/sign-in"}
								>
									<Icons.SignIn />
									Sign in
								</Link>
							)}
						</Navbar.Flex>
					</Navbar.Flex>
				</Navbar.Compact>

				<Navbar.Inset>
					<Outlet />
				</Navbar.Inset>
			</Navbar>
			{/* <main className="flex-1">
				<Outlet />
			</main> */}
			<Footer />
		</div>
	);
};
export default PublicLayout;
