import { convertKoboToNaira, currencyFormatter } from "@/lib/misc";
import { Link } from "@remix-run/react";
import type schema from "@server/db/schema";
import { buttonStyles } from "@ui/button";
import { Card } from "@ui/card";
import { Icons } from "./icons";

type ArtworkCardProps = Pick<
	typeof schema.artworks.$inferSelect,
	"id" | "title" | "price" | "images"
>;

export const ArtworkCard = ({ id, title, price, images }: ArtworkCardProps) => {
	return (
		<Card className="overflow-hidden">
			<img
				className="object-cover h-[14rem] md:h-[18rem] bg-tertiary w-full"
				src={images[0]}
				alt={title}
			/>
			<Card.Content className="px-4 pb-4 pt-3">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold truncate mb-0.5">{title}</h3>
						<p className="text-sm text-muted-fg font-medium">
							{currencyFormatter(convertKoboToNaira(price))}
						</p>
					</div>
					<Link
						className={buttonStyles({
							appearance: "plain",
							size: "square-petite",
						})}
						to={`/artwork/${id}`}
					>
						<Icons.ArrowUpRight />
					</Link>
				</div>
			</Card.Content>
		</Card>
	);
};
