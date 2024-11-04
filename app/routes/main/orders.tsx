import {
	convertKoboToNaira,
	currencyFormatter,
	orderStatusOptions,
} from "@/lib/misc";
import { redirectWithToast } from "@/lib/utils/redirect.server";
import { Icons } from "@components/icons";
import { useLoaderData } from "@remix-run/react";
import { getArtist, getArtistOrders, getUser } from "@server/queries.server";
import { Badge, type BadgeIntents } from "@ui/badge";
import { buttonStyles } from "@ui/button";
import { Card } from "@ui/card";
import { Heading } from "@ui/heading";
import { Menu } from "@ui/menu";
import { SearchField } from "@ui/search-field";
import { Select } from "@ui/select";
import { Table } from "@ui/table";
import { type LoaderFunctionArgs, json } from "@vercel/remix";
import { IconDotsVertical } from "justd-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getUser(request.headers);

	if (!user) {
		return redirectWithToast("/sign-in", {
			intent: "warning",
			message: "You must be logged in to view this page",
		});
	}

	const artist = await getArtist(user.user.id);

	if (!artist) {
		return redirectWithToast("/sign-in", {
			intent: "warning",
			message: "You must be logged in to view this page",
		});
	}

	const { orders, pagination } = await getArtistOrders({
		artistId: artist.id,
		page: 1,
		limit: 10,
	});

	// For development/testing, let's add a mock order if the orders array is empty
	const mockOrders = [
		{
			totalAmount: 25000,
			platformFee: 5000,
			artistEarnings: 20000,
			purchaseId: "PUR-2024-001",
			purchaseStatus: "PENDING",
			purchaseAmount: 25000,
			artworkId: "ART-2024-001",
			artworkTitle: "Sunset by the Beach",
			artworkImages: ["/images/placeholder-artwork.jpg"],
			buyerId: "USR-2024-001",
			buyerName: "John Doe",
			buyerEmail: "john.doe@example.com",
			purchasedAt: new Date(),
		},
		{
			totalAmount: 45000,
			platformFee: 9000,
			artistEarnings: 36000,
			purchaseId: "PUR-2024-002",
			purchaseStatus: "SHIPPED",
			purchaseAmount: 45000,
			artworkId: "ART-2024-002",
			artworkTitle: "Mountain Landscape",
			artworkImages: ["/images/placeholder-artwork.jpg"],
			buyerId: "USR-2024-002",
			buyerName: "Jane Smith",
			buyerEmail: "jane.smith@example.com",
			purchasedAt: new Date(),
		},
		{
			totalAmount: 15000,
			platformFee: 3000,
			artistEarnings: 12000,
			purchaseId: "PUR-2024-003",
			purchaseStatus: "DELIVERED",
			purchaseAmount: 15000,
			artworkId: "ART-2024-003",
			artworkTitle: "Abstract Dreams",
			artworkImages: ["/images/placeholder-artwork.jpg"],
			buyerId: "USR-2024-003",
			buyerName: "Mike Johnson",
			buyerEmail: "mike.johnson@example.com",
			purchasedAt: new Date(),
		},
		{
			totalAmount: 35000,
			platformFee: 7000,
			artistEarnings: 28000,
			purchaseId: "PUR-2024-004",
			purchaseStatus: "PENDING",
			purchaseAmount: 35000,
			artworkId: "ART-2024-004",
			artworkTitle: "City Lights",
			artworkImages: ["/images/placeholder-artwork.jpg"],
			buyerId: "USR-2024-004",
			buyerName: "Sarah Wilson",
			buyerEmail: "sarah.wilson@example.com",
			purchasedAt: new Date(),
		},
		{
			totalAmount: 55000,
			platformFee: 11000,
			artistEarnings: 44000,
			purchaseId: "PUR-2024-005",
			purchaseStatus: "SHIPPED",
			purchaseAmount: 55000,
			artworkId: "ART-2024-005",
			artworkTitle: "Forest Path",
			artworkImages: ["/images/placeholder-artwork.jpg"],
			buyerId: "USR-2024-005",
			buyerName: "Tom Brown",
			buyerEmail: "tom.brown@example.com",
			purchasedAt: new Date(),
		},
	];

	return json({ orders, pagination });
};

