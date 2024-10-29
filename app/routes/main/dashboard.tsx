import { redirectWithToast } from "@/lib/utils/redirect.server";
import { getRevenueForDateRange, getUserAndArtist } from "@/server/misc.server";
import { MetricCard } from "@components/metric-card";
import {
	type CalendarDate,
	getLocalTimeZone,
	parseDate,
	today,
} from "@internationalized/date";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { DateRangePicker } from "@ui/date-range-picker";
import { Heading } from "@ui/heading";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { useCallback } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const userAndArtist = await getUserAndArtist(request.headers);

	if (!userAndArtist) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You must be logged in and be an artist to view this page",
		});
	}

	const { artist, user } = userAndArtist;
	const url = new URL(request.url);
	const startDate = url.searchParams.get("startDate");
	const endDate = url.searchParams.get("endDate");

	const artistRevenue = await getRevenueForDateRange({
		startDate: startDate ?? undefined,
		endDate: endDate ?? undefined,
		artistId: artist.id,
	});

	return json({ artistRevenue });
};

const Overview = () => {
	const data = useLoaderData<typeof loader>();
	const [searchParams, setSearchParams] = useSearchParams();

	const handleDateChange = useCallback(
		(range: { start: CalendarDate; end: CalendarDate }) => {
			console.log(range);

			const params = new URLSearchParams(searchParams);
			params.set("startDate", range.start.toString());
			params.set("endDate", range.end.toString());
			setSearchParams(params);
		},
		[searchParams, setSearchParams],
	);

	const defaultStart = searchParams.get("startDate")
		? parseDate(searchParams.get("startDate") as string)
		: today(getLocalTimeZone()).subtract({ months: 1 }).set({ day: 1 });

	const defaultEnd = searchParams.get("endDate")
		? parseDate(searchParams.get("endDate") as string)
		: today(getLocalTimeZone());

	return (
		<div>
			<div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
				<Heading level={2} tracking="tight">
					Overview
				</Heading>
				<DateRangePicker
					label="Date Range"
					validate={(range) =>
						range?.end.compare(range.start) < 1
							? "End date must be at least one day after start date"
							: null
					}
					defaultValue={{
						start: defaultStart,
						end: defaultEnd,
					}}
					onChange={handleDateChange}
					shouldForceLeadingZeros
				/>
			</div>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Total Sales"
					value={data.artistRevenue.revenue}
					icon="SalesTag"
					infoText="Total revenue from all artwork sales during this period, before platform fees are deducted"
				/>
				<MetricCard
					title="Artist Revenue"
					value={data.artistRevenue.artistRevenue}
					icon="MoneyReceived"
					infoText="Total revenue from all artwork sales during this period, after platform fees are deducted"
				/>
				<MetricCard
					title="Total Orders"
					value={data.artistRevenue.orderCount}
					icon="ShoppingCart"
					infoText="Total number of orders during this period"
				/>
				<MetricCard
					title="Platform Fees"
					value={data.artistRevenue.revenue - data.artistRevenue.artistRevenue}
					icon="MoneySent"
					infoText="Total platform fees deducted from all artwork sales during this period"
				/>
			</div>
		</div>
	);
};

export default Overview;
