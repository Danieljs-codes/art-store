import { redirectWithToast } from "@/lib/utils/redirect.server";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { default as schema } from "./db/schema";
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

const ARTWORK_SAMPLES = [
	{
		title: "Urban Rhythm",
		description:
			"A vibrant exploration of city life through abstract forms and bold colors. This piece captures the energy and movement of urban landscapes.",
		price: 599.99,
		tags: ["abstract", "urban", "contemporary"],
		quantity: 1,
		category: "PAINTING",
		dimensions: "24x36 inches",
		medium: "Acrylic on Canvas",
		weight: 2.5,
		frameType: "Floating Frame",
		images: [
			"https://picsum.photos/seed/urban-rhythm/800/600",
			"https://picsum.photos/seed/urban-rhythm-detail/800/600"
		],
	},
	{
		title: "Serenity in Blue",
		description:
			"A calming seascape capturing the essence of ocean waves and coastal tranquility. Perfect for creating a peaceful atmosphere.",
		price: 799.99,
		tags: ["seascape", "blue", "peaceful"],
		quantity: 1,
		category: "PAINTING",
		dimensions: "30x40 inches",
		medium: "Oil on Canvas",
		weight: 3.0,
		frameType: "Classic Wood",
		images: [
			"https://picsum.photos/seed/serenity-blue/800/600",
			"https://picsum.photos/seed/serenity-blue-detail/800/600"
		],
	},
	{
		title: "Abstract Geometry",
		description:
			"A striking composition of geometric shapes and patterns that create a dynamic visual experience.",
		price: 450.0,
		tags: ["geometric", "modern", "minimal"],
		quantity: 2,
		category: "PRINT",
		dimensions: "20x20 inches",
		medium: "Digital Print on Archival Paper",
		weight: 1.0,
		frameType: "Minimalist Black",
		images: [
			"https://picsum.photos/seed/abstract-geo/800/600",
			"https://picsum.photos/seed/abstract-geo-detail/800/600"
		],
	},
	{
		title: "Forest Dreams",
		description:
			"A detailed pencil drawing capturing the mystical atmosphere of an ancient forest.",
		price: 350.0,
		tags: ["nature", "realistic", "pencil"],
		quantity: 1,
		category: "DRAWING",
		dimensions: "16x20 inches",
		medium: "Graphite on Paper",
		weight: 0.5,
		frameType: "Simple White",
		images: [
			"https://picsum.photos/seed/forest-dreams/800/600",
			"https://picsum.photos/seed/forest-dreams-detail/800/600"
		],
	},
	{
		title: "Organic Forms",
		description:
			"A sculptural piece exploring natural forms and textures through ceramic materials.",
		price: 1200.0,
		tags: ["organic", "sculpture", "ceramic"],
		quantity: 1,
		category: "CERAMIC",
		dimensions: "12x12x15 inches",
		medium: "Glazed Stoneware",
		weight: 4.5,
		images: [
			"https://picsum.photos/seed/organic-forms/800/600",
			"https://picsum.photos/seed/organic-forms-detail/800/600"
		],
	},
	{
		title: "Woven Stories",
		description:
			"A contemporary textile piece combining traditional weaving techniques with modern design elements.",
		price: 850.0,
		tags: ["textile", "weaving", "contemporary"],
		quantity: 1,
		category: "TEXTILE",
		dimensions: "36x48 inches",
		medium: "Mixed Fibers",
		weight: 2.0,
		images: [
			"https://picsum.photos/seed/woven-stories/800/600",
			"https://picsum.photos/seed/woven-stories-detail/800/600"
		],
	},
	{
		title: "Metal Symphony",
		description:
			"An abstract sculpture combining different metals to create a harmonious composition.",
		price: 2500.0,
		tags: ["metal", "abstract", "sculpture"],
		quantity: 1,
		category: "SCULPTURE",
		dimensions: "24x24x36 inches",
		medium: "Mixed Metals",
		weight: 15.0,
		images: [
			"https://picsum.photos/seed/metal-symphony/800/600",
			"https://picsum.photos/seed/metal-symphony-detail/800/600"
		],
	},
	{
		title: "Digital Dreams",
		description:
			"A mixed media piece combining traditional painting with digital elements.",
		price: 675.0,
		tags: ["digital", "mixed-media", "contemporary"],
		quantity: 3,
		category: "MIXED MEDIA",
		dimensions: "24x30 inches",
		medium: "Acrylic and Digital Print on Canvas",
		weight: 2.0,
		frameType: "Gallery Wrap",
		images: [
			"https://picsum.photos/seed/digital-dreams/800/600",
			"https://picsum.photos/seed/digital-dreams-detail/800/600"
		],
	},
	{
		title: "Nature's Pattern",
		description:
			"A detailed study of natural patterns found in leaves and flowers.",
		price: 425.0,
		tags: ["nature", "botanical", "watercolor"],
		quantity: 1,
		category: "PAINTING",
		dimensions: "18x24 inches",
		medium: "Watercolor on Paper",
		weight: 0.75,
		frameType: "Natural Wood",
		images: [
			"https://picsum.photos/seed/nature-pattern/800/600",
			"https://picsum.photos/seed/nature-pattern-detail/800/600"
		],
	},
	{
		title: "Urban Fragments",
		description:
			"A collage-style piece incorporating elements of street photography and abstract painting.",
		price: 890.0,
		tags: ["urban", "collage", "photography"],
		quantity: 1,
		category: "MIXED MEDIA",
		dimensions: "30x40 inches",
		medium: "Mixed Media on Canvas",
		weight: 3.5,
		frameType: "Industrial Metal",
		images: [
			"https://picsum.photos/seed/urban-fragments/800/600",
			"https://picsum.photos/seed/urban-fragments-detail/800/600"
		],
	},
];

export async function createSampleArtworks(artistId: string) {
	const artworksToCreate = ARTWORK_SAMPLES.map((artwork) => ({
		id: createId(),
		...artwork,
		artistId,
		createdAt: new Date(),
		updatedAt: new Date(),
		views: 0,
		status: "PUBLISHED",
	})) as Array<typeof schema.artworks.$inferInsert>;

	await db.insert(schema.artworks).values(artworksToCreate);

	return artworksToCreate;
}
