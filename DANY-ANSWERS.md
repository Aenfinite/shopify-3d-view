# Answers for Dany — Motif Calibration + System Questionnaire

_Grounded in the actual code/seed data (SAFE CHINO Phase 1)._

## 0. Motif calibration — yes, one measurement is enough

Your understanding is **correct**. You only provide **one** accurate measurement.

- You draw a box around one motif and type its real size for **one axis** (Width *or* Height — there's a W/H toggle).
- The tool derives a single number, **cm-per-pixel** = `real_cm ÷ box_pixels_on_that_axis`.
- It then sets **both** repeat dimensions from that one number, using the image's own pixel dimensions:
  - `repeat_width_cm  = image_width_px  × cm_per_px`
  - `repeat_height_cm = image_height_px × cm_per_px`

Because both come from the same cm/px applied to the image's real pixels, the **aspect ratio is locked to the artwork** — the print can never come out stretched. That's why you saw the second dimension adjust automatically. One good ruler measurement is all you need.
_(Code: `components/admin/fabrics/motif-calibrator.tsx`, lines 70–86.)_

---

## 1. Article codes

**Format:** 8 fixed numeric segments, zero-padded, joined two ways:
- **Human:** dots — `01.02.07.05.021.02455.04`
- **Machine (barcode):** digits only — `010207050210245504`

| # | Segment | Width | Example |
|---|---------|-------|---------|
| 1 | Target Group | 2 | `01` (SAFE Kickstarter) |
| 2 | Product Category | 2 | `02` chino · `03` shirt · `04` belt |
| 3 | Fabric Family | 2 | `07` chino blend · `08` shirt cotton · `09` belt leather |
| 4 | Fabric Type / colour variant | 2 | `05` (Muted Olive) |
| 5 | Supplier | 3 | `021` |
| 6 | Supplier Article No. | 5 | `02455` |
| 7 | Specs / Finishing | 2 | `04` |
| 8 | Reserved / Future | 3 (optional) | omitted when empty |

**Real examples (from seed data):**
- SAFE CHINO Midnight Navy → `01.02.07.01.021.02451.04`
- SAFE CHINO **Muted Olive** → `01.02.07.05.021.02455.04`
- SAFE Shirt White → `01.03.08.01.021.03101.04`
- SAFE Belt Brown → `01.04.09.01.021.04201.04`

**Colour:** not its own segment. It's carried by **Segment 4 (variant)** + **Segment 6 (supplier article no.)**. Each product+colour is one row in the `product_skus` table keyed `chino:midnight-navy` etc. When a sub-order has `item_type=chino, color=muted-olive`, the system looks up that row and stamps its code automatically.

**Fit & size are NOT in the article code.** The code identifies product + fabric/colour only. Fit (Slim/Regular/Comfort) lives in the configurator selections, and waist size (e.g. 34) lives in the **measurements** record attached to the sub-order. This is deliberate — the article code is a fabric/SKU identifier for the factory; the size/fit travels on the measurement sheet.

**Supplier article no. longer than 5 digits:** the SKU builder **rejects it with a validation error** ("Supplier Article No. must be at most 5 digits"). It is not silently truncated at save time.
_(Code: `lib/article-code/segments.ts`, `engine.ts`; seed `…/004_safe_chino_seed.sql`.)_

---

## 2. Order structure (Master → Sub-orders → Article codes)

- **Master order** = `orders` row (order number e.g. `SC-00001`, customer, package, origin, status, total).
- **Sub-order** = `sub_orders` row, **one per garment slot** in the package.
- Each sub-order carries its own item type, colour, configurator selections, measurement, and stamped article code.

**Example — customer orders 1 SAFE CHINO + 1 SAFE SHIRT:**

```
Master Order  SC-00001  (origin, customer, package)
 ├─ Sub-order  SC-00001 (1-2)  chino  → article 01.02.07.xx.021.024xx.04
 └─ Sub-order  SC-00001 (2-2)  shirt  → article 01.03.08.xx.021.031xx.04
```

In the admin UI the orders list shows each master order with a sub-order count; opening it shows each sub-order as its own card (item, colour, status, measurement badge, article code + "regenerate code" button).
_(Code: `lib/supabase/orders-service.ts`, `components/admin/orders/order-detail.tsx`.)_

---

## 3. Kickstarter import

**Customer data stored** (`customers` table): email, name, full shipping address (line1/2, city, state, postal, country), `source = kickstarter`, and the backer number.

**Pledge / backer ID:** stored as `customers.kickstarter_backer_uid` (also used as the dedupe key so re-importing the same CSV updates instead of duplicating). A raw audit copy of each row is also kept.

**Reward package → garments:** the pledge tier label is matched to a `packages` record (by code/name). Each package has `package_items` defining its composition (e.g. SC-SET3 = 1 chino + 1 shirt + 1 belt), with per-slot colour/sleeve rules.

**Multiple garments in a package:** each item is expanded into its **own sub-order** — `quantity × backer-quantity`. E.g. importing SC-SET3 creates 3 sub-orders (chino, shirt, belt); if the backer pledged ×2, it creates 6.

**Expected CSV:** standard Kickstarter backer export. The parser is flexible about headers (accepts several names per field): Backer Number, Email, Backer Name, Reward Title/Tier, Quantity, Pledge Status, Pledge Amount, Currency, and the Shipping Address columns.
_(Code: `lib/kickstarter/*`, `lib/supabase/kickstarter-service.ts`, seed `…/04_safe_chino_seed_packages.sql`.)_

---

## 4. Production output

- **Production Sheet (PDF)** — one branded sheet **per order**, and this **is the factory output**. Contains: customer + shipping block, package, packing note, and per sub-order: ref, item, colour, **article code + Code 128 barcode**, the design selections table, and the **production measurements** (raw + allowance → frozen production values, with LOCKED indicator).
- **Export CSV** — one row **per sub-order**, 18 columns: master order, KS ref, sub-order ref, customer, email, package, item, colour, article (human), article (machine), status, design choices, body measurements, production measurements, version, locked, packing, created.
- **Barcode** — Code 128 encoding the **machine article code** (e.g. `010207050210245504`). Rendered as vector bars in the PDF, and there's also a per-sub-order **SVG label** endpoint for workshop printing.
- Export routes: `…/orders/[id]/export?format=pdf` and `?format=csv`.
_(Code: `lib/export/production-sheet.ts`, `lib/export/csv.ts`, `lib/article-code/barcode.ts`.)_

---

## 5. Product scalability (shirts / jackets / jeans / belts)

**Yes — no major redesign needed.** The design is data-driven:
- `item_type` is plain text everywhere (sub-orders, package items); the article code's product segment is just a number — no fixed enum to outgrow.
- The schema already references jacket/pants, and chino/shirt/belt are live today.

To add a new product (e.g. jacket) you: add its colour/option lists to the catalog, add its validation rules, and add SKU rows to `product_skus`. No schema migration, no change to the order workflow, exports, or barcode logic.
_(Code: `lib/safe-chino/catalog.ts`, `lib/article-code/segments.ts`.)_

---

## 6. Order origins (Kickstarter / Shopify / Manual)

The data model is built so **all three converge into the same** `orders → sub_orders → article-code → production` workflow: `orders.origin` is an enum of `kickstarter | shopify | manual`, and there are dedicated columns for `kickstarter_backer_id` and `shopify_draft_order_id`.

**Honest status of each entry point today:**
- **Kickstarter — fully wired end-to-end.** CSV import → customer → master order → sub-orders → article codes → exports. ✅
- **Shopify — outbound only so far.** The 3D configurator pushes selections into the Shopify cart, but there is **not yet an inbound webhook** that turns a completed Shopify order into a master/sub-order here. Schema is ready; the connector is the remaining piece. ⏳
- **Manual — schema ready, no create screen yet.** Orders can be listed, viewed, configured, status-changed, and exported, but there's **no "create order manually" form/endpoint** built yet. ⏳

So: the architecture already unifies all three; Kickstarter is complete, and Shopify + Manual need their entry connectors added (no redesign — they write into the same tables).

---

## 7. Complete test case — Olive chino, waist 34

We can run a full end-to-end test **today via the Kickstarter path** (the manual-create screen isn't built yet):

1. **Import** a 1-row Kickstarter CSV: backer = test customer, Reward = "Early Bird Safe Chino" (SC-SET1).
   → Creates master order `SC-0000X` + 1 chino sub-order `SC-0000X (1-1)`.
2. **Configure** the sub-order in admin: colour **Muted Olive**, Left SAFE pocket, monogram (≤5 chars, pick font/colour).
   → On save, the article code is auto-stamped: **`01.02.07.05.021.02455.04`** (machine `010207050210245504`).
3. **Measurements:** add waist **34** (→ cm) with allowance; confirm to freeze production values and lock the version.
4. **Export:** download the **Production Sheet PDF** (article code + barcode + selections + measurements) and the **CSV**.

That exercises Import → Order → Sub-order → Article Code → Production Sheet → Export. The only step not yet available as a button is *manual* order creation; for this test we seed it through the import.

---

### Two items flagged honestly for the roadmap
1. **Shopify → production** inbound connector (webhook) — not built yet.
2. **Manual order create** screen — not built yet.

Both write into the existing tables, so they're additive, not a redesign.
