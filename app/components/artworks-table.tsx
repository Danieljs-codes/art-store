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
	if (status === "ARCHIVED") return "secondary";
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
					<Table.Column>Price</Table.Column>
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
							<Table.Cell>{item.title}</Table.Cell>
							<Table.Cell>
								{currencyFormatter(convertKoboToNaira(item.price))}
							</Table.Cell>
							<Table.Cell>{item.quantity}</Table.Cell>
							<Table.Cell>
								<Badge
									intent={getStatusBadgeIntent(item.status)}
									className="capitalize"
								>
									{item.status.toLowerCase()}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								{item.createdAt.toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</Table.Cell>
							<Table.Cell>
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
											<Menu.Item className="text-sm">
												<Icons.FileView />
												View
											</Menu.Item>
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
