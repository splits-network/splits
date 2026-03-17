-- Phase 1C: Create job_recommendations table
-- Enables company users (non-recruiters) to recommend jobs to candidates.
-- Candidates see these prominently on their dashboard.

CREATE TABLE IF NOT EXISTS "public"."job_recommendations" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "job_id" uuid NOT NULL,
    "candidate_id" uuid NOT NULL,
    "recommended_by" uuid NOT NULL,
    "message" text,
    "status" text NOT NULL DEFAULT 'pending',
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "job_recommendations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "job_recommendations_job_candidate_key" UNIQUE ("job_id", "candidate_id"),
    CONSTRAINT "job_recommendations_job_id_fkey" FOREIGN KEY ("job_id")
        REFERENCES "public"."jobs"("id") ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT "job_recommendations_candidate_id_fkey" FOREIGN KEY ("candidate_id")
        REFERENCES "public"."candidates"("id") ON UPDATE RESTRICT ON DELETE CASCADE,
    CONSTRAINT "job_recommendations_recommended_by_fkey" FOREIGN KEY ("recommended_by")
        REFERENCES "public"."users"("id") ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT "job_recommendations_status_check" CHECK (status = ANY (ARRAY['pending', 'viewed', 'applied', 'dismissed']))
);

ALTER TABLE "public"."job_recommendations" OWNER TO "postgres";

COMMENT ON TABLE "public"."job_recommendations"
  IS 'Company users recommend jobs to candidates. Candidates see on dashboard and can apply or dismiss.';

CREATE INDEX "idx_job_recommendations_candidate_status"
  ON "public"."job_recommendations" ("candidate_id", "status");

CREATE INDEX "idx_job_recommendations_job_id"
  ON "public"."job_recommendations" ("job_id");

CREATE INDEX "idx_job_recommendations_recommended_by"
  ON "public"."job_recommendations" ("recommended_by");

-- Grant permissions
GRANT ALL ON TABLE "public"."job_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."job_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."job_recommendations" TO "service_role";
