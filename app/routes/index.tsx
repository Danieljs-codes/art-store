import { Link } from "@ui/link";
import type { MetaFunction } from "@vercel/remix";

export const meta: MetaFunction = () => {
	return [
		{ title: "New Remix App" },
		{ name: "description", content: "Welcome to Remix!" },
	];
};

export default function Index() {
	return (
		<div>
			<h1>Welcome to Remix</h1>
			<Link intent="primary" href="/create-artist">
				Create Artist
			</Link>
		</div>
	);
}
