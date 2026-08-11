# Material Management — Answers to Dany's 10 Questions

_Prepared for the Saturday meeting with Kurt. Every answer below describes **what exists in the system today**, not what we plan to build. Where something does not exist yet, it is marked clearly as **NOT YET** together with what it would take._

**Two admin screens matter for this discussion:**

| Screen | Menu path | What it holds today |
|---|---|---|
| **Fabrics** (Material Management) | Admin → Fabrics | The *visual* fabric: name, garment, fabric type, colour/texture image, price, print scale, 3D material settings |
| **Article Codes** | Admin → Article Codes | The *commercial* identity: all master-data lists (segments 1–8) + the SKU registry with the generated article code |

---

## 1. Master-data input — where are the permanent lists maintained?

**Answer: all of them are in one place — Admin → Article Codes** (database table `article_segment_values`). That page shows the SKU list at the top, and below it **one card per segment**, each with its own table of values and an "Add value" button.

| List | Where it lives today | Segment | Field width | Status |
|---|---|---|---|---|
| Target group (Men / Women / Children) | Article Codes → card #1 | 1 | 2 digits (01–99) | ✅ Available |
| Product categories | Article Codes → card #2 | 2 | 2 digits | ✅ Available |
| Fabric families | Article Codes → card #3 | 3 | 2 digits | ✅ Available |
| Fabric types | Article Codes → card #4 | 4 | 2 digits | ✅ Available |
| Suppliers | Article Codes → card #5 | 5 | 3 digits (001–999) | ✅ Available |
| Supplier article numbers | Article Codes → card #6 | 6 | 5 digits | ✅ Available — **scoped per supplier**, so the same article number can exist under two different suppliers without clashing |
| Finishings / specifications | Article Codes → card #7 | 7 | 2 digits | ✅ Available |
| Reserved / future use | Article Codes → card #8 | 8 | 3 digits, optional | ✅ Available |
| **Colours** | — | — | — | ⚠️ **NOT YET a master list.** See note below |

**About suppliers:** the system stores exactly what you asked for — a **code + the supplier's full name**. There are no address or contact fields, and none are needed.

**About colours — the one real gap.** Colour is currently handled in two disconnected ways and there is no central colour list:
1. In the **Article Codes** module, colour is a **free-text field typed on each SKU** (e.g. `midnight-navy`).
2. In the **Fabrics** module, colour is a **hex value or an uploaded texture image** used for the 3D preview.

In practice today, colour is expressed *through* segment 4 (Fabric Type = colour variant) and segment 6 (Supplier Article No.). A proper Colour master list is a small addition — it is the same pattern as the seven lists that already work.

_Code: `lib/article-code/segments.ts`, `components/admin/article-codes/article-codes-manager.tsx`_

---

## 2. Adding new values — can we do it ourselves, without programming?

**Answer: Yes. This works today, fully, for every list.**

On the Article Codes page each segment card has **Add value / Edit (pencil) / Delete (bin)**. Adding a Finishing takes about five seconds:

| Code | Label |
|---|---|
| `01` | Water repellent |
| `02` | Brushed |
| `03` | Easy ironing |

You type the code and the readable label, press Save, and it is immediately available. The system **zero-pads the code automatically** to the segment width — typing `1` in a 2-digit segment stores `01`, typing `21` in the 3-digit Supplier segment stores `021`. You can also set a **sort order** to control the order values appear in.

**The same method applies to every section** — suppliers, product categories, fabric families, fabric types, supplier article numbers, finishings. No programming, no deployment, no developer.

**Two things to be aware of:**
- A 2-digit segment allows 99 values (`01`–`99`); the Supplier segment allows 999. That is the only ceiling.
- If you **delete** a value that an existing article already used, the article keeps its code (the code string is stored on the article). It does not break, but the label will no longer resolve. Best practice: retire values rather than delete them once real data exists.

_Code: `app/api/admin/article-codes/segments/route.ts`, `lib/supabase/article-code-service.ts` (`upsertSegmentValue`)_

---

## 3. Dropdown selections — does the New SKU form show readable names?

**Answer: NOT YET. This is the clearest gap, and it is a small one.**

Today the "New SKU" dialog shows **eight free-text numeric boxes** — one per segment — and you type the code yourself (`01`, `02`, `07`, …). As you type, the system shows a **live preview** of the finished code:

