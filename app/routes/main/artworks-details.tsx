import { convertKoboToNaira, currencyFormatter } from "@/lib/misc";
import { redirectWithToast } from "@/lib/utils/redirect.server";
import { Icons } from "@components/icons";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { archiveArtwork, unarchiveArtwork } from "@server/mutations.server";
import {
	getArtist,
	getArtwork,
	getArtworkWithPurchases,
	getUser,
} from "@server/queries.server";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Card } from "@ui/card";
import { Carousel } from "@ui/carousel";
import { Loader } from "@ui/loader";
import { cn } from "@ui/primitive";
import { Tabs } from "@ui/tabs";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
	redirect,
} from "@vercel/remix";

export const action = async ({ request, params }: ActionFunctionArgs) => {
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (
		typeof intent !== "string" ||
		(intent !== "archive" && intent !== "unarchive")
	) {
		return json(
			{
				error: "Invalid intent",
			},
			{ status: 400 },
		);
	}
	const id = params.id;
	if (!id) {
		return redirect("/artworks");
	}

	const user = await getUser(request.headers);

	if (!user) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You must be logged in to view this page",
		});
	}

	// Check if user is an artist
	const artist = await getArtist(user.user.id);

	if (!artist) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You must be an artist to view this page",
		});
	}

	// Check if user owns the artwork
	const artwork = await getArtwork({ artworkId: id });

	if (!artwork) {
		return redirectWithToast("/artworks", {
			intent: "warning",
			message: "Artwork not found",
		});
	}

	if (artwork.artistId !== artist.id) {
		return redirectWithToast("/artworks", {
			intent: "warning",
			message: `You are not authorized to ${intent} this artwork`,
		});
	}

	if (intent === "archive") {
		await archiveArtwork({ artworkId: id, userId: user.user.id });
	}

	if (intent === "unarchive") {
		await unarchiveArtwork({ artworkId: id, userId: user.user.id });
	}

	return json({
		status: "success" as const,
	});
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const id = params.id;
	if (!id) {
		return redirect("/artworks");
	}

	const user = await getUser(request.headers);

	if (!user) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You must be logged in to view this page",
		});
	}

	// Check if user is an artist
	const artist = await getArtist(user.user.id);

	if (!artist) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You must be an artist to view this page",
		});
	}

	// Get artwork details
	const artwork = await getArtworkWithPurchases({ artworkId: id });

	if (!artwork) {
		throw new Response("Artwork not found", {
			status: 404,
			statusText: "Not Found",
		});
	}

	// Validate artist is the owner of the artwork
	if (artwork.artistId !== artist.id) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You are not authorized to view this page",
		});
	}

	// Add any additional data you need for the tabs
	const stats = {
		views: artwork.views,
		quantityLeft: artwork.quantity,
		wishlist: 1000,
		purchases: artwork.purchases.length || 0,
	};

	return json({
		id,
		artwork,

		stats,
	});
};

