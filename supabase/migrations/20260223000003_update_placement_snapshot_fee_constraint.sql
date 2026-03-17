-- Update placement_snapshot constraint to allow 0 fee placements
ALTER TABLE "public"."placement_snapshot" DROP CONSTRAINT IF EXISTS "valid_placement_fee";
ALTER TABLE "public"."placement_snapshot" ADD CONSTRAINT "valid_placement_fee" CHECK (("total_placement_fee" >= (0)::numeric));
