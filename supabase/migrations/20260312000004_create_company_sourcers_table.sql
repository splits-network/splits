-- Phase 1B: Create dedicated company_sourcers table
-- Mirrors candidate_sourcers for structural uniformity.
-- Permanent attribution of company sourcing — first recruiter wins.

CREATE TABLE IF NOT EXISTS "public"."company_sourcers" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "company_id" uuid NOT NULL,
    "sourcer_recruiter_id" uuid NOT NULL,
    "sourcer_type" text NOT NULL DEFAULT 'recruiter',
    "sourced_at" timestamp with time zone DEFAULT now() NOT NULL,
    "protection_window_days" integer DEFAULT 365,
    "protection_expires_at" timestamp with time zone,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "company_sourcers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "company_sourcers_company_id_key" UNIQUE ("company_id"),
    CONSTRAINT "company_sourcers_company_id_fkey" FOREIGN KEY ("company_id")
        REFERENCES "public"."companies"("id") ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT "company_sourcers_sourcer_recruiter_id_fkey" FOREIGN KEY ("sourcer_recruiter_id")
        REFERENCES "public"."recruiters"("id") ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT "company_sourcers_sourcer_type_check" CHECK (sourcer_type = ANY (ARRAY['recruiter', 'tsn']))
);

ALTER TABLE "public"."company_sourcers" OWNER TO "postgres";

COMMENT ON TABLE "public"."company_sourcers"
  IS 'Permanent attribution of company sourcing - first recruiter wins';

COMMENT ON COLUMN "public"."company_sourcers"."sourcer_recruiter_id"
  IS 'Recruiter who first brought this company to the platform';

CREATE INDEX "idx_company_sourcers_recruiter_id"
  ON "public"."company_sourcers" ("sourcer_recruiter_id");

-- Data migration: copy active sourcer records from recruiter_companies
INSERT INTO "public"."company_sourcers" (
    company_id,
    sourcer_recruiter_id,
    sourcer_type,
    sourced_at,
    created_at
)
SELECT
    rc.company_id,
    rc.recruiter_id,
    'recruiter',
    COALESCE(rc.relationship_start_date, rc.created_at),
    rc.created_at
FROM "public"."recruiter_companies" rc
WHERE rc.relationship_type = 'sourcer'
  AND rc.status = 'active'
ON CONFLICT (company_id) DO NOTHING;

-- Grant permissions
GRANT ALL ON TABLE "public"."company_sourcers" TO "anon";
GRANT ALL ON TABLE "public"."company_sourcers" TO "authenticated";
GRANT ALL ON TABLE "public"."company_sourcers" TO "service_role";
