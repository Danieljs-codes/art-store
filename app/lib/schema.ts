import { z } from "zod";
import { ARTWORK_CATEGORIES } from "./misc";

export const SignInSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z.string().min(1, { message: "Password is required" }),
	rememberMe: z
		.enum(["on", "off"])
		.optional()
		.transform((val) => val === "on")
		.default("off"),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignUpSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Name must be at least 2 characters long" }),
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" })
		.max(120, { message: "Password must be at most 120 characters long" }),
});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export const StepOneArtistSchema = z.object({
	artistName: z.string().min(1, "Artist name is required"),
	portfolioUrl: z
		.string()
		.optional()
		.refine(
			(url) => {
				if (!url) return true;
				if (url.startsWith("https")) return true;
				return false;
			},
			{
				message: "Please enter a valid URL",
			},
		),
	artistBio: z.string().min(1, "Artist bio is required"),
});

export type StepOneArtistSchemaType = z.infer<typeof StepOneArtistSchema>;

export const StepTwoArtistSchema = z.object({
	accountNumber: z.string().length(10, "Account number must be 10 digits long"),
	bankCode: z.string().min(1, "Bank code is required"),
});

export type StepTwoArtistSchemaType = z.infer<typeof StepTwoArtistSchema>;

export const createArtistSchema = z.object({
	artistName: z.string().min(1, "Artist Name is required"),
	portfolioUrl: z
		.string()
		.optional()
		.refine((url) => {
			if (!url) return true;
			if (url.startsWith("https://")) return true;
			return false;
		}, "Portfolio URL must start with https://"),
	artistBio: z
		.string()
		.min(10, "Artist Bio must be at least 10 characters long"),
	accountNumber: z
		.string()
		.regex(/^\d{10}$/, "Account Number must be 10 digits"),
	bankCode: z.string().min(1, "Bank Code is required"),
});

export type CreateArtistSchema = z.infer<typeof createArtistSchema>;

export const artistArtworksSchema = z.object({
	page: z
		.string()
		.default("1")
		.transform((val) => {
			const num = Number.parseInt(val);
			if (Number.isNaN(num)) return 1;
			return num;
		}),
	limit: z
		.string()
		.transform((val) => {
			const num = Number.parseInt(val);
			if (Number.isNaN(num)) return 10;
			return num;
		})
		.default("10"),
});

export type ArtistArtworksSchema = z.infer<typeof artistArtworksSchema>;

export const createArtworkSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	price: z
		.string()
		.transform((val) => Number(val))
		.pipe(z.number().min(100, "Price must be at least ₦100")),
	quantity: z
		.string()
		.transform((val) => Number(val))
		.pipe(z.number().min(1, "Quantity is required")),
	category: z.enum(ARTWORK_CATEGORIES, {
		required_error: "Category is required",
	}),
	dimensions: z
		.string()
		.min(1, "Dimensions are required")
		.refine(
			(val) => /^\d+x\d+\s*(cm|in)$/i.test(val),
			"Please use format: 20x30 cm or 20x30 in",
		),
	materials: z
		.string()
		.min(3, "Please provide more detail about materials used"),
	weight: z
		.string()
		.transform((val) => Number(val))
		.pipe(z.number().min(0.1, "Weight must be at least 0.1kg"))
		.optional(),
	frameType: z.string().optional(),
	files: z.array(z.instanceof(File)).min(2, "At least 2 images are required"),
});

export type CreateArtworkSchema = z.infer<typeof createArtworkSchema>;
