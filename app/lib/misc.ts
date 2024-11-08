import { createId } from "@paralleldrive/cuid2";
export const toastKey = "en_toast";

export const convertToObject = <T extends object>(data: string | object): T => {
	if (typeof data === "object") {
		return data as T;
	}

	return JSON.parse(data) as T;
};

export function convertKoboToNaira(koboAmount: number) {
	return koboAmount / 100;
}

export function defaultFormatter(value: string | number): string {
	if (typeof value === "string") return value;

	return new Intl.NumberFormat("en-US").format(value);
}

export function currencyFormatter(value: string | number): string {
	const numericValue =
		typeof value === "string" ? Number.parseFloat(value) : value;

	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(numericValue);
}

export const statusOptions = [
	{ label: "All Statuses", value: "all" },
	{ label: "Active", value: "active" },
	{ label: "Sold Out", value: "sold-out" },
	{ label: "Archived", value: "archived" },
];

export const orderStatusOptions = [
	{ label: "All Statuses", value: "all" },
	{ label: "Pending", value: "pending" },
	{ label: "Shipped", value: "shipped" },
	{ label: "Delivered", value: "delivered" },
];

export const cuid = () => createId();

export const convertNairaToKobo = (nairaAmount: number) => nairaAmount * 100;

export const ARTWORK_CATEGORIES = [
	"PAINTING",
	"DRAWING",
	"PRINT",
	"SCULPTURE",
	"MIXED MEDIA",
	"TEXTILE",
	"CERAMIC",
	"OTHERS",
] as const;

export const toSentenceCase = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const sleep = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));
