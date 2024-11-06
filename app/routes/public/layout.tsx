import { authClient } from "@/lib/auth-client";
import { Logo } from "@components/logo";
import { Link, Outlet, useLoaderData, useNavigate } from "@remix-run/react";
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
		<div>
			<Navbar intent="inset">
				<Navbar.Nav>
					<Navbar.Logo href="/">
						<Logo iconOnly classNames={{ icon: "size-7" }} />
					</Navbar.Logo>
					<Navbar.Section>
						<Navbar.Item href="/artworks">Artworks</Navbar.Item>
						<Navbar.Item href="/artists">Artists</Navbar.Item>
						<Navbar.Item href="/orders">Orders</Navbar.Item>
						<Navbar.Item href="/wishlist">Wishlist</Navbar.Item>
						<Navbar.Item href="/cart">Cart</Navbar.Item>
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
									size: "extra-small",
								})}
								to={"/sign-in"}
							>
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
		</div>
	);
};
export default PublicLayout;
