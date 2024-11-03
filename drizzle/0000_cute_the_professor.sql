CREATE TYPE "public"."category" AS ENUM('PAINTING', 'DRAWING', 'PRINT', 'SCULPTURE', 'MIXED MEDIA', 'TEXTILE', 'CERAMIC', 'OTHERS');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('PENDING', 'PAID', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"expiresAt" timestamp,
	"password" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artist" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"bio" text NOT NULL,
	"portfolioUrl" text,
	"paystackSubAccountId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "artwork" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" real NOT NULL,
	"category" "category",
	"dimensions" text NOT NULL,
	"medium" text NOT NULL,
	"yearCreated" timestamp,
	"location" text NOT NULL,
	"weight" real,
	"frameType" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	"images" jsonb NOT NULL,
	"artistId" text NOT NULL,
	CONSTRAINT "price_positive" CHECK ("artwork"."price" > 0),
	CONSTRAINT "weight_positive" CHECK ("artwork"."weight" > 0),
	CONSTRAINT "year_not_future" CHECK ("artwork"."yearCreated" <= NOW())
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"buyerId" text NOT NULL,
	"totalAmount" real NOT NULL,
	"paymentReference" text NOT NULL,
	CONSTRAINT "total_amount_positive" CHECK ("order"."totalAmount" > 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase" (
	"id" text PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"artworkId" text NOT NULL,
	"orderId" text NOT NULL,
	"amount" real NOT NULL,
	"platformFee" real NOT NULL,
	"artistEarnings" real NOT NULL,
	"status" "purchase_status" DEFAULT 'PENDING' NOT NULL,
	CONSTRAINT "amount_positive" CHECK ("purchase"."amount" > 0),
	CONSTRAINT "platform_fee_positive" CHECK ("purchase"."platformFee" > 0),
	CONSTRAINT "artist_earnings_positive" CHECK ("purchase"."artistEarnings" > 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artist" ADD CONSTRAINT "artist_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "artwork" ADD CONSTRAINT "artwork_artistId_artist_id_fk" FOREIGN KEY ("artistId") REFERENCES "public"."artist"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order" ADD CONSTRAINT "order_buyerId_user_id_fk" FOREIGN KEY ("buyerId") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase" ADD CONSTRAINT "purchase_artworkId_artwork_id_fk" FOREIGN KEY ("artworkId") REFERENCES "public"."artwork"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase" ADD CONSTRAINT "purchase_orderId_order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."order"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "provider_idx" ON "account" USING btree ("providerId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artist_user_id_idx" ON "artist" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artist_name_idx" ON "artist" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artwork_artist_id_idx" ON "artwork" USING btree ("artistId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artwork_category_idx" ON "artwork" USING btree ("category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "artwork_price_idx" ON "artwork" USING btree ("price");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_buyer_id_idx" ON "order" USING btree ("buyerId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "order_payment_ref_idx" ON "order" USING btree ("paymentReference");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_artwork_id_idx" ON "purchase" USING btree ("artworkId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_order_id_idx" ON "purchase" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_status_idx" ON "purchase" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_idx" ON "user" USING btree ("email");