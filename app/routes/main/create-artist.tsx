import { createArtistSchema } from "@/lib/schema";
import { redirectWithToast } from "@/lib/utils/redirect.server";
import { db } from "@/server/db";
import {
	createPaystackSubAccount,
	cuid,
	getUser,
	supportedBanks,
	verifyBankAccount,
} from "@/server/queries.server";
import {
	useActionData,
	useLoaderData,
	useNavigation,
	useSubmit,
} from "@remix-run/react";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { Loader } from "@ui/loader";
import { Note } from "@ui/note";
import { Select } from "@ui/select";
import { TextField } from "@ui/text-field";
import { Textarea } from "@ui/textarea";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	json,
} from "@vercel/remix";
import { useEffect, useState } from "react";

interface BankVerificationResponse {
	account_name: string;
	account_number: string;
	bank_code: string;
}

type ActionData =
	| {
			status: "error";
			formError: string | null;
			fieldErrors: Record<string, string[]> | null;
	  }
	| {
			status: "success";
			bankDetails: BankVerificationResponse;
			formData: {
				artistName: string;
				portfolioUrl?: string;
				artistBio: string;
				accountNumber: string;
				bankCode: string;
			};
			formError: null;
			fieldErrors: null;
	  };

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await getUser(request.headers);

	if (!user) {
		return redirectWithToast("/sign-in", {
			intent: "warning",
			message: "You must be signed in to create an artist profile",
		});
	}

	// Check if existing user has no artist profile
	const existingUser = await db
		.selectFrom("artist")
		.where("artist.userId", "=", user.user.id)
		.selectAll()
		.executeTakeFirst();

	if (existingUser) {
		return redirectWithToast("/dashboard", {
			intent: "error",
			message: "You already have an artist profile",
		});
	}

	const banks = await supportedBanks();

	if (!banks.success) {
		return redirectWithToast("/create-artist", {
			intent: "error",
			message: "Failed to fetch supported banks",
		});
	}

	return json({ user, banks: banks.data });
};

export const action = async ({
	request,
}: ActionFunctionArgs): Promise<Response | ActionData> => {
	const formData = await request.formData();
	const intent = formData.get("intent");

	// Authenticate user
	const user = await getUser(request.headers);
	if (!user) {
		return redirectWithToast("/sign-in", {
			intent: "warning",
			message: "You must be signed in to create an artist profile",
		});
	}

	// Check for existing artist profile
	const existingUser = await db
		.selectFrom("artist")
		.where("artist.userId", "=", user.user.id)
		.selectAll()
		.executeTakeFirst();

	if (existingUser) {
		return redirectWithToast("/dashboard", {
			intent: "error",
			message: "You already have an artist profile",
		});
	}

	const result = createArtistSchema.safeParse(Object.fromEntries(formData));
	if (!result.success) {
		return json({
			status: "error" as const,
			formError: null,
			fieldErrors: result.error.flatten().fieldErrors,
		});
	}

	// If intent is verify, only verify the bank details
	if (intent === "verify") {
		const { accountNumber, bankCode } = result.data;
		const verificationRes = await verifyBankAccount({
			accountNumber,
			bankCode,
		});

		if (!verificationRes.success) {
			return json({
				status: "error" as const,
				formError: verificationRes.error,
				fieldErrors: null,
			});
		}

		return json({
			status: "success" as const,
			bankDetails: verificationRes.data,
			formData: result.data,
			formError: null,
			fieldErrors: null,
		});
	}

	// Create Paystack subaccount
	const { accountNumber, bankCode } = result.data;
	const payStackRes = await createPaystackSubAccount({
		accountNumber,
		bankCode,
	});
	if (!payStackRes.success) {
		return json({
			status: "error" as const,
			formError: payStackRes.error,
			fieldErrors: null,
		});
	}

	// Create artist record
	await db
		.insertInto("artist")
		.values({
			id: cuid(),
			name: result.data.artistName,
			portfolioUrl: result.data.portfolioUrl,
			bio: result.data.artistBio,
			createdAt: new Date(),
			updatedAt: new Date(),
			userId: user.user.id,
			paystackSubAccountId: payStackRes.data.subaccount_code,
		})
		.executeTakeFirstOrThrow();

	return redirectWithToast("/dashboard", {
		intent: "success",
		message: "Artist profile created successfully",
	});
};

