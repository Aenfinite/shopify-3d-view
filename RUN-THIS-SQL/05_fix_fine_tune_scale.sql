-- ==========================================================================
-- 05 — Fix fabric print scale (fine_tune fudge → true cm scale)
-- ==========================================================================
-- Context: the 3D renderer used to multiply the cm-accurate tile count by a
-- global "fine_tune" fudge that defaulted to 5. That fudge existed only to
-- partially cancel the shirt front panel's non-[0,1] UV unwrap. The renderer
-- now normalizes each panel by its real UV span (getUvSpan in
-- lib/3d/customization-utils.ts), so the fudge is no longer needed and the
-- neutral value is 1.0 (= exact, production-accurate print size).
--
-- Fabrics saved by the old wizard stored fine_tune = 5. With the new renderer
-- those would tile 5x too LARGE. This resets exactly those rows back to 1.
-- Rows where an admin deliberately chose another value (e.g. 2) are untouched.
--
-- Idempotent: re-running changes nothing once values are 1.
-- ==========================================================================

-- Preview which rows will change (optional — run first to see the count):
--   select id, name, pbr_settings->>'fine_tune' as fine_tune
--   from fabrics where (pbr_settings->>'fine_tune') = '5';

update fabrics
set pbr_settings = jsonb_set(pbr_settings, '{fine_tune}', '1'::jsonb, true),
    updated_at   = now()
where (pbr_settings ->> 'fine_tune') = '5';

-- Verify: this should return 0 rows after running.
--   select count(*) from fabrics where (pbr_settings->>'fine_tune') = '5';
