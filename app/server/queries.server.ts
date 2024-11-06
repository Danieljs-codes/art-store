import { auth } from "@/lib/auth";
import type {
	ListBanksResponse,
	SubaccountResponse,
	ValidateBankAndAccountNumberResponse,
} from "@/types/paystack";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "./db";
import { type purchaseStatusEnum, default as schema } from "./db/schema";

export const getUser = async (headers: Headers) => {
	const user = await auth.api.getSession({
		headers,
	});

	return user;
};

export const createPaystackSubAccount = async ({
	accountNumber,
	bankCode,
}: {
	accountNumber: string;
	bankCode: string;
}) => {
	const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
	if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is required");

	// First validate the account number
	const validateResponse = await fetch(
		`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
		{
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
				"Content-Type": "application/json",
			},
		},
	);

	const validateData =
		(await validateResponse.json()) as ValidateBankAndAccountNumberResponse;

	if (validateData.status === false) {
		return {
			success: false as const,
			error: validateData.message,
		};
	}

	// Create subaccount
	const response = await fetch("https://api.paystack.co/subaccount", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			business_name: validateData.data.account_name,
			bank_code: bankCode,
			account_number: accountNumber,
			percentage_charge: 5.0,
			settlement_bank: bankCode,
		}),
	});

	const data = (await response.json()) as SubaccountResponse;

	if (data.status === false) {
		return {
			success: false as const,
			error: data.message,
		};
	}

	return {
		success: true as const,
		data: data.data,
	};
};

export const supportedBanks = async () => {
	const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

	if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is required");

	const response = await fetch("https://api.paystack.co/bank", {
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
			"Content-Type": "application/json",
		},
	});

	const data = (await response.json()) as ListBanksResponse;

	if (data.status === false) {
		return {
			success: false as const,
			error: data.message,
		};
	}

	return {
		success: true as const,
		data: data.data,
	};
};

// Add this new function
export async function verifyBankAccount({
	accountNumber,
	bankCode,
}: {
	accountNumber: string;
	bankCode: string;
}) {
	try {
		const response = await fetch(
			`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
				},
			},
		);

		const data =
			(await response.json()) as ValidateBankAndAccountNumberResponse;

		if (!data.status) {
			return {
				success: false as const,
				error: data.message || "Failed to verify bank account",
			};
		}

		return {
			success: true as const,
			data: {
				account_name: data.data.account_name,
				account_number: accountNumber,
				bank_code: bankCode,
			},
		};
	} catch (error) {
		return {
			success: false as const,
			error: "Failed to verify bank account",
		};
	}
}

export const getArtist = async (userId: string) => {
	const artist = await db
		.select()
		.from(schema.artists)
		.where(eq(schema.artists.userId, userId))
		.limit(1)
		.then((res) => res[0]);

	if (!artist) {
		return null;
	}

	return artist;
};

export const getUserAndArtist = async (headers: Headers) => {
	const user = await getUser(headers);

	if (!user) {
		return null;
	}

	const artist = await getArtist(user.user.id);

	if (!artist) {
		return null;
	}

	return { user, artist };
};

export async function getRevenueForDateRange({
	startDate = `${new Date().toISOString().slice(0, 8)}01`, // Start of current month
	endDate = new Date().toISOString().slice(0, 10), // Current day
	artistId,
}: {
	startDate?: string;
	endDate?: string;
	artistId: string;
}) {
	const startOfStartDate = new Date(startDate);
	startOfStartDate.setHours(0, 0, 0, 0);

	const startOfEndDate = new Date(endDate);
	startOfEndDate.setHours(23, 59, 59, 999);

	const startTime = performance.now();
	const result = await db
		.select({
			total: sql<number>`sum(${schema.purchases.amount})`,
			artistTotal: sql<number>`sum(${schema.purchases.artistEarnings})`,
			orderCount: sql<number>`count(${schema.purchases.id})`,
		})
		.from(schema.purchases)
		.innerJoin(schema.orders, eq(schema.orders.id, schema.purchases.orderId))
		.innerJoin(
			schema.artworks,
			eq(schema.artworks.id, schema.purchases.artworkId),
		)
		.where(
			and(
				eq(schema.artworks.artistId, artistId),
				gte(schema.orders.createdAt, startOfStartDate),
				lte(schema.orders.createdAt, startOfEndDate),
			),
		)
		.limit(1)
		.then((res) => res[0]);

	const endTime = performance.now();
	console.log(`Revenue query took ${endTime - startTime}ms`);

	return {
		revenue: Number(result?.total ?? 0), // Total sales including platform fee
		artistRevenue: Number(result?.artistTotal ?? 0), // Total sales minus platform fee (artist's actual earnings)
		orderCount: Number(result?.orderCount ?? 0),
		startDate: startOfStartDate,
		endDate: startOfEndDate,
	};
}

