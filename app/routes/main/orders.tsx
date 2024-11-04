import { orderStatusOptions } from "@/lib/misc";
import { redirectWithToast } from "@/lib/utils/redirect.server";
import { Icons } from "@components/icons";
import { getArtist, getArtistOrders, getUser } from "@server/queries.server";
import { buttonStyles } from "@ui/button";
import { Heading } from "@ui/heading";
import { SearchField } from "@ui/search-field";
import { Select } from "@ui/select";
import { type LoaderFunctionArgs, json } from "@vercel/remix";

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

	return json({ orders, pagination });
};

const Orders = () => {
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
				</div>
			</div>
		</div>
	);
};
export default Orders;
