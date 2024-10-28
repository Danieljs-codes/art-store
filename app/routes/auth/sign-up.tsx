import { auth } from "@/lib/auth";
import { SignUpSchema } from "@/lib/schema";
import { redirectWithToast } from "@/lib/utils/redirect.server";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { Link } from "@ui/link";
import { Loader } from "@ui/loader";
import { Note } from "@ui/note";
import { TextField } from "@ui/text-field";
import type { ActionFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { APIError } from "better-auth/api";

export const action = async ({ request }: ActionFunctionArgs) => {
	const result = SignUpSchema.safeParse(
		Object.fromEntries(await request.formData()),
	);

	if (!result.success) {
		return json({
			formError: null,
			fieldErrors: result.error.flatten().fieldErrors,
			status: "error" as const,
		});
	}

	let res: Response;
	try {
		res = await auth.api.signUpEmail({
			body: {
				...result.data,
			},
			asResponse: true,
		});
	} catch (error) {
		if (error instanceof APIError) {
			return json({
				formError: error.body.message,
				fieldErrors: null,
				status: "error" as const,
			});
		}

		return json({
			formError: "Could not sign in",
			fieldErrors: null,
			status: "error" as const,
		});
	}

	return redirectWithToast(
		"/",
		{
			intent: "success",
			message: "Signed up successfully",
		},
		{
			headers: res.headers,
		},
	);
};

const SignUp = () => {
	const actionData = useActionData<typeof action>();
	const submit = useSubmit();
	const navigation = useNavigation();

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		submit(e.currentTarget);
	};

	const isSubmitting =
		navigation.state === "submitting" && navigation.formAction === "/sign-up";

	return (
		<div>
			<div className="text-center mb-6">
				<h1 className="text-2xl font-bold">Create your account</h1>
				<p className="text-sm text-muted-fg mt-2">
					Create an account to start shopping, track orders, and enjoy
					personalized recommendations
				</p>
			</div>
			<Form
				onSubmit={onSubmit}
				method="post"
				validationErrors={actionData?.fieldErrors ?? undefined}
			>
				{actionData?.formError ? (
					<Note intent="danger">{actionData.formError}</Note>
				) : null}
				<div className="space-y-5">
					<TextField
						label="Name"
						name="name"
						isRequired
						validate={(value) => {
							if (!value) return "Name is required";
							if (value.length < 2) return "Name must be at least 2 characters";
							if (value.length > 50)
								return "Name must be less than 50 characters";
							return null;
						}}
					/>
					<TextField
						label="Email"
						name="email"
						type="email"
						isRequired
						validate={(value) => {
							if (!value) return "Email is required";
							if (!/^\S+@\S+$/.test(value)) return "Invalid email format";
							return null;
						}}
					/>
					<TextField
						label="Password"
						name="password"
						type="password"
						isRequired
						isRevealable
						validate={(value) => {
							if (!value) return "Password is required";
							if (value.length < 6)
								return "Password must be at least 6 characters";
							return null;
						}}
					/>
				</div>
				<Button
					type="submit"
					size="small"
					className="w-full mt-6"
					isPending={isSubmitting}
				>
					{({ isPending }) =>
						isPending ? <Loader variant="spin" /> : "Create account"
					}
				</Button>
			</Form>
			<p className="text-sm text-muted-fg mt-6 te text-center">
				Already have an account?{" "}
				<Link href="/sign-in" intent="primary" className="font-medium">
					Sign in
				</Link>
			</p>
		</div>
	);
};
export default SignUp;
