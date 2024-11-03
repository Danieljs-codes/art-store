import { convertKoboToNaira, currencyFormatter } from "@/lib/misc";
import { Icons } from "@components/icons";
import { useLoaderData } from "@remix-run/react";
import { db } from "@server/db";
import schema from "@server/db/schema";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Card } from "@ui/card";
import { Carousel } from "@ui/carousel";
import { cn } from "@ui/primitive";
import { Tabs } from "@ui/tabs";
import { type LoaderFunctionArgs, json, redirect } from "@vercel/remix";
import { eq } from "drizzle-orm";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const id = params.id;
	if (!id) {
		return redirect("/artworks");
	}

	// Get artwork details
	const artwork = await db
		.select()
		.from(schema.artworks)
		.where(eq(schema.artworks.id, id))
		.limit(1)
		.then((res) => res[0]);

	if (!artwork) {
		throw new Response("null", {
			status: 404,
			statusText: "Artwork not found",
		});
	}

	return json({
		id,
		artwork,
	});
};

const ArtworkDetails = () => {
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
					>
						<Icons.Archive />
						Archive Artwork
					</Button>
					<Button
						className={cn(
							"mt-4",
							data.artwork.status !== "ARCHIVED" && "hidden",
						)}
						intent={"primary"}
						size="small"
					>
						<Icons.Restore />
						Unarchive Artwork
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
							<Tabs>
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
									<p>Info</p>
								</Tabs.Panel>
								<Tabs.Panel id="stats">
									<p>Stats</p>
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
