export interface Bank {
	id: number;
	name: string;
	slug: string;
	code: string;
	longcode: string;
	gateway: string;
	pay_with_bank: boolean;
	supports_transfer: boolean;
	active: boolean;
	country: string;
	currency: string;
	type: string;
	is_deleted: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface ListBanksResponse {
	status: boolean;
	message: string;
	data: Bank[];
}

export interface ErrorResponse {
	status: false;
	message: string;
	meta: {
		nextStep: string;
	};
	type: string;
	code: string;
}

export interface SuccessResponse {
	status: true;
	message: string;
	data: {
		account_number: string;
		account_name: string;
		bank_id: number;
	};
}

export type ValidateBankAndAccountNumberResponse =
	| SuccessResponse
	| ErrorResponse;

export interface SubaccountSuccessResponse {
	status: true;
	message: string;
	data: Data;
}
export interface Data {
	business_name: string;
	primary_contact_name: string;
	primary_contact_email: string;
	primary_contact_phone: string;
	account_number: string;
	percentage_charge: number;
	settlement_bank: string;
	currency: string;
	bank: number;
	integration: number;
	domain: string;
	account_name: string;
	product: string;
	managed_by_integration: number;
	subaccount_code: string;
	is_verified: boolean;
	settlement_schedule: string;
	active: boolean;
	migrate: boolean;
	id: number;
	createdAt: string;
	updatedAt: string;
}

export type SubaccountResponse = SubaccountSuccessResponse | ErrorResponse;
