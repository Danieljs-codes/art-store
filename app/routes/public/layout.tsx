import { Logo } from "@components/logo";
import { Outlet } from "@remix-run/react";
import { IconBag2, IconSearch } from "justd-icons";
import { Heading } from "react-aria-components";
import { Button, Navbar } from "ui";

const PublicLayout = () => {
	return (
		<div>
			<Navbar intent="floating">
				<Navbar.Nav>
					<Navbar.Logo href="#">
						<Logo iconOnly classNames={{ icon: "size-6" }} />
					</Navbar.Logo>
					<Navbar.Section>
						<Navbar.Item href="#">Home</Navbar.Item>
						<Navbar.Item isCurrent href="#">
							Mac
						</Navbar.Item>
						<Navbar.Item href="#">iPad</Navbar.Item>
						<Navbar.Item href="#">iPhone</Navbar.Item>
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
								aria-label="Search for products"
							>
								<IconSearch />
							</Button>
							<Button
								appearance="plain"
								size="square-petite"
								aria-label="Your Bag"
							>
								<IconBag2 />
							</Button>
						</Navbar.Flex>
					</Navbar.Flex>
				</Navbar.Compact>
				<Navbar.Inset>
					<Heading>Home</Heading>
				</Navbar.Inset>
			</Navbar>
			<Outlet />
		</div>
	);
};
export default PublicLayout;
