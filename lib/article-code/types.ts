// ============================================================================
// Article-code engine — shared types (8-segment SAFE CHINO model).
// ============================================================================

import type { SegmentKey } from "./segments"

/** The per-segment codes for one article. `reserved` is optional. */
export type ArticleCodeInput = Partial<Record<SegmentKey, string>> & {
  target_group: string
  product_category: string
  fabric_family: string
  fabric_type: string
  supplier: string
  supplier_article_no: string
  specs_finishing: string
}

export interface ArticleCodeResult {
  /** Dot-joined, e.g. '01.02.07.01.021.02451.04'. */
  human: string
  /** Concatenated digits, e.g. '010207010210245104'. */
  machine: string
  /** Per-segment breakdown (in segment order). */
  segments: Array<{ no: number; key: SegmentKey; name: string; code: string }>
}

export interface ArticleCodeValidation {
  ok: boolean
  errors: string[]
}
