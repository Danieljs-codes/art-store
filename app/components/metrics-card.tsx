import { Badge } from "@ui/badge";
import { Card } from "@ui/card";
import { PercentageChangeBadge } from "./percentage-change-badge";

function MetricsCard() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"></div>
	);
}

interface MetricCardProps {
	title: string;
	icon: React.ReactNode;
	value: string | number;
	change: number;
	isPercentage?: boolean;
	formatChange?: (value: number) => string;
}

function MetricCard({
	title,
	icon,
	value,
	change,
	isPercentage = false,
	formatChange,
}: MetricCardProps) {
	const formattedChange = formatChange ? formatChange(change) : change;

	return (
		<Card>
			<Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title className="text-sm text-muted-fg sm:text-sm">
					{title}
				</Card.Title>
				{icon}
			</Card.Header>
			<Card.Content>
				<div className="text-2xl font-bold mb-2">{value}</div>
				<p className="text-xs text-muted-fg">
					{isPercentage ? (
						<PercentageChangeBadge percentageChange={change} />
					) : (
						<Badge
							shape="circle"
							intent={
								change > 0 ? "success" : change === 0 ? "warning" : "secondary"
							}
						>
							{change > 0 ? "+" : change === 0 ? "" : "-"}
							{formattedChange}
						</Badge>
					)}{" "}
					from last month
				</p>
			</Card.Content>
		</Card>
	);
}

export { MetricsCard };
