DO $$ BEGIN
 CREATE TYPE "color" AS ENUM('green', 'orange', 'red');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(2048) NOT NULL,
	"uri" varchar(2048) NOT NULL,
	"monitor_interval" integer NOT NULL,
	"created_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp(6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_name_unique" UNIQUE("name"),
	CONSTRAINT "services_uri_unique" UNIQUE("uri")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "thresholds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"lower_limit" integer NOT NULL,
	"upper_limit" integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "thresholds_service_id_idx" ON "thresholds" ("service_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "thresholds" ADD CONSTRAINT "thresholds_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
