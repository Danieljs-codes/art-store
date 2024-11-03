import { convertNairaToKobo } from "@/lib/misc";
import { createArtworkSchema } from "@/lib/schema";
import { redirectWithToast } from "@/lib/utils/redirect.server";
// import { createArtwork } from "@server/mutations.server";
import { getUser } from "@server/queries.server";
import { utapi } from "@server/uploadthing";
import { Icons } from "@components/icons";
import type { DropEvent } from "@react-types/shared";
import { Link, useActionData, useSubmit } from "@remix-run/react";
import { Button, buttonStyles } from "@ui/button";
import { Card } from "@ui/card";
import { DropZone } from "@ui/drop-zone";
import { Description, Label } from "@ui/field";
import { FileTrigger } from "@ui/file-trigger";
import { Form } from "@ui/form";
import { NumberField } from "@ui/number-field";
import { TextField } from "@ui/text-field";
import { Textarea } from "@ui/textarea";
import { type ActionFunctionArgs, json } from "@vercel/remix";
import { IconChevronLeft, IconGallery, IconX } from "justd-icons";
import { useState } from "react";
import { isFileDropItem } from "react-aria-components";
import { toast } from "sonner";

export const action = async ({ request }: ActionFunctionArgs) => {
	const user = await getUser(request.headers);

	if (!user) {
		return redirectWithToast("/", {
			intent: "warning",
			message: "Only artists can create artworks",
		});
	}
	const formData = await request.formData();
	// We need to handle files separately from other form fields because FormData can contain
	// multiple entries with the same key (files). Object.fromEntries would only keep the last file.

	// Annoyingly form data converts all values to strings, so we need to convert them back to their original types did that in the zod schema
	const entries = Array.from(formData.entries());
	const files = entries
		.filter(([key]) => key === "files")
		.map(([_, value]) => value as File);
	const otherFields = Object.fromEntries(
		entries.filter(([key]) => key !== "files"),
	);

	const result = createArtworkSchema.safeParse({ ...otherFields, files });

	if (!result.success) {
		return json({
			errors: {
				form: null,
				fields: result.error.flatten().fieldErrors,
			},
		});
	}

	// TODO: Upload images to uploadthing
	const response = await utapi.uploadFiles(result.data.files);

	// Check if any upload failed
	const hasError = response.some((res) => res.error !== null);
	if (hasError) {
		return json({
			errors: {
				form: "Failed to upload one or more images",
				fields: null,
			},
		});
	}

	// Get successful upload URLs
	const urls = response.map((res) => res.data?.url).filter(Boolean) as string[];
	if (urls.length === 0 || urls.some((url) => !url)) {
		return json({
			errors: {
				form: "No images were uploaded successfully",
				fields: null,
			},
		});
	}

	const artworkId = await createArtwork({
		...result.data,
		price: convertNairaToKobo(result.data.price),
		urls,
		userId: user.user.id,
	});

	// TODO: Redirect to the new artwork page
	return redirectWithToast(`/artworks`, {
		intent: "success",
		message: "Artwork created successfully",
	});
};

