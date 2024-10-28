import { betterAuth } from "better-auth";
import pkg from "pg";

const { Pool } = pkg;

export const auth = betterAuth({
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
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
	trustedOrigins: ["http://localhost:5173", "http://192.168.3.157:5173"],
});