export const getArtistRecentSales = async (artistId: string) => {
	const startTime = performance.now();
	const recentSales = await db
		.select({
			orderId: schema.orders.id,
			createdAt: schema.orders.createdAt,
			amount: schema.purchases.amount,
			artistAmount: schema.purchases.artistEarnings,
			artworkTitle: schema.artworks.title,
			artworkId: schema.artworks.id,
			artworkImage: schema.artworks.images,
			customerName: schema.users.name,
			customerEmail: schema.users.email,
		})
		.from(schema.purchases)
		.innerJoin(schema.orders, eq(schema.orders.id, schema.purchases.orderId))
		.innerJoin(
			schema.artworks,
			eq(schema.artworks.id, schema.purchases.artworkId),
		)
		.innerJoin(schema.users, eq(schema.users.id, schema.orders.buyerId))
		.where(eq(schema.artworks.artistId, artistId))
		.orderBy(desc(schema.orders.createdAt))
		.limit(10);

	const endTime = performance.now();
	console.log(`Recent sales query took ${endTime - startTime}ms`);

	return recentSales.map((sale) => ({
		orderId: sale.orderId,
		date: sale.createdAt,
		amount: Number(sale.amount),
		artistAmount: Number(sale.artistAmount),
		artworkTitle: sale.artworkTitle,
		artworkId: sale.artworkId,
		artworkImage: sale.artworkImage,
		customerName: sale.customerName,
		customerEmail: sale.customerEmail,
	}));
};

export const getArtistArtworks = async ({
	artistId,
	page = 1,
	limit = 10,
}: {
	artistId: string;
	page?: number;
	limit?: number;
}) => {
	const startTime = performance.now();
	const offset = (page - 1) * limit;

	const [artworks, totalCount] = await Promise.all([
		db
			.select()
			.from(schema.artworks)
			.where(eq(schema.artworks.artistId, artistId))
			.limit(limit)
			.offset(offset)
			.orderBy(desc(schema.artworks.createdAt)),
		db
			.select({
				count: sql<number>`count(*)`,
			})
			.from(schema.artworks)
			.where(eq(schema.artworks.artistId, artistId)),
	]);

	const endTime = performance.now();
	console.log(`Artworks query took ${endTime - startTime}ms`);

	return {
		artworks,
		pagination: {
			total: Number(totalCount[0]?.count ?? 0),
			pageCount: Math.ceil(Number(totalCount[0]?.count ?? 0) / limit),
			page,
			limit,
		},
	};
};

interface GetArtworkWithPurchasesParams {
	artworkId: string;
}

export async function getArtworkWithPurchases({
	artworkId,
}: GetArtworkWithPurchasesParams) {
	const result = await db
		.select({
			// Artwork fields
			id: schema.artworks.id,
			title: schema.artworks.title,
			description: schema.artworks.description,
			price: schema.artworks.price,
			views: schema.artworks.views,
			tags: schema.artworks.tags,
			quantity: schema.artworks.quantity,
			category: schema.artworks.category,
			dimensions: schema.artworks.dimensions,
			medium: schema.artworks.medium,
			status: schema.artworks.status,
			weight: schema.artworks.weight,
			frameType: schema.artworks.frameType,
			images: schema.artworks.images,
			artistId: schema.artworks.artistId,
			createdAt: schema.artworks.createdAt,
			// Purchase fields
			purchases: schema.purchases,
		})
		.from(schema.artworks)
		.leftJoin(
			schema.purchases,
			eq(schema.artworks.id, schema.purchases.artworkId),
		)
		.where(eq(schema.artworks.id, artworkId));

	// Transform the result to group purchases
	if (!result.length) return null;

	const artwork = result[0];
	const purchasesList = result
		.filter((row) => row.purchases)
		.map((row) => row.purchases);

	return {
		...artwork,
		purchases: purchasesList,
	};
}