const ArtworksNew = () => {
	const actionData = useActionData<typeof action>();
	const submit = useSubmit();
	const [imagePreview, setImagePreviews] = useState<string[]>([]);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

	const onDropHandler = async (e: DropEvent) => {
		const allItems = e.items
			.filter(isFileDropItem)
			.filter(
				(item) => item.type === "image/jpeg" || item.type === "image/png",
			);

		if (allItems.length > 4) {
			toast.warning("Max of 4 images allowed. Uploading the first 4");
		}

		const items = allItems.slice(0, 4);

		if (items.length === 0) return;
		if (imagePreview.length >= 4) {
			toast.warning("You can only upload up to 4 images");
			return;
		}

		const files = await Promise.all(items.map((item) => item.getFile()));
		const newPreviews = files.map((file) => URL.createObjectURL(file));

		setImagePreviews((prev) => {
			const combined = [...prev, ...newPreviews];
			return combined.slice(0, 4);
		});

		setSelectedFiles((prev) => {
			const combined = [...prev, ...files];
			return combined.slice(0, 4);
		});
	};

	const onSelectHandler = async (e: FileList | null) => {
		if (!e?.length) return;
		if (imagePreview.length >= 4) {
			toast.warning("You can only upload up to 4 images");
			return;
		}

		const files = Array.from(e)
			.filter((file) => file.type === "image/jpeg" || file.type === "image/png")
			.slice(0, 4);

		const newPreviews = files.map((file) => URL.createObjectURL(file));

		setImagePreviews((prev) => {
			const combined = [...prev, ...newPreviews];
			return combined.slice(0, 4);
		});

		setSelectedFiles((prev) => {
			const combined = [...prev, ...files];
			return combined.slice(0, 4);
		});
	};

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		for (const file of selectedFiles) {
			formData.append("files", file);
		}

		submit(formData, {
			method: "post",
			encType: "multipart/form-data",
		});
	};

	return (
		<div>
			<div>
				<Link
					to="/artworks"
					className={buttonStyles({
						size: "extra-small",
						appearance: "outline",
					})}
				>
					<IconChevronLeft />
					Back to Artworks
				</Link>
			</div>
			<Card className="w-full mt-6">
				<Card.Header>
					<Card.Title>Add Artwork</Card.Title>
					<Card.Description className="text-xs md:text-sm text-muted-fg leading-tight">
						Fill in the details below to add a new artwork to your collection.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<Form
						onSubmit={onSubmit}
						method="post"
						validationErrors={actionData?.errors?.fields ?? undefined}
					>
						<div className="space-y-5">
							<TextField
								name="title"
								label="Title"
								validate={(val) => {
									if (!val) return "Title is required";
								}}
							/>
							<Textarea
								name="description"
								label="Description"
								className="min-h-20"
								validate={(val) => {
									if (!val) return "Description is required";
								}}
							/>
							<NumberField
								name="price"
								label="Price"
								step={100}
								minValue={100}
								formatOptions={{
									style: "currency",
									currency: "NGN",
									currencyDisplay: "narrowSymbol",
								}}
								validate={(val) => {
									if (!val || val === 0) return "Price is required";
									if (val < 100) return "Price must be at least ₦100";
								}}
							/>
							<NumberField
								name="quantity"
								label="Quantity"
								minValue={1}
								formatOptions={{
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								}}
								validate={(val) => {
									if (!val || val === 0) return "Quantity is required";
									if (val < 1) return "Quantity must be at least 1";
								}}
							/>
							<div>
								<Label htmlFor="artwork-images" className="mb-1 inline-block">
									Artwork Images
								</Label>
								<DropZone
									getDropOperation={(types) =>
										types.has("image/jpeg") || types.has("image/png")
											? "copy"
											: "cancel"
									}
									onDrop={onDropHandler}
								>
									<div className="grid space-y-3">
										<div className="size-12 mx-auto grid place-content-center rounded-full border bg-secondary/70 group-data-[drop-target]:bg-primary/20 group-data-[drop-target]:border-primary/70">
											<IconGallery className="size-5" />
										</div>
										<div className="justify-center flex">
											<FileTrigger
												acceptedFileTypes={["image/png", "image/jpeg"]}
												allowsMultiple={true}
												size="small"
												withIcon={false}
												onSelect={onSelectHandler}
											>
												<Icons.CloudUpload />
												Upload a file
											</FileTrigger>
										</div>
										<Description className="text-center leading-tight text-sm">
											Or drag and drop PNG, JPG, GIF up to 10MB
										</Description>
									</div>
								</DropZone>
								{actionData?.errors.fields?.files && (
									<Description className="text-center leading-tight text-sm text-danger">
										{actionData.errors.fields.files}
									</Description>
								)}
							</div>
						</div>
						<div className="flex gap-2 items-center justify-end mt-6">
							<Link
								to="/artworks"
								className={buttonStyles({
									size: "small",
									appearance: "outline",
								})}
							>
								Cancel
							</Link>
							<Button size="small" type="submit">
								Submit
							</Button>
						</div>
					</Form>
				</Card.Content>
			</Card>
			{imagePreview.length > 0 && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
					{imagePreview.map((preview, index) => (
						<div key={preview} className="relative group">
							<img
								src={preview}
								alt={`Preview ${index + 1}`}
								className="w-full h-32 object-cover rounded-lg"
							/>
							<Button
								type="button"
								onPress={() => {
									setImagePreviews((prev) =>
										prev.filter((_, i) => i !== index),
									);
									setSelectedFiles((prev) =>
										prev.filter((_, i) => i !== index),
									);
									URL.revokeObjectURL(preview);
								}}
								size="square-petite"
								intent="danger"
								shape="circle"
								className="absolute top-2 right-2 grid place-content-center size-7"
								aria-label={`Remove image ${index + 1}`}
							>
								<IconX className="size-4" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
export default ArtworksNew;
