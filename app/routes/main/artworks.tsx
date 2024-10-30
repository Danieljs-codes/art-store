import { statusOptions } from "@/lib/misc";
import { artistArtworksSchema } from "@/lib/schema";
import { redirectWithToast } from "@/lib/utils/redirect.server";
import { getArtistArtworks, getUserAndArtist } from "@/server/queries.server";
import { ArtworksTable } from "@components/artworks-table";
import { Icons } from "@components/icons";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Button, buttonStyles } from "@ui/button";
import { Heading } from "@ui/heading";
import { SearchField } from "@ui/search-field";
import { Select } from "@ui/select";
import { type LoaderFunctionArgs, json, redirect } from "@vercel/remix";
import { IconChevronLeft, IconChevronRight, IconPlus } from "justd-icons";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userAndArtist = await getUserAndArtist(request.headers);

	if (!userAndArtist) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You must be logged in and be an artist to view this page",
		});
	}

	const searchParams = new URL(request.url).searchParams;
	const result = artistArtworksSchema.safeParse(
		Object.fromEntries(searchParams),
	);

	if (!result.success) {
		throw redirect("/artworks");
	}

	const { page, limit } = result.data;

	const { artist } = userAndArtist;

	const { artworks, pagination } = await getArtistArtworks({
		artistId: artist.id,
		page,
		limit,
	});

	return json({ artworks, pagination });
};
// TODO: Add status to search param and DB Query to filter by status
const Artworks = () => {
	const [_, setSearchParams] = useSearchParams();
	const data = useLoaderData<typeof loader>();

	return (
		<div>
			<div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
				<div>
					<Heading level={1} tracking="tight">
						Artworks
					</Heading>
					<p className="text-xs md:text-sm text-muted-fg leading-normal mt-1 max-w-prose">
						Manage your artwork collection, update details, and track sales
						performance. Add new artworks, edit existing ones, or remove
						artworks that are no longer available.
					</p>
				</div>
				<Button size="small">
					<IconPlus />
					Add Artwork
				</Button>
			</div>
			<div>
				<div className="flex items-center gap-2">
					<div
						className={buttonStyles({
							appearance: "outline",
							size: "square-petite",
						})}
					>
						<Icons.Artwork />
					</div>
					<p className="text-sm text-muted-fg font-medium">Artworks</p>
				</div>
				<div className="mt-3 flex flex-col md:flex-row md:items-center gap-x-10 gap-y-4">
					<SearchField className={"flex-1"} />
					<Select
						defaultSelectedKey="all"
						aria-label="Filter by status"
						className="md:w-fit md:min-w-40"
					>
						<Select.Trigger />
						<Select.List items={statusOptions}>
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
					<ArtworksTable artworks={data.artworks} />
					{data.pagination.pageCount > 0 && (
						<div className="mt-2 flex items-center gap-2 justify-between">
							<Button
								size="small"
								appearance="outline"
								isDisabled={data.pagination.page <= 1}
								onPress={() =>
									setSearchParams((prev) => {
										prev.set(
											"page",
											Math.max(1, data.pagination.page - 1).toString(),
										);
										return prev;
									})
								}
							>
								<IconChevronLeft />
								Previous
							</Button>
							<p className="text-sm text-muted-fg font-medium">
								{data.pagination.page} of {data.pagination.pageCount}{" "}
								{data.pagination.pageCount === 1 ? "page" : "pages"}
							</p>
							<Button
								size="small"
								appearance="outline"
								isDisabled={data.pagination.page >= data.pagination.pageCount}
								onPress={() =>
									setSearchParams((prev) => {
										prev.set(
											"page",
											Math.min(
												data.pagination.pageCount,
												data.pagination.page + 1,
											).toString(),
										);
										return prev;
									})
								}
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
};
export default Artworks;
