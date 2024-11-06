import { Logo } from "@components/logo";
import { Link } from "@remix-run/react";

function Footer() {
	return (
		<footer className="border-t">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="py-12 md:py-16">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
						{/* Logo and description */}
						<div className="space-y-4">
							<Logo classNames={{ icon: "size-7" }} />
							<p className="text-sm text-muted-fg max-w-xs">
								Discover and collect extraordinary artworks from talented
								artists around the world.
							</p>
						</div>

						{/* Quick Links */}
						<div>
							<h3 className="text-sm font-semibold mb-4">Quick Links</h3>
							<ul className="space-y-3 text-sm">
								{quickLinks.map((link) => (
									<li key={link.href}>
										<Link
											to={link.href}
											className="text-muted-fg hover:text-foreground transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Legal */}
						<div>
							<h3 className="text-sm font-semibold mb-4">Legal</h3>
							<ul className="space-y-3 text-sm">
								{legalLinks.map((link) => (
									<li key={link.href}>
										<Link
											to={link.href}
											className="text-muted-fg hover:text-foreground transition-colors"
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Social */}
						<div>
							<h3 className="text-sm font-semibold mb-4">Follow Us</h3>
							<ul className="space-y-3 text-sm">
								{socialLinks.map((link) => (
									<li key={link.href}>
										<a
											href={link.href}
											target="_blank"
											rel="noopener noreferrer"
											className="text-muted-fg hover:text-foreground transition-colors"
										>
											{link.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className="mt-12 border-t pt-8">
						<p className="text-center text-sm text-muted-fg">
							© {new Date().getFullYear()} Art Gallery. All rights reserved.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}

export { Footer };

// Static content
const quickLinks = [
	{ label: "Artworks", href: "/artworks" },
	{ label: "Artists", href: "/artists" },
	{ label: "Orders", href: "/orders" },
	{ label: "Wishlist", href: "/wishlist" },
	{ label: "Cart", href: "/cart" },
];

const legalLinks = [
	{ label: "Privacy Policy", href: "/privacy" },
	{ label: "Terms of Service", href: "/terms" },
	{ label: "Cookie Policy", href: "/cookies" },
	{ label: "Shipping Policy", href: "/shipping" },
];

const socialLinks = [
	{ label: "Twitter", href: "https://twitter.com" },
	{ label: "Instagram", href: "https://instagram.com" },
	{ label: "Facebook", href: "https://facebook.com" },
	{ label: "LinkedIn", href: "https://linkedin.com" },
];
