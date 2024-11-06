import { ARTWORK_CATEGORIES } from "@/lib/misc";
import { Icons } from "@components/icons";
import { ArtworkCard } from "@components/product-card";
import { Link, useLoaderData } from "@remix-run/react";
import {
	getPlatformStats,
	getRecentlyUploadedArtworks,
} from "@server/queries.server";
import type { MetaFunction } from "@vercel/remix";
import { defer } from "@vercel/remix";
import Autoplay from "embla-carousel-autoplay";
import { useState } from "react";
import { Card, Carousel, buttonStyles } from "ui";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

export const loader = async () => {
	// Trigger the fetch early but don't wait for it
	const stats = getPlatformStats();
	const artworks = await getRecentlyUploadedArtworks();
	return defer({ artworks, statsPromise: stats });
};

export default function Index() {
	const [plugin] = useState(() =>
		Autoplay({ delay: 3000, stopOnInteraction: true }),
	);
	const { artworks } = useLoaderData<typeof loader>();
	return (
		<div>
			{/* Hero Section	 */}
			<div className="py-12">
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-center text-pretty">
						Discover Art from Emerging Artists
					</h1>
					<p className="text-center text-pretty mt-2 text-muted-fg">
						Explore a curated collection of unique art pieces from emerging
						artists.
					</p>
					<div className="flex items-center justify-center mt-4">
						<Link
							className={buttonStyles({ intent: "primary" })}
							to="/artworks"
						>
							Explore Artworks <Icons.ArrowUpRight />
						</Link>
					</div>
				</div>
			</div>
			{/* Recently Uploaded Artworks Section */}
			<div className="py-8">
				<div className="mb-5">
					<h2 className="text-xl font-semibold">New Artworks</h2>
					<p className="text-muted-fg leading-tight text-sm mt-1">
						Discover recently uploaded artworks from emerging artists
					</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{artworks.map((artwork) => (
						<ArtworkCard key={artwork.id} {...artwork} />
					))}
				</div>
			</div>
			{/* Categories Section */}
			<div className="py-8">
				<h2 className="text-xl font-semibold mb-2">Categories</h2>
				<Carousel
					onMouseEnter={plugin.stop}
					onMouseLeave={plugin.reset}
					plugins={[plugin]}
					opts={{
						loop: true,
						align: "center",
					}}
				>
					<Carousel.Content
						items={ARTWORK_CATEGORIES.map((category) => ({
							id: category,
							label: category,
						}))}
					>
						{(item) => (
							<Carousel.Item id={item.id} className="md:basis-1/2 lg:basis-1/3">
								<div className="p-1">
									<Card className="overflow-clip">
										<div className="relative h-40 bg-fg/5 border-b flex-1">
											<img
												src={`https://picsum.photos/seed/${item.id}/400/300`}
												alt={item.label}
												className="w-full h-full object-cover"
											/>
											<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
												<span className="text-white font-semibold text-lg">
													{item.label}
												</span>
											</div>
										</div>
									</Card>
								</div>
							</Carousel.Item>
						)}
					</Carousel.Content>
					<Carousel.Handler>
						<Carousel.Button slot="previous" />
						<Carousel.Button slot="next" />
					</Carousel.Handler>
				</Carousel>
			</div>
		</div>
	);
}
