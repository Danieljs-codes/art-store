import { redirectWithToast } from "@/lib/utils/redirect.server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import schema from "./db/schema";
import { getArtist } from "./queries.server";

export const archiveArtwork = async ({
	artworkId,
	userId,
}: {
	artworkId: string;
	userId: string;
}) => {
	// Validate user is authenticated and an artist
	const artist = await getArtist(userId);
	if (!artist) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You must be an artist to archive artworks",
		});
	}

	// Verify artwork belongs to artist
	const artwork = await db
		.select({
			artistId: schema.artworks.artistId,
		})
		.from(schema.artworks)
		.where(eq(schema.artworks.id, artworkId))
		.limit(1)
		.then((res) => res[0]);

	if (!artwork) {
		return redirectWithToast("/artworks", {
			intent: "error",
			message: "Artwork not found",
		});
	}

	if (artwork.artistId !== artist.id) {
		return redirectWithToast("/artworks", {
			intent: "error",
			message: "You can only archive your own artworks",
		});
	}

	await db
		.update(schema.artworks)
		.set({ status: "ARCHIVED" })
		.where(eq(schema.artworks.id, artworkId));
};

export const unarchiveArtwork = async ({
	artworkId,
	userId,
}: {
	artworkId: string;
	userId: string;
}) => {
	// Validate user is authenticated and an artist
	const artist = await getArtist(userId);
	if (!artist) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You must be an artist to unarchive artworks",
		});
	}

	// Verify artwork belongs to artist
	const artwork = await db
		.select({
			artistId: schema.artworks.artistId,
			status: schema.artworks.status,
		})
		.from(schema.artworks)
		.where(eq(schema.artworks.id, artworkId))
		.limit(1)
		.then((res) => res[0]);

	if (!artwork) {
		return redirectWithToast("/artworks", {
			intent: "error",
			message: "Artwork not found",
		});
	}

	if (artwork.artistId !== artist.id) {
		return redirectWithToast("/artworks", {
			intent: "error",
			message: "You can only unarchive your own artworks",
		});
	}

	// If the artwork is already published, do nothing
	if (artwork.status === "PUBLISHED") {
		return;
	}

	await db
		.update(schema.artworks)
		.set({ status: "PUBLISHED" })
		.where(eq(schema.artworks.id, artworkId));
};

type CreateArtworkData = {
	title: string;
	description: string;
	price: number;
	quantity: number;
	category:
		| "PAINTING"
		| "DRAWING"
		| "PRINT"
		| "SCULPTURE"
		| "MIXED MEDIA"
		| "TEXTILE"
		| "CERAMIC"
		| "OTHERS";
	dimensions: string;
	materials: string;
	weight?: number;
	frameType?: string;
	urls: string[];
	userId: string;
};

export const createArtwork = async (data: CreateArtworkData) => {
	const artist = await getArtist(data.userId);
	if (!artist) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "You must be an artist to create artworks",
		});
	}

	const artwork = await db
		.insert(schema.artworks)
		.values({
			title: data.title,
			description: data.description,
			price: data.price,
			quantity: data.quantity,
			category: data.category,
			dimensions: data.dimensions,
			medium: data.materials,
			weight: data.weight,
			frameType: data.frameType,
			images: data.urls,
			artistId: artist.id,
		})
		.returning({ id: schema.artworks.id })
		.then((res) => res[0]);

	return artwork.id;
};
