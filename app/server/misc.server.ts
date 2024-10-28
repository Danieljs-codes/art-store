import { auth } from "@/lib/auth";
import type {
	ListBanksResponse,
	SubaccountResponse,
	ValidateBankAndAccountNumberResponse,
} from "@/types/paystack";
import { createId } from "@paralleldrive/cuid2";

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
