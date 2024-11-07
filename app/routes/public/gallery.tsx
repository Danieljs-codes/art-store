import { ARTWORK_CATEGORIES, currencyFormatter } from "@/lib/misc";
import { Icons } from "@components/icons";
import { ArtworkCard } from "@components/product-card";
import { useLoaderData } from "@remix-run/react";
import { getArtworks, getMinAndMaxArtworkPrice } from "@server/queries.server";
import { Checkbox } from "@ui/checkbox";
import { Button, Slider } from "ui";

export const loader = async () => {
	const { min, max } = await getMinAndMaxArtworkPrice();

	console.log(min, max);

	const artworks = await getArtworks();
	return {
		artworks,
		priceRange: { min, max },
	};
};

const Gallery = () => {
	const { artworks, priceRange } = useLoaderData<typeof loader>();
	return (
		<div>
			<div className="mb-6">
				<h1 className="text-xl md:text-2xl font-semibold">Explore Artworks</h1>
				<div className="md:hidden flex justify-end mt-3">
					<Button size="small" appearance="outline">
						<Icons.Filter />
						Filter
					</Button>
				</div>
			</div>
			<div className="md:grid md:grid-cols-5 gap-12">
				<aside className="md:col-span-1 hidden md:block">
					<div className="flex flex-col gap-4">
						<div className="space-y-2">
							<h3 className="text-sm font-semibold">Categories</h3>
							<div className="flex flex-col gap-2">
								<Checkbox>All</Checkbox>
								{ARTWORK_CATEGORIES.map((category) => (
									<Checkbox className={"capitalize"} key={category}>
										{category.toLowerCase()}
									</Checkbox>
								))}
							</div>
						</div>
						<div className="space-y-2">
							<h3 className="text-sm font-semibold">Price</h3>
							<Slider
								defaultValue={[priceRange.min / 100, priceRange.max / 100]}
								minValue={priceRange.min / 100}
								maxValue={priceRange.max / 100}
								showValue={(value) => {
									return `${currencyFormatter(value[0])} - ${currencyFormatter(value[1])}`;
								}}
							/>
						</div>
					</div>
				</aside>
				<div className="md:col-span-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{artworks.map((artwork) => (
							<ArtworkCard key={artwork.id} {...artwork} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
export default Gallery;
