import { redirect } from "@vercel/remix";
import { toastKey } from "../misc";
import { toastSessionStorage } from "../toast.server";
import { combineHeaders } from "./misc.server";

type ToastInput = {
	intent: "success" | "error" | "warning" | "info";
	message: string;
};

export async function createToastHeaders(toastInput: ToastInput) {
	const session = await toastSessionStorage.getSession();
	const toast = toastInput;
	session.flash(toastKey, toast);
	const cookie = await toastSessionStorage.commitSession(session);
	return new Headers({ "set-cookie": cookie });
}

export async function redirectWithToast(
	url: string,
	toast: ToastInput,
	init?: ResponseInit,
) {
	return redirect(url, {
		...init,
		headers: combineHeaders(init?.headers, await createToastHeaders(toast)),
	});
}

export async function getToast(request: Request) {
	const session = await toastSessionStorage.getSession(
		request.headers.get("cookie"),
	);
	const toast = session.get(toastKey) as {
		intent: "success" | "error" | "warning" | "info";
		message: string;
	} | null;

	return {
		toast,
		headers: toast
			? new Headers({
					"set-cookie": await toastSessionStorage.destroySession(session),
				})
			: null,
	};
}