export async function getArtwork({ artworkId }: { artworkId: string }) {
	const artwork = await db
		.select()
		.from(schema.artworks)
		.where(eq(schema.artworks.id, artworkId))
		.limit(1);

	if (!artwork.length) return null;

	return artwork[0];
}

interface GetArtistOrdersParams {
	artistId: string;
	page?: number;
	limit?: number;
	status?: (typeof purchaseStatusEnum.enumValues)[number];
}

export async function getArtistOrders({
	artistId,
	page = 1,
	limit = 10,
	status,
}: GetArtistOrdersParams) {
	const offset = (page - 1) * limit;
	const startTime = performance.now();

	// Build where conditions
	const conditions = [eq(schema.artworks.artistId, artistId)];
	if (status) conditions.push(eq(schema.purchases.status, status));

	const baseQuery = db
		.select({
			purchaseId: schema.purchases.id,
			// Purchase details
			purchaseStatus: schema.purchases.status,
			purchaseAmount: schema.purchases.amount,
			artistEarnings: schema.purchases.artistEarnings,
			platformFee: schema.purchases.platformFee,
			purchasedAt: schema.purchases.createdAt,
			// Artwork details
			artworkId: schema.artworks.id,
			artworkTitle: schema.artworks.title,
			artworkImages: schema.artworks.images,
			// Buyer details
			buyerId: schema.users.id,
			buyerName: schema.users.name,
			buyerEmail: schema.users.email,
		})
		.from(schema.orders)
		.innerJoin(schema.purchases, eq(schema.purchases.orderId, schema.orders.id))
		.innerJoin(
			schema.artworks,
			eq(schema.artworks.id, schema.purchases.artworkId),
		)
		.innerJoin(schema.users, eq(schema.users.id, schema.orders.buyerId))
		.where(and(...conditions));

	const [orders, totalCount] = await Promise.all([
		baseQuery
			.orderBy(desc(schema.orders.createdAt))
			.limit(limit)
			.offset(offset),

		db
			.select({
				count: sql<number>`count(distinct ${schema.orders.id})`,
			})
			.from(schema.orders)
			.innerJoin(
				schema.purchases,
				eq(schema.purchases.orderId, schema.orders.id),
			)
			.innerJoin(
				schema.artworks,
				eq(schema.artworks.id, schema.purchases.artworkId),
			)
			.where(and(...conditions)),
	]);

	const endTime = performance.now();
	console.log(`Artist orders query took ${endTime - startTime}ms`);

	return {
		orders: orders.map((order) => ({
			...order,
			totalAmount: Number(order.purchaseAmount),
			platformFee: Number(order.platformFee),
			artistEarnings: Number(order.artistEarnings),
		})),
		pagination: {
			total: Number(totalCount[0]?.count ?? 0),
			pageCount: Math.ceil(Number(totalCount[0]?.count ?? 0) / limit),
			page,
			limit,
		},
	};
}

export const getRecentlyUploadedArtworks = async () => {
	const artworks = await db
		.select()
		.from(schema.artworks)
		.where(eq(schema.artworks.status, "PUBLISHED"))
		.orderBy(desc(schema.artworks.createdAt))
		.limit(8);

	return artworks;
};

export const getPlatformStats = async () => {
	const [artists, artworks, users] = await Promise.all([
		db.select({ count: count() }).from(schema.artists),
		db.select({ count: count() }).from(schema.artworks),
		db.select({ count: count() }).from(schema.users),
	]);

	return {
		artists: Number(artists[0]?.count ?? 0),
		artworks: Number(artworks[0]?.count ?? 0),
		users: Number(users[0]?.count ?? 0),
	};
};