const getBadgeColor = (status: string): BadgeIntents["intent"] => {
	if (status === "PENDING") return "warning";
	if (status === "SHIPPED") return "info";
	if (status === "DELIVERED") return "success";
	return "primary";
};

const Orders = () => {
	const data = useLoaderData<typeof loader>();
	return (
		<div>
			<div>
				<Heading level={1} tracking="tight">
					Artworks
				</Heading>
				<p className="text-xs md:text-sm text-muted-fg leading-normal mt-1 max-w-prose">
					Track and manage your artwork orders, monitor payments, and handle
					shipping details.
				</p>
			</div>
			<div className="mt-6">
				<div>
					<div className="flex items-center gap-2">
						<div
							className={buttonStyles({
								appearance: "outline",
								size: "square-petite",
							})}
						>
							<Icons.Order />
						</div>
						<p className="text-sm text-muted-fg font-medium">Orders</p>
					</div>
					<div className="mt-3 flex flex-col md:flex-row md:items-center gap-x-10 gap-y-4">
						<SearchField className={"flex-1"} />
						<Select
							defaultSelectedKey="all"
							aria-label="Filter by status"
							className="md:w-fit md:min-w-40"
						>
							<Select.Trigger />
							<Select.List items={orderStatusOptions}>
								{(item) => (
									<Select.Option
										className={"text-sm"}
										id={item.value}
										textValue={item.label}
										key={item.value}
									>
										{item.label}
									</Select.Option>
								)}
							</Select.List>
						</Select>
					</div>
					<div className="mt-4">
						<Card>
							<Table aria-label="Orders">
								<Table.Header>
									<Table.Column>Order ID</Table.Column>
									<Table.Column isRowHeader>Artwork</Table.Column>
									<Table.Column>Customer</Table.Column>
									<Table.Column>Date</Table.Column>
									<Table.Column>Status</Table.Column>
									<Table.Column>Earnings</Table.Column>
									<Table.Column>Platform fee</Table.Column>
									<Table.Column>Total</Table.Column>
									<Table.Column>Actions</Table.Column>
								</Table.Header>
								<Table.Body
									items={data.orders}
									renderEmptyState={() => (
										<div className="text-center py-4">
											<Icons.Empty className="text-muted-fg size-6 mx-auto mb-2" />
											<p className="text-base font-semibold text-fg">
												No orders found
											</p>
											<p className="text-sm text-muted-fg text-pretty">
												Orders will appear here once customers make purchases.
											</p>
										</div>
									)}
								>
									{(order) => (
										<Table.Row id={order.purchaseId}>
											<Table.Cell>{order.purchaseId}</Table.Cell>
											<Table.Cell>{order.artworkTitle}</Table.Cell>
											<Table.Cell className="capitalize">
												{order.buyerName.toLowerCase()}
											</Table.Cell>
											<Table.Cell>
												{new Date(order.purchasedAt).toLocaleDateString()}
											</Table.Cell>
											<Table.Cell>
												<Badge
													className="capitalize"
													intent={getBadgeColor(order.purchaseStatus)}
												>
													{order.purchaseStatus.toLowerCase()}
												</Badge>
											</Table.Cell>
											<Table.Cell>
												{/* TODO: It would be stored in Kobo convert to naira */}
												{currencyFormatter(
													convertKoboToNaira(order.artistEarnings),
												)}
											</Table.Cell>
											<Table.Cell>
												{/* TODO: It would be stored in Kobo convert to naira */}
												{currencyFormatter(
													convertKoboToNaira(order.platformFee),
												)}
											</Table.Cell>
											<Table.Cell>
												{/* TODO: It would be stored in Kobo convert to naira */}
												{currencyFormatter(
													convertKoboToNaira(order.totalAmount),
												)}
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
															<Menu.Item className={"text-sm"}>
																<Icons.Shipped />
																Mark as Shipped
															</Menu.Item>
															<Menu.Item className={"text-sm"}>
																<Icons.Delivered />
																Mark as Delivered
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
					</div>
				</div>
			</div>
		</div>
	);
};
export default Orders;
