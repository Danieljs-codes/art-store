import { ARTWORK_CATEGORIES, currencyFormatter } from "@/lib/misc";
import { Icons } from "@components/icons";
import { ArtworkCard } from "@components/product-card";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { getArtworks, getMinAndMaxArtworkPrice } from "@server/queries.server";
import { Checkbox } from "@ui/checkbox";
import { Button, Slider } from "ui";

interface GallerySearchParams {
	categories?: string[];
	minPrice?: number;
	maxPrice?: number;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const searchParams = url.searchParams;

	const categories = searchParams.getAll("category");
	const minPrice = Number(searchParams.get("minPrice")) || undefined;
	const maxPrice = Number(searchParams.get("maxPrice")) || undefined;

	const { min, max } = await getMinAndMaxArtworkPrice();
	const artworks = await getArtworks({ categories, minPrice, maxPrice });

	return {
		artworks,
		priceRange: { min, max },
		filters: { categories, minPrice, maxPrice },
	};
};

function Gallery() {
	const {
		artworks: { artworks },
		priceRange,
		filters,
	} = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();

	function handleCategoryChange(category: string, checked: boolean) {
		const currentCategories = searchParams.getAll("category");
		let newCategories: string[];

		if (category === "all") {
			newCategories = checked ? [] : [];
		} else {
			newCategories = checked
				? [...currentCategories, category]
				: currentCategories.filter((c) => c !== category);
		}

		const params = new URLSearchParams(searchParams);
		params.delete("category");
		// biome-ignore lint/complexity/noForEach: <explanation>
		newCategories.forEach((c) => params.append("category", c));
		setSearchParams(params);
	}

	function handlePriceChange(value: [number, number]) {
		const params = new URLSearchParams(searchParams);
		params.set("minPrice", (value[0] * 100).toString());
		params.set("maxPrice", (value[1] * 100).toString());
		setSearchParams(params);
	}

	function handleReset() {
		setSearchParams({});
	}

	const selectedCategories = searchParams.getAll("category");
	const isAllSelected = selectedCategories.length === 0;

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
								<Checkbox
									isSelected={isAllSelected}
									onChange={(checked) => handleCategoryChange("all", !!checked)}
								>
									All
								</Checkbox>
								{ARTWORK_CATEGORIES.map((category) => (
									<Checkbox
										key={category}
										className="capitalize"
										isSelected={selectedCategories.includes(category)}
										onChange={(checked) =>
											handleCategoryChange(category, !!checked)
										}
									>
										{category.toLowerCase()}
									</Checkbox>
								))}
							</div>
						</div>
						<div className="space-y-2">
							<h3 className="text-sm font-semibold">Price</h3>
							<Slider
								defaultValue={[
									filters.minPrice
										? filters.minPrice / 100
										: priceRange.min / 100,
									filters.maxPrice
										? filters.maxPrice / 100
										: priceRange.max / 100,
								]}
								minValue={priceRange.min / 100}
								maxValue={priceRange.max / 100}
								onChange={(value) => {
									if (Array.isArray(value) && value.length === 2)
										handlePriceChange(value as [number, number]);
								}}
								showValue={(value) => {
									if (Array.isArray(value))
										return `${currencyFormatter(value[0])} - ${currencyFormatter(value[1])}`;
									return "";
								}}
							/>
						</div>
						<Button
							size="small"
							appearance="outline"
							className="mt-6"
							onPress={handleReset}
						>
							Reset
						</Button>
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
}

export default Gallery;
