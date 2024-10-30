import { createCookieSessionStorage } from "@vercel/remix";

export const toastSessionStorage = createCookieSessionStorage({
	cookie: {
		name: "en_toast",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
		httpOnly: true,
		secrets: process.env.COOKIE_SECRET?.split(","),
	},
});
