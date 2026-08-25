// ============================================================================
// Article-code engine — shared types (22-digit Material Management model).
// ============================================================================

import type { SegmentKey } from "./segments"

/** The per-segment codes for one article. All segments are required. */
export type ArticleCodeInput = Record<SegmentKey, string>

export interface ArticleCodeResult {
  /** Dash-joined, e.g. '1-01-01-01-005-143-000-000123'. */
  human: string
  /** Concatenated digits, e.g. '1010101005143000000123'. */
  machine: string
  /** Per-segment breakdown (in segment order). */
  segments: Array<{ no: number; key: SegmentKey; name: string; code: string }>
}

export interface ArticleCodeValidation {
  ok: boolean
  errors: string[]
}
