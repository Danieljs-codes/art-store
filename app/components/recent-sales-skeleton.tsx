import { Card } from "@ui/card";
import { Skeleton } from "@ui/skeleton";
import { Table } from "@ui/table";

const RecentSalesSkeleton = () => {
	const data = Array(3)
		.fill(null)
		.map((_, index) => ({
			orderId: `${1234567890 + index}`,
			date: new Date(),
			amount: 100,
			artistAmount: 80,
			artworkTitle: "Sample Artwork",
			artworkId: `artwork-${index}`,
			artworkImage: ["https://placeholder.com/300x300"],
			customerName: "John Doe",
			customerEmail: "john.doe@example.com",
		}));

	return (
		<Card>
			<Table>
				<Table.Header>
					<Table.Column>Order ID</Table.Column>
					<Table.Column isRowHeader>Artwork Name</Table.Column>
					<Table.Column>Customer Name</Table.Column>
					<Table.Column>Customer Email</Table.Column>
					<Table.Column>Amount</Table.Column>
					<Table.Column>Artist Amount</Table.Column>
					<Table.Column>Order Date</Table.Column>
				</Table.Header>
				<Table.Body items={data}>
					{(item) => (
						<Table.Row id={item.orderId}>
							<Table.Cell>
								<Skeleton className="w-20 h-4" />
							</Table.Cell>
							<Table.Cell>
								<Skeleton className="w-32 h-4" />
							</Table.Cell>
							<Table.Cell>
								<Skeleton className="w-24 h-4" />
							</Table.Cell>
							<Table.Cell>
								<Skeleton className="w-16 h-4" />
							</Table.Cell>
							<Table.Cell>
								<Skeleton className="w-28 h-4" />
							</Table.Cell>
							<Table.Cell>
								<Skeleton className="w-20 h-4" />
							</Table.Cell>
							<Table.Cell>
								<Skeleton className="w-24 h-6 rounded-full" />
							</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</Card>
	);
};
export { RecentSalesSkeleton };
