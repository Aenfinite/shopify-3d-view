# Material Management, 22-Digit SKU Engine & Shopify Workflow Guide

**System:** Aenfinite Custom Tailoring 3D System  
**Deliverable Package:** Phase 1 Complete (€1,750 Package)  
**Live Production URL:** [https://shopify-3d-viewersss-main.vercel.app](https://shopify-3d-viewersss-main.vercel.app)  
**Audience:** Technical Team, Production Managers, Cutting/Sewing Operators  

---

## 1. Executive Summary & Architecture Overview

This document details the complete operational workflow for the centralized **Material Management System**, the **22-digit SKU Generator**, the **Shopify Inbound Webhook**, the **Enriched Production Sheet PDF/CSV Engine**, and the **SKU Quick-Lookup Tool**.

The goal of this system is to maintain a single source of truth for all fabric specifications (supplier details, exact yarn constructions, GSM weights, multiple finishings, and structured colour codes). When a customer orders on Shopify, the 22-digit SKU bridges the storefront directly to factory cutting & production sheets with zero manual data entry.

```
[ Central Material DB (/admin/materials) ]
                   │
                   ▼ (Generates 6-digit Material Spec ID: 000001)
[ 22-Digit SKU Generator (/admin/article-codes) ]
                   │
                   ▼ (Outputs SKU: 1-01-01-01-005-143-000-000001)
[ Shopify Product / Variant SKU field ]
                   │
                   ▼ (Customer places & pays for order on Shopify)
[ Shopify Inbound Webhook (/api/shopify/webhooks/orders-paid) ]
                   │
                   ▼ (Auto-creates Master Order & Sub-orders + parses SKU)
[ Enriched Production Sheets & Factory CSV Exports ]
```

---

## 2. The 22-Digit SKU Structure

The system uses an 8-segment, 22-digit format separated by dashes in human-readable view, or continuous digits in machine/barcode format:

| Seg # | Segment Key | Segment Name | Width | Example Code & Meaning |
| :---: | :--- | :--- | :---: | :--- |
| **1** | `target_group` | Target Group | 1 digit | `1` = Men, `2` = Women, `3` = Unisex, `4` = Children |
| **2** | `product_category` | Product Category | 2 digits | `01` = Shirt, `02` = Chino, `03` = Trousers, `04` = Belt |
| **3** | `fabric_family` | Fabric Family | 2 digits | `01` = 100% Cotton, `02` = Cotton-Linen, `03` = Wool-Blend |
| **4** | `fabric_type` | Fabric Type | 2 digits | `01` = Oxford, `02` = Poplin, `03` = Twill, `04` = Dobby |
| **5** | `supplier` | Supplier Code | 3 digits | `005` = Albini, `021` = Monti, `034` = Safe Chino Mill |
| **6** | `our_colour` | Our Colour Code | 3 digits | `143` = Night Blue (from 22 Colour Families 010–229) |
| **7** | `reserved` | Reserved / Future | 3 digits | `000` = Standard Reserved Buffer |
| **8** | `material_spec_id` | Material Spec ID | 6 digits | `000001` = Permanent Database ID pointing to Material Record |

* **Human Format (Dashes):** `1-01-01-01-005-143-000-000001`
* **Machine Format (Concatenated):** `1010101005143000000001`

---

## 3. Master Taxonomies: 20 Finishings & 22 Colour Families

### A. Multi-Select Finishing Master (20 Standard Finishings)
Materials can have multiple simultaneous finishes selected via checkboxes. The system prints them as comma-separated tags on Production Sheets:
1. Water repellent
2. Easy care
3. Easy ironing
4. Non-iron
5. Wrinkle resistant / Crease resistant
6. Anti-shrink / Shrink resistant
7. Sanforized / Pre-shrunk
8. Anti-pilling
9. Anti-static
10. Anti-bacterial / Antimicrobial
11. Anti-odour / Odour control
12. Moisture wicking
13. Quick dry
14. UV protection / UPF
15. Soft finish
16. Brushed
17. Peached / Peach finish
18. Enzyme finish
19. Mercerized
20. Washed finish

### B. 3-Digit Colour Master (22 Families, Ranges 010–229)
* **White Tones:** `010`–`019`
* **Ivory / Cream / Ecru:** `020`–`029`
* **Beige / Sand / Stone:** `030`–`039`
* **Camel / Tan:** `040`–`049`
* **Brown Tones:** `050`–`059`
* **Yellow Tones:** `060`–`069`
* **Orange Tones:** `070`–`079`
* **Red Tones:** `080`–`089`
* **Burgundy / Wine:** `090`–`099`
* **Pink / Rose:** `100`–`109`
* **Purple / Lilac:** `110`–`119`
* **Light Blue Tones:** `120`–`129`
* **Medium / Bright Blue:** `130`–`139`
* **Navy Tones:** `140`–`149`
* **Turquoise / Teal / Petrol:** `150`–`159`
* **Green Tones:** `160`–`169`
* **Olive / Khaki:** `170`–`179`
* **Grey Tones:** `180`–`189`
* **Charcoal / Anthracite:** `190`–`199`
* **Black:** `200`–`209`
* **Metallic:** `210`–`219`
* **Multicolour / Print:** `220`–`229`

---

## 4. Step-by-Step Operating Instructions

### Step 1: Adding a Material Specification
* **URL:** `https://shopify-3d-viewersss-main.vercel.app/admin/materials`
1. Go to **Admin ➔ Materials**.
2. Click **+ Add Material**.
3. Select the **Supplier** from the dropdown.
4. Enter the **Supplier Article / Quality Number** (e.g. `ALB-9842`).
5. Enter the **Supplier Colour Code & Name** (e.g. `C12 - Royal Sky`).
6. Select **Our Colour** from the taxonomy dropdown (e.g. `143 - Night Blue`).
7. Enter **Fabric Type**, **Composition** (e.g. `100% Egyptian Cotton`), **Width**, **Weight GSM** (e.g. `120`), and **Construction** (e.g. `Twill 2/1 80/2`).
8. Check all applicable **Finishings** checkboxes (e.g. `Easy care`, `Peached`).
9. Click **Save Material**. The system assigns a permanent 6-digit ID (e.g. `000001`).

---

### Step 2: Generating the 22-Digit SKU in the Registry
* **URL:** `https://shopify-3d-viewersss-main.vercel.app/admin/article-codes`
1. Go to **Admin ➔ Article Codes**.
2. Click **+ New SKU**.
3. Select **Target Group** (e.g. `Men`) and **Product Category** (e.g. `Shirt`).
4. Select **Fabric Family** and **Fabric Type**.
5. Select the **Supplier** ➔ The **Material Specification** picker automatically filters to show materials from that supplier.
6. Select the **Material Specification** ➔ The system automatically auto-fills and locks the 6-digit Spec ID, Our Colour code, and Supplier code.
7. The **Reserved** field defaults to `000`.
8. Review the live 22-digit preview (e.g. `1-01-01-01-005-143-000-000001`) and click **Save SKU**.

---

### Step 3: Entering the SKU into Shopify Products
* **Location:** **Shopify Admin ➔ Products ➔ Variants**
1. Open your Shopify Admin store.
2. Open the specific Product/Variant corresponding to this garment/fabric.
3. Paste the generated 22-digit SKU into the variant's **SKU** field.
4. Save the product.

---

### Step 4: Customer Order ➔ Automatic Inbound Webhook Execution
* **Webhook Endpoint:** `https://shopify-3d-viewersss-main.vercel.app/api/shopify/webhooks/orders-paid`
1. When a customer purchases the item on Shopify and pays, Shopify automatically triggers the webhook.
2. The endpoint verifies HMAC cryptographic security using `SHOPIFY_WEBHOOK_SECRET`.
3. Idempotency check prevents duplicate order creation.
4. Customer is auto-upserted with shipping address and contact info.
5. Master order is created with `origin = 'shopify'`.
6. Sub-orders are spawned for each line item.
7. The 22-digit SKU is parsed to link the 6-digit Material Spec ID.

---

### Step 5: Production Sheet PDF & Factory CSV Export
* **URL:** `https://shopify-3d-viewersss-main.vercel.app/admin/orders`
1. Open any order in Admin.
2. Click **Export Production Sheet (PDF)** or **Export CSV**.
3. The PDF generator looks up the Material Spec ID and prints a dedicated technical block directly below the barcode:
   * Supplier & Supplier Article #
   * Supplier Colour # & Name
   * Fabric Composition & Construction
   * Weight (GSM) & Width
   * Active Finishings List
4. Factory CSV export contains all material columns for cutting/sewing planning.

---

### Step 6: Real-Time SKU Quick-Lookup Tool
* **URL:** `https://shopify-3d-viewersss-main.vercel.app/admin/sku-lookup`
1. Paste or barcode-scan ANY 22-digit SKU (human or machine format).
2. The tool instantly breaks down all 8 segments with their human-readable labels.
3. It displays the live Material Specification Card with full technical properties and quick-export actions.

---

## 5. Live Production URLs Directory

| Feature / Page | Production URL | Access |
| :--- | :--- | :--- |
| **Material Specifications DB** | [`/admin/materials`](https://shopify-3d-viewersss-main.vercel.app/admin/materials) | Admin Auth |
| **22-Digit SKU Generator** | [`/admin/article-codes`](https://shopify-3d-viewersss-main.vercel.app/admin/article-codes) | Admin Auth |
| **SKU Quick-Lookup Tool** | [`/admin/sku-lookup`](https://shopify-3d-viewersss-main.vercel.app/admin/sku-lookup) | Admin Auth |
| **Orders & Production Sheets** | [`/admin/orders`](https://shopify-3d-viewersss-main.vercel.app/admin/orders) | Admin Auth |
| **Export Materials CSV** | [`/api/admin/materials/export`](https://shopify-3d-viewersss-main.vercel.app/api/admin/materials/export) | Admin Auth |
| **Export SKUs CSV** | [`/api/admin/article-codes/export`](https://shopify-3d-viewersss-main.vercel.app/api/admin/article-codes/export) | Admin Auth |
| **Shopify Inbound Webhook** | [`/api/shopify/webhooks/orders-paid`](https://shopify-3d-viewersss-main.vercel.app/api/shopify/webhooks/orders-paid) | HMAC Secured |
