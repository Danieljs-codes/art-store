import { Form } from "@/components/ui/form";
import { auth } from "@/lib/auth";
import { SignInSchema } from "@/lib/schema";
import { redirectWithToast } from "@/lib/utils/redirect.server";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import { Button } from "@ui/button";
import { Checkbox } from "@ui/checkbox";
import { Link } from "@ui/link";
import { Loader } from "@ui/loader";
import { Note } from "@ui/note";
import { TextField } from "@ui/text-field";
import { type ActionFunctionArgs, json } from "@vercel/remix";
import { APIError } from "better-auth/api";

export const action = async ({ request }: ActionFunctionArgs) => {
	const result = SignInSchema.safeParse(
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
		res = await auth.api.signInEmail({
			body: {
				email: result.data.email,
				password: result.data.password,
				dontRemember: !result.data.rememberMe,
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
			message: "Signed in successfully",
		},
		{
			headers: res.headers,
		},
	);
};

const SignIn = () => {
	const submit = useSubmit();
	const navigation = useNavigation();
	const isSubmitting =
		navigation.state === "submitting" && navigation.formAction === "/sign-in";

	const actionData = useActionData<typeof action>();

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		submit(e.currentTarget);
	};

	return (
		<div>
			<div className="text-center mb-6">
				<h1 className="text-2xl font-bold">Sign in to your account</h1>
				<p className="text-sm text-muted-fg mt-2">
					Sign in to start shopping, track your orders, and enjoy personalized
					recommendations.
				</p>
			</div>
			<Form
				method="post"
				onSubmit={onSubmit}
				validationErrors={actionData?.fieldErrors ?? undefined}
			>
				{actionData?.formError ? (
					<Note intent="danger">{actionData.formError}</Note>
				) : null}
				<div className="space-y-5">
					<TextField
						name="email"
						label="Email"
						placeholder="Enter your email"
						type="email"
						isRequired
						validate={(value) =>
							/^\S+@\S+$/.test(value) ? null : "Invalid email"
						}
					/>
					<TextField
						name="password"
						label="Password"
						placeholder="Enter your password"
						isRevealable
						type="password"
						isRequired
						validate={(value) =>
							value.length >= 6
								? null
								: "Password must be at least 6 characters long"
						}
					/>
					<Checkbox name="rememberMe">Remember me</Checkbox>
				</div>
				<Button
					type="submit"
					size="small"
					className="w-full mt-6"
					isPending={isSubmitting}
				>
					{({ isPending }) =>
						isPending ? <Loader variant="spin" /> : "Sign in"
					}
				</Button>
			</Form>
			<p className="text-sm text-muted-fg mt-6 te text-center">
				Don't have an account?{" "}
				<Link href="/sign-up" intent="primary" className="font-medium">
					Sign up
				</Link>
			</p>
		</div>
	);
};
export default SignIn;
