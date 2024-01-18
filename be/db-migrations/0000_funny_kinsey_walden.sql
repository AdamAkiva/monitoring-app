DO $$ BEGIN
 CREATE TYPE "color" AS ENUM('green', 'orange', 'red');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "thresholds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"website_id" uuid NOT NULL,
	"color" "color" NOT NULL,
	"threshold" integer NOT NULL,
	CONSTRAINT "website_color_unique_constraint" UNIQUE("website_id","color")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "websites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" varchar(2048) NOT NULL,
	"monitor_interval" integer NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "websites_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "thresholds_website_id_idx" ON "thresholds" ("website_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "thresholds" ADD CONSTRAINT "thresholds_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "websites"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