```
Preview: 01.02.07.01.021.02451.04  ·  machine 010207010210245104
```

So the assembly, padding, validation and preview all work correctly — but the operator has to **know the numbers**, which is exactly the risk you are pointing at.

**Important:** the master-data values (labels + codes) are **already stored and already loaded into that same screen**. What is missing is only the UI wiring: replace the eight text boxes with eight dropdowns that display the label and insert the code behind the scenes:

- Dropdown shows: **Men / Women / Children** → stores `01` / `02` / `03`
- Dropdown shows: **Water repellent / Brushed / Easy ironing** → stores `01` / `02` / `03`

This is a front-end change on one file, roughly **half a day of work**, with no database change. It should be done before any real data entry starts.

One related detail: the **Product Category** field in the New SKU form is currently a hard-coded dropdown (`chino / shirt / belt`) rather than reading from the editable list in segment card #2. That should be switched over to the master list at the same time.

_Code: `components/admin/article-codes/article-codes-manager.tsx`, lines 209–229_

---

## 4. Missing values during article creation — can we add on the fly?

**Answer: Partly. You do not have to leave the page, but you do have to close the dialog.**

Today: the segment lists and the New SKU form are **on the same screen**. If a supplier or finishing is missing, you close the New SKU dialog, scroll to the relevant segment card, click "Add value", save it, then click "New SKU" again.

- ✅ You never leave the Article Codes page.
- ❌ The half-filled New SKU dialog is lost — you re-enter the fields you had already typed.

There is **no inline "+ Add new…" option inside the dropdowns yet**, because there are no dropdowns yet (see Q3). The natural way to build this is to add the "+ Add new…" entry at the bottom of each dropdown when we do the dropdown work — it opens a small popup, saves the value, and returns you to the form with the new value selected and everything else preserved. Same half-day of work, same file.

---

## 5. Multiple finishings — can one article have more than one?

**Answer: No. Today exactly one finishing per article.**

Segment 7 (Specs / Finishing) is a **single 2-digit field**. One article code carries one value in that position. In the current seed data every article uses `04 – Standard finishing`.

**How it is designed today:** the segment was built as a *finishing package*, not as individual properties — meaning a combination such as "water repellent + easy ironing" would have to be entered as its own coded value, e.g.:

```
01 – Water repellent
02 – Brushed
03 – Easy ironing
04 – Standard finishing
11 – Water repellent + Easy ironing     ← a combination as its own code
12 – Water repellent + Brushed
```

This works, but it does not scale: with 8 finishings you would need up to 255 combination codes, and reporting on "all water-repellent articles" becomes impossible because the information is locked inside one number.

**The clean solution** is the one you propose in Q6: take Finishing **out** of the code and store it as a proper multi-select list of technical article properties. Then an article can carry any number of finishings, each one individually reportable and filterable. See Q6.

---

## 6. Finishing inside or outside the article code — can it be removed?

**Answer: Yes, and it is a genuinely small change — cleanly, with no risk, because no real data exists yet.**

All eight segments are defined in **one single file** (`lib/article-code/segments.ts`) as a simple list. The code generator, the validator, the admin screens, the live preview and the barcode all read from that one list. **Removing the Finishing segment = deleting one line in that list**, plus dropping one database column. Nothing else has to be touched — the code would simply become 6 segments:

```
Today:   01.02.07.01.021.02451.04     (7 used segments + optional reserved)
After:   01.02.07.01.021.02451        (Finishing removed from the code)
```

Finishings would then become **technical article information** — a separate multi-select list linked to the article (this is what makes multiple finishings possible, per Q5).

**Where the selected finishings must still appear — current status:**

| Output | Exists today? | Work needed |
|---|---|---|
| Article details (admin screen) | Screen exists; finishings are shown only as a code digit | Add a "Finishings" field showing the readable names |
| Production sheet (PDF) | ✅ Exists and works — branded A4 sheet, per garment, with the article code **and a real Code 128 barcode**, design choices and locked measurements | Add one "Finishings:" line |
| CSV / Excel export | ✅ Exists and works — one row per production unit, UTF-8 BOM so Excel opens it correctly, includes Article (human) and Article (machine) columns | Add one "Finishings" column |

