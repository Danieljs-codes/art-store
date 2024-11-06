import { Icons } from "@components/icons";
import { ArtworkCard } from "@components/product-card";
import { Link, useLoaderData } from "@remix-run/react";
import { createSampleArtworks } from "@server/mutations.server";
import { getRecentlyUploadedArtworks } from "@server/queries.server";
import { buttonStyles } from "@ui/button";
import type { MetaFunction } from "@vercel/remix";
import { json } from "@vercel/remix";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

export const loader = async () => {
	const artworks = await getRecentlyUploadedArtworks();
	return json({ artworks });
};

export const action = async () => {
	await createSampleArtworks("cbtmfsmk5605x4p865a2e33i");
	return json({ success: true });
};

export default function Index() {
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
		</div>
	);
}
