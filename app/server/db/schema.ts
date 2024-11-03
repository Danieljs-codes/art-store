import { ARTWORK_CATEGORIES } from "@/lib/misc";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	real,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", ARTWORK_CATEGORIES);
export const purchaseStatusEnum = pgEnum("purchase_status", [
	"PENDING",
	"PAID",
	"DELIVERED",
	"CANCELLED",
]);
export const artworkStatusEnum = pgEnum("artwork_status", [
	"ARCHIVED",
	"PUBLISHED",
]);

export const users = pgTable(
	"user",
	{
		id: text().primaryKey(),
		name: text().notNull(),
		email: text().notNull().unique(),
		emailVerified: boolean().notNull(),
		image: text(),
		createdAt: timestamp().notNull(),
		updatedAt: timestamp().notNull(),
	},
	(table) => ({
		emailIdx: index("email_idx").on(table.email),
	}),
);

export const sessions = pgTable(
	"session",
	{
		id: text().primaryKey(),
		expiresAt: timestamp().notNull(),
		ipAddress: text(),
		userAgent: text(),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => ({
		userIdIdx: index("user_id_idx").on(table.userId),
	}),
);

export const accounts = pgTable(
	"account",
	{
		id: text().primaryKey(),
		accountId: text().notNull(),
		providerId: text().notNull(),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		accessToken: text(),
		refreshToken: text(),
		idToken: text(),
		expiresAt: timestamp(),
		password: text(),
	},
	(table) => ({
		userIdIdx: index("account_user_id_idx").on(table.userId),
		providerIdx: index("provider_idx").on(table.providerId),
	}),
);

export const verifications = pgTable("verification", {
	id: text().primaryKey(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp().notNull(),
});

export const artists = pgTable(
	"artist",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => createId()),
		name: text().notNull(),
		bio: text().notNull(),
		portfolioUrl: text(),
		paystackSubAccountId: text().notNull(),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdateFn(() => new Date()),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => ({
		userIdIdx: index("artist_user_id_idx").on(table.userId),
		nameIdx: index("artist_name_idx").on(table.name),
	}),
);

export const artworks = pgTable(
	"artwork",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => createId()),
		title: text().notNull(),
		description: text().notNull(),
		price: real().notNull(),
		quantity: integer().notNull(),
		category: categoryEnum(),
		dimensions: text().notNull(),
		medium: text().notNull(),
		yearCreated: timestamp(),
		location: text().notNull(),
		status: artworkStatusEnum().notNull().default("PUBLISHED"),
		weight: real(),
		frameType: text(),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdateFn(() => new Date()),
		images: jsonb().$type<string[]>().notNull(),
		artistId: text()
			.notNull()
			.references(() => artists.id, { onDelete: "cascade" }),
	},
	(table) => ({
		priceCheck: check("price_positive", sql`${table.price} > 0`),
		weightCheck: check("weight_positive", sql`${table.weight} > 0`),
		yearCheck: check("year_not_future", sql`${table.yearCreated} <= NOW()`),
		artistIdIdx: index("artwork_artist_id_idx").on(table.artistId),
		categoryIdx: index("artwork_category_idx").on(table.category),
		priceIdx: index("artwork_price_idx").on(table.price),
	}),
);

export const orders = pgTable(
	"order",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => createId()),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdateFn(() => new Date()),
		buyerId: text()
			.notNull()
			.references(() => users.id, { onDelete: "restrict" }),
		totalAmount: real().notNull(),
		paymentReference: text().notNull(),
	},
	(table) => ({
		amountCheck: check("total_amount_positive", sql`${table.totalAmount} > 0`),
		buyerIdIdx: index("order_buyer_id_idx").on(table.buyerId),
		paymentRefIdx: index("order_payment_ref_idx").on(table.paymentReference),
	}),
);

export const purchases = pgTable(
	"purchase",
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => createId()),
		createdAt: timestamp().notNull().defaultNow(),
		updatedAt: timestamp()
			.notNull()
			.defaultNow()
			.$onUpdateFn(() => new Date()),
		artworkId: text()
			.notNull()
			.references(() => artworks.id, { onDelete: "restrict" }),
		orderId: text()
			.notNull()
			.references(() => orders.id, { onDelete: "restrict" }),
		amount: real().notNull(),
		platformFee: real().notNull(),
		artistEarnings: real().notNull(),
		status: purchaseStatusEnum().notNull().default("PENDING"),
	},
	(table) => ({
		amountCheck: check("amount_positive", sql`${table.amount} > 0`),
		feeCheck: check("platform_fee_positive", sql`${table.platformFee} > 0`),
		earningsCheck: check(
			"artist_earnings_positive",
			sql`${table.artistEarnings} > 0`,
		),
		artworkIdIdx: index("purchase_artwork_id_idx").on(table.artworkId),
		orderIdIdx: index("purchase_order_id_idx").on(table.orderId),
		statusIdx: index("purchase_status_idx").on(table.status),
	}),
);

export default {
	users,
	sessions,
	accounts,
	verifications,
	artists,
	artworks,
	orders,
	purchases,
};
