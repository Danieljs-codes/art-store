import { ARTWORK_CATEGORIES, currencyFormatter } from "@/lib/misc";
import { Icons } from "@components/icons";
import { ArtworkCard } from "@components/product-card";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { getArtworks, getMinAndMaxArtworkPrice } from "@server/queries.server";
import { Badge } from "@ui/badge";
import { Checkbox } from "@ui/checkbox";
import { IconChevronLeft, IconChevronRight, IconX } from "justd-icons";
import { useCallback } from "react";
import { Button, Sheet, Slider } from "ui";

interface GallerySearchParams {
	categories?: string[];
	minPrice?: number;
	maxPrice?: number;
	page?: number;
	limit?: number;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const searchParams = url.searchParams;

	const categories = searchParams.getAll("category");
	const minPrice = Number(searchParams.get("minPrice")) || undefined;
	const maxPrice = Number(searchParams.get("maxPrice")) || undefined;
	const page = Number(searchParams.get("page")) || 1;
	const limit = 9; // Number of items per page

	const [priceRange, artworksData] = await Promise.all([
		getMinAndMaxArtworkPrice(),
		getArtworks({
			categories,
			minPrice,
			maxPrice,
			page,
			limit,
		}),
	]);

	return {
		artworks: artworksData,
		priceRange,
		filters: { categories, minPrice, maxPrice },
		pagination: {
			currentPage: page,
			totalPages: artworksData.pagination.pageCount,
			hasNextPage: page < artworksData.pagination.pageCount,
			hasPreviousPage: page > 1,
		},
	};
};

function Gallery() {
	const {
		artworks: { artworks },
		priceRange,
		filters,
		pagination,
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

	const handlePageChange = useCallback(
		(direction: "next" | "prev") => {
			const currentPage = Number(searchParams.get("page")) || 1;
			const params = new URLSearchParams(searchParams);

			if (direction === "next")
				params.set("page", (currentPage + 1).toString());
			else params.set("page", (currentPage - 1).toString());

			setSearchParams(params);
		},
		[searchParams, setSearchParams],
	);

	function getActiveFilters() {
		const filters = [];

		// Add selected categories
		// biome-ignore lint/complexity/noForEach: <explanation>
		selectedCategories.forEach((category) => {
			filters.push({
				type: "category",
				value: category,
				label: category.toLowerCase(),
			});
		});

		// Add price filter if different from default
		const currentMinPrice = Number(searchParams.get("minPrice"));
		const currentMaxPrice = Number(searchParams.get("maxPrice"));
		if (currentMinPrice || currentMaxPrice) {
			filters.push({
				type: "price",
				value: "price",
				label: `${currencyFormatter(currentMinPrice / 100)} - ${currencyFormatter(currentMaxPrice / 100)}`,
			});
		}

		return filters;
	}

	function handleRemoveFilter(filter: { type: string; value: string }) {
		const params = new URLSearchParams(searchParams);

		if (filter.type === "category") {
			const categories = params
				.getAll("category")
				.filter((c) => c !== filter.value);
			params.delete("category");
			// biome-ignore lint/complexity/noForEach: <explanation>
			categories.forEach((c) => params.append("category", c));
		} else if (filter.type === "price") {
			params.delete("minPrice");
			params.delete("maxPrice");
		}

		setSearchParams(params);
	}

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-xl md:text-2xl font-semibold">Explore Artworks</h1>

				{/* Add the active filters section */}
				<div className="mt-4 flex flex-wrap gap-2">
					{getActiveFilters().map((filter, index) => (
						<Badge
							key={`${filter.type}-${index}`}
							intent="secondary"
							className="flex items-center gap-1 capitalize"
						>
							{filter.label}
							<button
								onClick={() => handleRemoveFilter(filter)}
								className="ml-1 hover:text-foreground/80"
								type="button"
							>
								<IconX className="h-3 w-3" />
							</button>
						</Badge>
					))}
					{getActiveFilters().length > 0 && (
						<button
							onClick={handleReset}
							className="text-sm text-muted-foreground hover:text-foreground"
							type="button"
						>
							Clear all
						</button>
					)}
				</div>

				<div className="md:hidden flex justify-end mt-3">
					<Sheet>
						<Button size="small" appearance="outline">
							<Icons.Filter />
							Filter
						</Button>

						<Sheet.Content>
							<Sheet.Header>
								<Sheet.Title>Filters</Sheet.Title>
							</Sheet.Header>
							<div className="flex flex-col gap-6 p-4">
								<div className="space-y-2">
									<h3 className="text-sm font-semibold">Categories</h3>
									<div className="flex flex-col gap-2">
										<Checkbox
											isSelected={isAllSelected}
											onChange={(checked) =>
												handleCategoryChange("all", !!checked)
											}
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
										value={[
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
						</Sheet.Content>
					</Sheet>
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
								value={[
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
					{artworks.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">
								No artworks found matching your criteria
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{artworks.map((artwork) => (
								<ArtworkCard key={artwork.id} {...artwork} />
							))}
						</div>
					)}

					{artworks.length > 0 && (
						<div className="mt-8 flex justify-center gap-4">
							<Button
								size="extra-small"
								appearance="outline"
								isDisabled={!pagination.hasPreviousPage}
								onPress={() => handlePageChange("prev")}
							>
								<IconChevronLeft />
								Previous
							</Button>
							<span className="flex items-center text-xs">
								Page {pagination.currentPage} of {pagination.totalPages}
							</span>

							<Button
								size="extra-small"
								appearance="outline"
								isDisabled={!pagination.hasNextPage}
								onPress={() => handlePageChange("next")}
							>
								Next
								<IconChevronRight />
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Gallery;
