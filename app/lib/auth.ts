import { db } from "@/server/db";
import schema from "@/server/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "mysql", "sqlite"
		schema,
		usePlural: true,
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		autoSignIn: true,
	},
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async (_, url) => {
			console.log(`Verification URL: ${url}`);
		},
	},
	trustedOrigins: ["http://localhost:5173", "http://192.168.200.157:5173"],
});
