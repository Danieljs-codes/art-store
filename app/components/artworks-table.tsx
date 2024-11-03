import { convertKoboToNaira, currencyFormatter } from "@/lib/misc";
import { useSubmit } from "@remix-run/react";
import type schema from "@server/db/schema";
import { Badge, type BadgeIntents } from "@ui/badge";
import { Card } from "@ui/card";
import { Menu } from "@ui/menu";
import { cn } from "@ui/primitive";
import { Table } from "@ui/table";
import { IconDotsVertical } from "justd-icons";
import { Icons } from "./icons";

type Artwork = typeof schema.artworks.$inferSelect;

interface ArtworksTableProps {
	artworks: Artwork[];
}

const getStatusBadgeIntent = (
	status: Artwork["status"],
): BadgeIntents["intent"] => {
	if (status === "PUBLISHED") return "success";
	if (status === "ARCHIVED") return "warning";
	return "primary";
};

export function ArtworksTable({ artworks }: ArtworksTableProps) {
	const submit = useSubmit();
	return (
		<Card>
			<Table aria-label="Artworks Table">
				<Table.Header>
					<Table.Column>ID</Table.Column>
					<Table.Column isRowHeader>Title</Table.Column>
					<Table.Column>Category</Table.Column>
					<Table.Column>Price</Table.Column>
					<Table.Column>Dimensions</Table.Column>
					<Table.Column>Medium</Table.Column>
					<Table.Column>Quantity</Table.Column>
					<Table.Column>Status</Table.Column>
					<Table.Column>Upload Date</Table.Column>
					<Table.Column />
				</Table.Header>
				<Table.Body
					items={artworks}
					renderEmptyState={() => (
						<div className="text-center py-4">
							<Icons.Empty className="text-muted-fg size-6 mx-auto mb-2" />
							<p className="text-base font-semibold text-fg">
								No artworks found
							</p>
							<p className="text-sm text-muted-fg">
								Add your first artwork to get started.
							</p>
						</div>
					)}
				>
					{(item) => (
						<Table.Row id={item.id}>
							<Table.Cell>{item.id}</Table.Cell>
							<Table.Cell className="capitalize">
								{item.title.toLowerCase()}
							</Table.Cell>
							<Table.Cell className="capitalize">
								<Badge intent="secondary" className="capitalize">
									{item.category.toLowerCase()}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								{currencyFormatter(convertKoboToNaira(item.price))}
							</Table.Cell>
							<Table.Cell className="">
								{item.dimensions.toLowerCase()}
							</Table.Cell>
							<Table.Cell className="capitalize">
								{item.medium.toLowerCase()}
							</Table.Cell>
							<Table.Cell className="capitalize">{item.quantity}</Table.Cell>
							<Table.Cell className="capitalize">
								<Badge
									intent={getStatusBadgeIntent(item.status)}
									className="capitalize"
								>
									{item.status.toLowerCase()}
								</Badge>
							</Table.Cell>
							<Table.Cell className="capitalize">
								{item.createdAt.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</Table.Cell>
							<Table.Cell className="capitalize">
								<div className="flex justify-end">
									<Menu>
										<Menu.Trigger>
											<IconDotsVertical />
										</Menu.Trigger>
										<Menu.Content
											respectScreen={false}
											aria-label="Actions"
											showArrow
											placement="left"
										>
											<Menu.Item
												className="text-sm"
												href={`/artworks/${item.id}`}
											>
												<Icons.FileView />
												View Details
											</Menu.Item>
											{/* <Menu.Item className="text-sm">
												<Icons.Edit />
												Edit Artwork
											</Menu.Item> */}
											<Menu.Separator />
											<Menu.Item
												className={cn(
													"text-sm",
													item.status === "ARCHIVED" && "hidden",
												)}
												isDanger
												onAction={() =>
													submit(
														{
															intent: "archive",
															artworkId: item.id,
														},
														{ method: "post" },
													)
												}
											>
												<Icons.Archive />
												Archive
											</Menu.Item>
											<Menu.Item
												className={cn(
													"text-sm",
													item.status === "PUBLISHED" && "hidden",
												)}
												onAction={() =>
													submit(
														{
															intent: "unarchive",
															artworkId: item.id,
														},
														{ method: "post" },
													)
												}
											>
												<Icons.Restore />
												Unarchive
											</Menu.Item>
										</Menu.Content>
									</Menu>
								</div>
							</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</Card>
	);
}
