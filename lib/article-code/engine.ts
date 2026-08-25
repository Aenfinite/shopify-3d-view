// ============================================================================
// Article-code assembly engine (pure — no I/O). 22-digit Material Management model.
// ----------------------------------------------------------------------------
//   generateArticleCode({ target_group:'1', product_category:'01', ... })
//     → { human:'1-01-01-01-005-143-000-000123', machine:'1010101005143000000123', segments }
//
// Each segment value is normalised (digits only) and zero-padded to its fixed
// width. All segments are required in the new model.
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
    if (!code) continue
    parts.push({ no: seg.no, key: seg.key, name: seg.name, code })
  }
  return {
    human: parts.map((p) => p.code).join("-"),
    machine: parts.map((p) => p.code).join(""),
    segments: parts,
  }
}

/**
 * Parse a 22-digit SKU (human or machine format) back into individual segment codes.
 * Human format: '1-01-01-01-005-143-000-000123'
 * Machine format: '1010101005143000000123'
 */
export function parseArticleCode(code: string): Partial<Record<SegmentKey, string>> | null {
  // Try human format first (dash-separated)
  const dashParts = code.split("-")
  if (dashParts.length === SEGMENTS.length) {
    const result: Partial<Record<SegmentKey, string>> = {}
    for (let i = 0; i < SEGMENTS.length; i++) {
      result[SEGMENTS[i].key] = dashParts[i]
    }
    return result
  }

  // Try machine format (concatenated digits)
  const digits = code.replace(/\D/g, "")
  const totalWidth = SEGMENTS.reduce((sum, s) => sum + s.width, 0)
  if (digits.length === totalWidth) {
    const result: Partial<Record<SegmentKey, string>> = {}
    let pos = 0
    for (const seg of SEGMENTS) {
      result[seg.key] = digits.slice(pos, pos + seg.width)
      pos += seg.width
    }
    return result
  }

  return null
}
