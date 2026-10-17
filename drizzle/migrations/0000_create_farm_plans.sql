CREATE TABLE public.farm_plans (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL DEFAULT auth.uid(),
 location text NOT NULL,
 land_acres numeric NOT NULL CHECK (land_acres > 0),
 soil_type text NOT NULL,
 irrigation text NOT NULL,
 budget numeric NOT NULL CHECK (budget >= 10000),
 previous_crop text NOT NULL,
 results jsonb NOT NULL,
 calculation_version text NOT NULL DEFAULT 'heuristic-v1',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.farm_plans TO authenticated;
GRANT ALL ON public.farm_plans TO service_role;
ALTER TABLE public.farm_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own farm plans" ON public.farm_plans FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Create own farm plans" ON public.farm_plans FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Update own farm plans" ON public.farm_plans FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Delete own farm plans" ON public.farm_plans FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE INDEX farm_plans_owner_created ON public.farm_plans (user_id, created_at DESC);