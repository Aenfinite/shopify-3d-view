# Database setup — run these 4 files in the Supabase SQL Editor

**SQL Editor:** https://supabase.com/dashboard/project/rjufptccilxmiqytjwnf/sql/new

## How

1. Open the SQL Editor link above.
2. Open file `01_order_backbone.sql` in this folder, copy ALL of it, paste into the editor, click **Run**.
3. Wait for **"Success. No rows returned"**.
4. Repeat for `02`, then `03`, then `04` — **in that exact order**.

| Order | File | What it creates |
|---|---|---|
| 1 | `01_order_backbone.sql` | customers, packages, orders, sub-orders, Kickstarter import tables |
| 2 | `02_measurements.sql` | measurements + version locking, SAFE CHINO sub-order fields |
| 3 | `03_article_codes_and_package_items.sql` | article-code engine tables + package items |
| 4 | `04_safe_chino_seed_packages.sql` | SEED DATA: 8 chino colors, 2 shirts, 2 belts, the 7 Early Bird packages |

All files are idempotent-safe on the seed data — but run each file only once if possible.

## After running

Check it worked: in the SQL Editor run

```sql
select code, name, garment_count from packages order by sort_order;
```

You should see the 7 `SC-SET1`…`SC-SET7` Early Bird packages.

Then open **https://shopify-3d-viewersss-main.vercel.app/admin/kickstarter** and the import page is ready to use.