function CreateArtist() {
	const navigation = useNavigation();
	const isSubmitting =
		navigation.state === "submitting" &&
		navigation.formAction === "/create-artist";
	const { banks } = useLoaderData<typeof loader>();
	const actionData = useActionData<ActionData>();
	const [isVerified, setIsVerified] = useState(false);
	const submit = useSubmit();

	// Handle successful verification
	useEffect(() => {
		if (actionData?.status === "success" && actionData.bankDetails) {
			setIsVerified(true);
		}
	}, [actionData]);

	// Some banks have same bankCode so we wanna get the first one
	const uniqueBanks = banks.filter(
		(bank, index, self) =>
			index === self.findIndex((t) => t.code === bank.code),
	);

	// Show verification success note
	if (isVerified && actionData?.status === "success") {
		return (
			<div className="flex items-center justify-center min-h-svh px-4 flex-col">
				<div className="w-full max-w-[24rem]">
					<div className="mb-6">
						<h2 className="text-fg font-semibold text-xl mb-1">
							Verify Bank Details
						</h2>
						<p className="text-muted-fg text-sm leading-snug">
							Please confirm your bank details before creating your artist
							profile.
						</p>
					</div>

					<Note intent="info" className="mb-6">
						<div className="space-y-2">
							<p>
								<strong>Account Name:</strong>{" "}
								{actionData.bankDetails.account_name}
							</p>
							<p>
								<strong>Account Number:</strong>{" "}
								{actionData.bankDetails.account_number}
							</p>
						</div>
					</Note>

					<div className="flex gap-3">
						<Button
							appearance="outline"
							className="flex-1"
							onPress={() => setIsVerified(false)}
							size="small"
						>
							Change Details
						</Button>
						<Button
							className="flex-1"
							size="small"
							onPress={() => {
								const formData = new FormData();
								for (const [key, value] of Object.entries(
									actionData.formData,
								)) {
									if (value) formData.append(key, value);
								}
								submit(formData, { method: "post" });
							}}
							isPending={isSubmitting}
						>
							{({ isPending }) =>
								isPending ? <Loader variant="spin" /> : "Create Profile"
							}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Show the form
	return (
		<div className="flex items-center justify-center min-h-svh px-4 flex-col">
			<div className="w-full max-w-[24rem]">
				<div className={"mb-6"}>
					<h2 className={"text-fg font-semibold text-xl mb-1"}>
						Create Artist Profile
					</h2>
					<p className={"text-muted-fg text-sm leading-snug"}>
						Turn your passion into profit. Set up your artist profile to start
						selling your artwork.
					</p>
				</div>
				<div>
					<Form
						method="post"
						validationErrors={actionData?.fieldErrors ?? undefined}
						onSubmit={(event) => {
							// If we already have verified bank details, let the form submit
							if (isVerified) {
								submit(event.currentTarget);
								return;
							}

							// Otherwise, prevent default and show verification dialog
							event.preventDefault();
							const form = event.currentTarget;
							const formData = new FormData(form);
							formData.append("intent", "verify");

							// Submit the form programmatically
							submit(formData, {
								method: "post",
							});
						}}
					>
						{actionData?.formError && (
							<Note intent="danger">{actionData.formError}</Note>
						)}
						<div className="space-y-5">
							<TextField
								isRequired
								label="Artist Name"
								name="artistName"
								placeholder="Enter your artist name"
								validate={(value) => {
									if (!value) return "Artist Name is required";
									return null;
								}}
							/>
							<TextField
								label="Portfolio URL (Optional)"
								name="portfolioUrl"
								placeholder="Enter your portfolio URL"
								validate={(value) => {
									if (!value) return null;
									if (!value.startsWith("https://"))
										return "Portfolio URL must start with https://";
									return null;
								}}
							/>
							<Textarea
								label="Artist Bio"
								name="artistBio"
								className="min-h-[6.25rem]"
								placeholder="Enter your artist bio"
								validate={(value) => {
									if (!value) return "Artist Bio is required";
									if (value.length < 10)
										return "Artist Bio must be at least 10 characters long";
									return null;
								}}
							/>
							<TextField
								isRequired
								label="Account Number"
								name="accountNumber"
								placeholder="Enter your bank account number"
								validate={(value) => {
									if (!value) return "Account Number is required";
									if (!/^\d{10}$/.test(value))
										return "Account Number must be 10 digits";
									return null;
								}}
								inputMode="numeric"
							/>
							<Select
								label="Bank"
								placeholder="Select your bank"
								name="bankCode"
								isRequired
								validate={(value) => {
									if (!value) return "Bank is required";
									return null;
								}}
							>
								<Select.Trigger />
								<Select.List items={uniqueBanks}>
									{(bank) => (
										<Select.Option
											className={"text-sm"}
											id={bank.code}
											textValue={bank.name}
										>
											<span className="text-sm truncate capitalize">
												{bank.name.toLowerCase()}
											</span>
										</Select.Option>
									)}
								</Select.List>
							</Select>
						</div>
						<Button
							type="submit"
							className="w-full mt-6"
							size="small"
							isPending={isSubmitting}
						>
							{({ isPending }) =>
								isPending ? <Loader variant="spin" /> : "Verify Details"
							}
						</Button>
					</Form>
				</div>
			</div>
		</div>
	);
}

export default CreateArtist;
