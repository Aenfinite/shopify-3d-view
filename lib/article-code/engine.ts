// ============================================================================
// Article-code assembly engine (pure — no I/O). SAFE CHINO 8-segment model.
// ----------------------------------------------------------------------------
//   generateArticleCode({ target_group:'01', product_category:'02', ... })
//     → { human:'01.02.07.01.021.02451.04', machine:'010207010210245104', segments }
//
// Each segment value is normalised (digits only) and zero-padded to its fixed
// width. The optional `reserved` segment is omitted from both strings when blank.
// ============================================================================

import { SEGMENTS, type SegmentKey } from "./segments"
import type { ArticleCodeInput, ArticleCodeResult, ArticleCodeValidation } from "./types"

/** Keep digits only, then left-pad with zeros to `width` (or trim if longer). */
function normalizeSegment(value: string | undefined, width: number): string {
  const digits = (value ?? "").replace(/\D/g, "")
  if (!digits) return ""
  if (digits.length >= width) return digits.slice(0, width)
  return digits.padStart(width, "0")
}

/** Validate that every required segment is present and fits its width. */
export function validateArticleInput(input: Partial<Record<SegmentKey, string>>): ArticleCodeValidation {
  const errors: string[] = []
  for (const seg of SEGMENTS) {
    const raw = input[seg.key]
    const digits = (raw ?? "").replace(/\D/g, "")
    if (seg.required && !digits) {
      errors.push(`${seg.name} is required.`)
      continue
    }
    if (digits && digits.length > seg.width) {
      errors.push(`${seg.name} must be at most ${seg.width} digits (got ${digits.length}).`)
    }
    if (digits && /\D/.test(raw ?? "")) {
      errors.push(`${seg.name} must be numeric.`)
    }
  }
  return { ok: errors.length === 0, errors }
}

/** Build the human + machine article strings from per-segment codes. */
export function generateArticleCode(input: ArticleCodeInput): ArticleCodeResult {
  const parts: ArticleCodeResult["segments"] = []
  for (const seg of SEGMENTS) {
    const code = normalizeSegment(input[seg.key], seg.width)
    if (!code) continue // optional + empty → omit (reserved)
    parts.push({ no: seg.no, key: seg.key, name: seg.name, code })
  }
  return {
    human: parts.map((p) => p.code).join("."),
    machine: parts.map((p) => p.code).join(""),
    segments: parts,
  }
}
