import { auth } from "@/lib/auth";
import type {
	ListBanksResponse,
	SubaccountResponse,
	ValidateBankAndAccountNumberResponse,
} from "@/types/paystack";
import { createId } from "@paralleldrive/cuid2";
import { db } from "./db";

export const getUser = async (headers: Headers) => {
	const user = await auth.api.getSession({
		headers,
	});

	return user;
};

export const cuid = () => createId();

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
		.selectFrom("artist")
		.where("artist.userId", "=", userId)
		.selectAll()
		.executeTakeFirst();

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
		.selectFrom("orderItem")
		.innerJoin("order", "order.id", "orderItem.orderId")
		.innerJoin("artwork", "artwork.id", "orderItem.artworkId")
		.select((eb) => [
			eb.fn
				.sum("orderItem.amount")
				.as("total"), // Total sales including platform fee
			eb.fn
				.sum("orderItem.artistAmount")
				.as("artistTotal"), // Total sales minus platform fee
			eb.fn.count("orderItem.id").as("orderCount"),
		])
		.where("artwork.artistId", "=", artistId)
		.where("order.createdAt", ">=", startOfStartDate)
		.where("order.createdAt", "<=", startOfEndDate)
		.executeTakeFirst();
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
		.selectFrom("orderItem")
		.innerJoin("order", "order.id", "orderItem.orderId")
		.innerJoin("artwork", "artwork.id", "orderItem.artworkId")
		.innerJoin("user", "user.id", "order.buyerId")
		.select([
			"order.id as orderId",
			"order.createdAt",
			"orderItem.amount",
			"orderItem.artistAmount",
			"artwork.title as artworkTitle",
			"artwork.id as artworkId",
			"artwork.imageUrls as artworkImage",
			"user.name as customerName",
			"user.email as customerEmail",
		])
		.where("artwork.artistId", "=", artistId)
		.orderBy("order.createdAt", "desc")
		.limit(10)
		.execute();

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
			.selectFrom("artwork")
			.where("artistId", "=", artistId)
			.selectAll()
			.limit(limit)
			.offset(offset)
			.orderBy("createdAt", "desc")
			.execute(),
		db
			.selectFrom("artwork")
			.where("artistId", "=", artistId)
			.select(({ fn }) => [fn.countAll().as("count")])
			.executeTakeFirst(),
	]);

	const endTime = performance.now();
	console.log(`Artworks query took ${endTime - startTime}ms`);

	return {
		artworks,
		pagination: {
			total: Number(totalCount?.count ?? 0),
			pageCount: Math.ceil(Number(totalCount?.count ?? 0) / limit),
			page, // Ensure page is at least 1
			limit,
		},
	};
};