Both exports are already live: **Admin → Orders → Export CSV** for the whole list, and **Admin → Orders → (open an order) → Production sheet** for the PDF. Adding finishings to them is a one-line change in each of two files.

_Code: `lib/article-code/segments.ts`, `lib/export/production-sheet.ts`, `lib/export/csv.ts`_

---

## 7. Fabric and supplier connection — is it automatic?

**Answer: This is the most important point. Today the fabric is NOT connected to the supplier, and the information must be re-entered for every SKU.**

The two modules are currently **completely separate**:

**Fabrics module (Admin → Fabrics)** — this is a *visual/3D* record. It stores:
- Fabric name, which garment it belongs to
- Fabric type (cotton / linen / polyester — for the 3D material behaviour)
- Colour (hex swatch) **or** an uploaded texture image
- Price, printed yes/no, print repeat size in cm, and 3D surface settings

It stores **no supplier, no supplier article number, no composition, no finishing, no colour name.**

**Article Codes module (Admin → Article Codes)** — this is the *commercial* record. Per SKU it stores:
- Supplier and Supplier article number — as **numeric segment codes typed by hand**
- Fabric composition (e.g. `70% PES / 30% Viscose`) — as a **free-text field typed by hand**
- Colour — as a **free-text field typed by hand**

**Consequence today:** selecting a fabric fills in **nothing**. Every SKU repeats supplier, article number, composition and colour manually. With 8 chino colours that is 8 × the same composition typed 8 times — and 8 chances to type it differently.

**What it should be — and this is the core proposal for Saturday:**

> The **Fabric** becomes the master record. It carries: supplier → supplier article number → composition → colour → finishings → fabric family → fabric type.
> In the New SKU form you then select **one** fabric, and the system fills segments 3, 4, 5, 6 (and the composition and colour) **automatically**. The operator only chooses target group and product category.

This eliminates the re-typing, guarantees consistency, and is what makes the dropdowns in Q3 genuinely useful.

_Code: `lib/supabase/types.ts` (fabrics table), `components/admin/fabrics/fabric-wizard.tsx`_

---

## 8. Material Management versus Article Code Management

**Your suspicion is correct: the fabric is currently NOT created in Material Management and then selected in the New SKU form. The two are unlinked.**

**Where information sits TODAY:**

| Information | Material Management (Fabrics) | Article Code Management |
|---|---|---|
| Fabric name | ✅ | — |
| Texture image / colour swatch, print scale, 3D settings | ✅ | — |
| Price | ✅ | — |
| Supplier | — | ✅ (as a numeric code, typed) |
| Supplier article number | — | ✅ (as a numeric code, typed) |
| Fabric composition | — | ✅ (free text, typed per SKU) |
| Colour name | — | ✅ (free text, typed per SKU) |
| Finishing | — | ✅ (one numeric code) |
| Target group, product category | — | ✅ |
| The generated article code + barcode | — | ✅ |

**Where it SHOULD sit — proposed split:**

| Material Management (the fabric = the material master) | Article Code Management (the article = product + material) |
|---|---|
| Supplier (full name) | Target group |
| Supplier article number | Product category |
| Fabric family + fabric type | The **selected fabric** (one dropdown → pulls everything from the left column) |
| Composition | The generated article code + barcode |
| Colour | Brand (as article information) |
| Finishings (multi-select) | Anything genuinely article-specific |
| Texture image, price, 3D settings | |

In one sentence: **Material Management owns everything that is true about the material. Article Code Management owns everything that is true about the product made from it.** Right now that boundary does not exist, which is why the same data is typed twice.

---

## 9. Article-code flexibility — can it still be changed easily?

**Answer: Yes — all of it, easily, and now is exactly the right moment.**

There is **no real production data in the system yet** — only 12 demo SKUs from the seed file (8 chinos, 2 shirts, 2 belts). Nothing is printed, nothing is in production, no barcode is in circulation. Changing the structure now costs almost nothing; changing it after real data exists means re-coding every article.