const ArtworkDetails = () => {
	const submit = useSubmit();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const data = useLoaderData<typeof loader>();
	return (
		<div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="">
					<Carousel
						className="w-full"
						opts={{
							loop: true,
						}}
					>
						<Carousel.Content
							items={data.artwork.images.map((image) => ({
								id: image,
								image: image,
							}))}
						>
							{(item) => (
								<Carousel.Item id={item.id}>
									<Card className="overflow-hidden">
										<Card.Content className="flex aspect-square items-center justify-center p-0">
											<img
												src={item.image}
												alt={data.artwork.title}
												className="h-full w-full object-contain overflow-hidden"
											/>
										</Card.Content>
									</Card>
								</Carousel.Item>
							)}
						</Carousel.Content>
						<Carousel.Handler>
							<Carousel.Button slot="previous" />
							<Carousel.Button slot="next" />
						</Carousel.Handler>
					</Carousel>
				</div>
				{/* Grid second column */}
				<div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold mb-2 capitalize">
							{data.artwork.title.toLowerCase()}
						</h1>
						<p className="text-muted-fg text-sm md:text-base text-pretty pr-3 first-letter:uppercase">
							{data.artwork.description.toLowerCase()}
						</p>
					</div>
					<Button
						className={cn(
							"mt-4",
							data.artwork.status === "ARCHIVED" && "hidden",
						)}
						intent={"danger"}
						size="small"
						onPress={() => submit({ intent: "archive" }, { method: "post" })}
						isPending={isSubmitting}
					>
						{isSubmitting ? <Loader variant="spin" /> : <Icons.Archive />}
						{isSubmitting ? "Archiving..." : "Archive Artwork"}
					</Button>
					<Button
						className={cn(
							"mt-4",
							data.artwork.status !== "ARCHIVED" && "hidden",
						)}
						intent={"primary"}
						size="small"
						onPress={() => submit({ intent: "unarchive" }, { method: "post" })}
						isPending={isSubmitting}
					>
						{isSubmitting ? <Loader variant="spin" /> : <Icons.Restore />}
						{isSubmitting ? "Unarchiving..." : "Unarchive Artwork"}
					</Button>
					<div className="space-y-5">
						<Card className="mt-6">
							<Card.Header>Quick Stats</Card.Header>
							<Card.Content>
								<div className="flex items-center gap-4 justify-between">
									<div>
										<p className="text-sm font-muted-fg font-medium">Price</p>
										<p className="text-base font-bold">
											{currencyFormatter(
												convertKoboToNaira(data.artwork.price),
											)}
										</p>
									</div>
									<div>
										<p className="text-sm font-muted-fg font-medium">Listed</p>
										<p className="text-base font-bold">
											{new Date(data.artwork.createdAt).toLocaleDateString(
												"en-US",
												{
													month: "short",
													day: "numeric",
													year: "numeric",
												},
											)}
										</p>
									</div>
								</div>
							</Card.Content>
						</Card>

						<Card>
							<Card.Header>Tags</Card.Header>
							<Card.Content>
								<div className="flex flex-wrap gap-2">
									{data.artwork.tags.map((tag) => (
										<Badge
											key={tag}
											shape="circle"
											className="lowercase"
											intent="secondary"
										>
											<Icons.Tags />
											{tag}
										</Badge>
									))}
								</div>
							</Card.Content>
						</Card>
					</div>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
				<div>
					<Card>
						<Card.Content className="py-4">
							<Tabs defaultSelectedKey="info">
								<Tabs.List>
									<Tabs.Tab id="info">
										<Icons.InfoCircle />
										Info
									</Tabs.Tab>
									<Tabs.Tab id="stats">
										<Icons.Chart />
										Stats
									</Tabs.Tab>
								</Tabs.List>
								<Tabs.Panel id="info">
									<div className="space-y-4 py-4">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-sm text-muted-fg">Category</p>
												<Badge intent="secondary" className="mt-1 capitalize">
													{data.artwork.category.toLowerCase()}
												</Badge>
											</div>
											<div>
												<p className="text-sm text-muted-fg">Dimensions</p>
												<p className="font-medium">{data.artwork.dimensions}</p>
											</div>
											<div>
												<p className="text-sm text-muted-fg">Medium</p>
												<p className="font-medium capitalize">
													{data.artwork.medium?.toLowerCase() || "N/A"}
												</p>
											</div>
											<div>
												<p className="text-sm text-muted-fg">Frame Type</p>
												<p className="font-medium">
													{data.artwork.frameType || "N/A"}
												</p>
											</div>
											<div>
												<p className="text-sm text-muted-fg">Status</p>
												<Badge
													intent={
														data.artwork.status === "PUBLISHED"
															? "success"
															: "danger"
													}
													className="mt-1 capitalize"
												>
													{data.artwork.status.toLowerCase()}
												</Badge>
											</div>
										</div>
									</div>
								</Tabs.Panel>
								<Tabs.Panel id="stats">
									<div className="space-y-4 py-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="text-center">
												<p className="text-2xl font-bold">{data.stats.views}</p>
												<p className="text-sm text-muted-fg">Total Views</p>
											</div>
											<div className="text-center">
												<p className="text-2xl font-bold">
													{data.stats.quantityLeft}
												</p>
												<p className="text-sm text-muted-fg">Pieces Left</p>
											</div>
											<div className="text-center">
												<p className="text-2xl font-bold">
													{data.stats.purchases}
												</p>
												<p className="text-sm text-muted-fg">Pieces Sold</p>
											</div>
											<div className="text-center">
												<p className="text-2xl font-bold">
													{data.stats.wishlist}
												</p>
												<p className="text-sm text-muted-fg">
													Saved by Collectors
												</p>
											</div>
										</div>
									</div>
								</Tabs.Panel>
							</Tabs>
						</Card.Content>
					</Card>
				</div>
				<div></div>
			</div>
		</div>
	);
};
export default ArtworkDetails;
