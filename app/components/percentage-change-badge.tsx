import { Badge } from "@ui/badge";

interface PercentageChangeBadgeProps {
	percentageChange: number;
}

function PercentageChangeBadge({
	percentageChange,
}: PercentageChangeBadgeProps) {
	const intent =
		percentageChange === 0
			? "warning"
			: percentageChange > 0
				? "success"
				: "danger";
	const sign = percentageChange > 0 ? "+" : "";
	const text = percentageChange === 0 ? "0%" : `${sign}${percentageChange}%`;

	return (
		<Badge shape="circle" intent={intent}>
			{text}
		</Badge>
	);
}

export { PercentageChangeBadge };