| Requested change | Possible? | What it involves |
|---|---|---|
| Number of segments | ✅ Yes | Add or remove a line in one definition file |
| Segment order | ✅ Yes | Reorder that same list — code, preview, barcode and exports all follow automatically |
| Number of digits per segment | ✅ Yes | Change one number per line; padding and validation adapt automatically |
| Removing the Finishing segment | ✅ Yes | Delete one line + drop one database column (see Q6) |
| Adding **Brand** as article information | ✅ Yes | New field on the article — **and it does not need to be part of the code**; it can be pure article information shown in details, production sheet and CSV |
| Changing labels and categories | ✅ Yes — **already possible today from the admin screen**, no developer needed (see Q2) |

Two caveats, stated honestly:
- Changing the **structure** (segments, order, widths) is a developer change to one file — small, but not something you do yourself from the admin screen. Changing **labels and values** is fully self-service.
- The 12 demo SKUs would need re-seeding after a structural change. That is a single script, a few minutes.

**Recommendation: agree the final structure at the Saturday meeting, before any real article is entered.**

---

## 10. One complete example — end-to-end walkthrough

Here is the honest current state of the full flow. Steps 1–5 are all on **one screen**.

| # | Step | Works today? | Notes |
|---|---|---|---|
| 1 | **Add a supplier** | ✅ Yes | Article Codes → segment card #5 "Supplier" → Add value → code `021`, label `Textiles Ltd.` → Save |
| 2 | **Add a fabric** | ⚠️ Two separate places | Visual fabric: Admin → Fabrics → guided wizard (upload texture, set print scale, live 3D preview). Commercial fabric: Article Codes → cards #3 Fabric Family and #4 Fabric Type + card #6 Supplier Article No. **These are not linked to each other** (Q7) |
| 3 | **Add a colour** | ⚠️ No colour master list | Colour is entered as free text on the SKU, and as a hex/texture in the Fabrics module (Q1) |
| 4 | **Add two finishings** | ⚠️ Values yes, two per article no | You can add `01 Water repellent` and `02 Brushed` to segment card #7 in seconds. But **one article can only carry one of them** (Q5) |
| 5 | **Create the article / SKU** | ✅ Yes, but by typing codes | Article Codes → New SKU → SKU key, category, colour, composition, then the 8 segment codes typed by hand, with a live preview of `01.02.07.01.021.02451.04`. **Dropdowns with readable names are not yet wired in** (Q3) |
| 6 | **Production sheet / CSV export** | ✅ Yes — both work | **Production sheet:** Admin → Orders → open an order → "Production sheet" → branded A4 PDF, one section per garment, with article code, **real scannable Code 128 barcode**, design choices and locked production measurements. **CSV:** Admin → Orders → "Export CSV" → one row per production unit, Excel-ready, including Article (human) and Article (machine) |

**One honest limitation on step 6:** both exports are **order-based** — they export orders and the garments inside them. There is currently **no "export the SKU / article list itself to CSV"** button. If you need a master article list as Excel for suppliers or production planning, that is a separate small addition — say the word and it is straightforward.

**Screenshots / screen recording:** I will record a short screen capture of the live admin covering steps 1 → 6 in one pass, so you and Kurt can see the real screens rather than a description. Everything marked ✅ above will be shown working; everything marked ⚠️ I will show as it actually is today, so there are no surprises on Saturday.

---

## Summary — the short version for Saturday

**What already works, today, with no development:**
1. All seven master-data lists exist and are **fully self-service** — add, edit, delete, sort, no programmer (Q1, Q2).
2. The article code engine works correctly: automatic zero-padding, validation, live preview, human + machine format (Q3).
3. Production sheet PDF **with a real scannable barcode**, and Excel-ready CSV export, both live (Q6, Q10).
4. The whole structure is still **completely flexible** — nothing is locked in (Q9).

**The four gaps, in priority order:**
1. 🔴 **Fabric is not linked to supplier / article number / composition / colour** → everything is re-typed for every SKU. This is the biggest one (Q7, Q8).
2. 🟠 **No dropdowns in the New SKU form** — operators type raw numbers. The data is already there; only the UI wiring is missing (Q3).
3. 🟠 **Only one finishing per article** — and it is locked inside the code. Recommend taking Finishing out of the code and making it a multi-select article property (Q5, Q6).
4. 🟡 **No colour master list**, and no "+ add new value" inline while creating an article (Q1, Q4).

**My recommendation for the meeting:** decide the final code structure on Saturday — specifically whether Finishing comes out of the code and whether Brand goes in — **before any real article is entered**. Everything above is cheap to change now and expensive to change later.
