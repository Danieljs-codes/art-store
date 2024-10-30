import { currencyFormatter } from "@/lib/misc";
import { Badge, type BadgeIntents } from "@ui/badge";
import { Card } from "@ui/card";
import { Table } from "@ui/table";
import { Icons } from "./icons";

type Artwork = {
	status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
	artistId: string;
	id: string;
	title: string;
	description: string;
	imageUrls: string[];
	price: number;
	quantity: number | null;
	categories: string[];
	tags: string[];
	createdAt: string;
	updatedAt: string;
};

interface ArtworksTableProps {
	artworks: Artwork[];
}

const getStatusBadgeIntent = (
	status: Artwork["status"],
): BadgeIntents["intent"] => {
	if (status === "DRAFT") return "warning";
	if (status === "PUBLISHED") return "success";
	if (status === "ARCHIVED") return "secondary";
	return "primary";
};

export function ArtworksTable({ artworks }: ArtworksTableProps) {
	// const placeholderArtworks: Artwork[] = [
	// 	{
	// 		id: "1",
	// 		title: "Sunset in Lagos",
	// 		description: "A beautiful sunset captured in Lagos",
	// 		imageUrls: ["https://example.com/sunset.jpg"],
	// 		price: 250000,
	// 		quantity: 1,
	// 		status: "PUBLISHED",
	// 		categories: ["Photography", "Nature"],
	// 		tags: ["sunset", "lagos", "nature"],
	// 		artistId: "artist-1",
	// 		createdAt: "2024-01-15T10:00:00Z",
	// 		updatedAt: "2024-01-15T10:00:00Z",
	// 	},
	// 	{
	// 		id: "2",
	// 		title: "Abstract Dreams",
	// 		description: "An abstract painting exploring dreams",
	// 		imageUrls: ["https://example.com/abstract.jpg"],
	// 		price: 500000,
	// 		quantity: 2,
	// 		status: "DRAFT",
	// 		categories: ["Painting", "Abstract"],
	// 		tags: ["abstract", "dreams", "contemporary"],
	// 		artistId: "artist-1",
	// 		createdAt: "2024-01-10T15:30:00Z",
	// 		updatedAt: "2024-01-12T09:20:00Z",
	// 	},
	// 	{
	// 		id: "3",
	// 		title: "Urban Life",
	// 		description: "Street photography capturing city life",
	// 		imageUrls: ["https://example.com/urban.jpg"],
	// 		price: 150000,
	// 		quantity: 5,
	// 		status: "ARCHIVED",
	// 		categories: ["Photography", "Urban"],
	// 		tags: ["street", "city", "people"],
	// 		artistId: "artist-1",
	// 		createdAt: "2024-01-05T12:00:00Z",
	// 		updatedAt: "2024-01-05T12:00:00Z",
	// 	},
	// ];

	// if (!artworks?.length) artworks = placeholderArtworks;

	return (
		<Card>
			<Table>
				<Table.Header>
					<Table.Column>ID</Table.Column>
					<Table.Column isRowHeader>Title</Table.Column>
					<Table.Column>Price</Table.Column>
					<Table.Column>Quantity</Table.Column>
					<Table.Column>Status</Table.Column>
					<Table.Column>Upload Date</Table.Column>
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
							<Table.Cell>{currencyFormatter(item.price)}</Table.Cell>
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
								{new Date(item.createdAt).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</Card>
	);
}
