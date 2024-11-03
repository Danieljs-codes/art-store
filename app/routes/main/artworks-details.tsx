import { useLoaderData } from "@remix-run/react";
import { type LoaderFunctionArgs, json, redirect } from "@vercel/remix";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const id = params.id;
	if (!id) {
		return redirect("/artworks");
	}
	return json({
		id,
	});
};

const ArtworkDetails = () => {
	const data = useLoaderData<typeof loader>();
	return (
		<div>
			<h1>Artwork Details</h1>
			<p>{data.id}</p>
		</div>
	);
};
export default ArtworkDetails;
