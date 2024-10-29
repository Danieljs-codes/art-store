import { Icons } from "@components/icons";
import { Card } from "@ui/card";
import { Popover } from "@ui/popover";

interface MetricCardProps {
	title: string;
	value: string | number;
	icon: keyof typeof Icons;
	infoText?: string;
}

export function MetricCard({ title, value, icon, infoText }: MetricCardProps) {
	const Icon = Icons[icon];

	return (
		<Card>
			<Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
				<div className="flex items-center gap-1.5">
					<Card.Title className="text-sm text-muted-fg sm:text-sm">
						{title}
					</Card.Title>
					{infoText && (
						<Popover>
							<Popover.Trigger className="outline-none pressed:ring-1 pressed:ring-muted-fg pressed:ring-offset-2 focus-visible:ring-1 focus-visible:ring-muted-fg focus-visible:ring-offset-2 rounded-full">
								<Icons.InfoCircle className="size-4 text-muted-fg" />
							</Popover.Trigger>
							<Popover.Content respectScreen={false} placement="top">
								<span className="max-w-72 inline-block text-center text-xs sm:text-sm text-muted-fg">
									{infoText}
								</span>
							</Popover.Content>
						</Popover>
					)}
				</div>
				<Icon className="size-4 text-muted-fg" />
			</Card.Header>
			<Card.Content>
				<div className="text-2xl font-bold mb-2">{value}</div>
			</Card.Content>
		</Card>
	);
}
