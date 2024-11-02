import { cuid } from "@/lib/misc";
import type { createArtworkSchema } from "@/lib/schema";
import { redirectWithToast } from "@/lib/utils/redirect.server";
import type { z } from "zod";
import { db } from "./db";
import { getArtist } from "./queries.server";

export const createArtwork = async ({
	userId,
	title,
	description,
	price,
	quantity,
	urls,
}: Omit<z.infer<typeof createArtworkSchema>, "files"> & {
	urls: string[];
	userId: string;
}) => {
	// Validate user is authenticated and an artist
	const artist = await getArtist(userId);
	if (!artist) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You must be an artist to create an artwork",
		});
	}

	const startTime = performance.now();

	// Insert new artworks
	const artwork = await db
		.insertInto("artwork")
		.values({
			id: cuid(),
			title,
			description,
			price,
			imageUrls: urls,
			artistId: artist.id,
			createdAt: new Date(),
			updatedAt: new Date(),
			categories: [],
			tags: [],
			status: "PUBLISHED",
			quantity,
		})
		.returning(["id"])
		.executeTakeFirstOrThrow();

	const endTime = performance.now();
	console.log(`Create artwork took ${endTime - startTime}ms`);

	return artwork.id;
};
