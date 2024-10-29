import { Card } from "@ui/card";
import { Table } from "@ui/table";
import { Icons } from "./icons";

interface RecentSalesTableProps {
	orderId: string;
	date: Date;
	amount: number;
	artistAmount: number;
	artworkTitle: string;
	artworkId: string;
	artworkImage: string[];
	customerName: string;
	customerEmail: string;
}

interface RecentSalesTableData {
	data: RecentSalesTableProps[];
}

export const RecentSalesTable = ({ data }: RecentSalesTableData) => {
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
				<Table.Body
					items={data}
					renderEmptyState={() => (
						<div className="text-center py-4">
							<Icons.Empty className="text-muted-fg size-6 mx-auto mb-2" />
							<p className="text-base font-semibold text-fg">
								No recent orders
							</p>
							<p className="text-sm text-muted-fg">
								When you make a sale, it will appear here.
							</p>
						</div>
					)}
				>
					{(item) => (
						<Table.Row id={item.orderId}>
							<Table.Cell>{item.orderId}</Table.Cell>
							<Table.Cell>{item.artworkTitle}</Table.Cell>
							<Table.Cell>{item.customerName}</Table.Cell>
							<Table.Cell>{item.customerEmail}</Table.Cell>
							<Table.Cell>${item.amount}</Table.Cell>
							<Table.Cell>${item.artistAmount}</Table.Cell>
							<Table.Cell>{item.date.toLocaleDateString()}</Table.Cell>
						</Table.Row>
					)}
				</Table.Body>
			</Table>
		</Card>
	);
};
