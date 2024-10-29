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
