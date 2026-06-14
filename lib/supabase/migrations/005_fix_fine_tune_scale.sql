-- 005 — Fix fabric print scale (fine_tune fudge → true cm scale)
--
-- The 3D renderer now normalizes each fabric panel by its real UV span
-- (getUvSpan in lib/3d/customization-utils.ts), so the old global "fine_tune"
-- fudge (default 5) is obsolete; neutral is now 1.0 = exact print size.
-- Reset fabrics that stored the old default so they don't render 5x too large.
-- Deliberate non-5 values are left untouched. Idempotent.

update fabrics
set pbr_settings = jsonb_set(pbr_settings, '{fine_tune}', '1'::jsonb, true),
    updated_at   = now()
where (pbr_settings ->> 'fine_tune') = '5';
