// ============================================================================
// Article-code segment definitions (SAFE CHINO spec — Layer 1).
// ----------------------------------------------------------------------------
// 8 fixed segments, each a zero-padded numeric field of a fixed width. Segment
// order and widths are the contract the whole engine + UI rely on. Segment 8
// (reserved) is optional and omitted from both human + machine strings when unset.
// ============================================================================

export interface SegmentDef {
  no: number
  key: SegmentKey
  name: string
  width: number
  required: boolean
}

export type SegmentKey =
  | "target_group"
  | "product_category"
  | "fabric_family"
  | "fabric_type"
  | "supplier"
  | "supplier_article_no"
  | "specs_finishing"
  | "reserved"

export const SEGMENTS: SegmentDef[] = [
  { no: 1, key: "target_group",        name: "Target Group",          width: 2, required: true },
  { no: 2, key: "product_category",    name: "Product Category",      width: 2, required: true },
  { no: 3, key: "fabric_family",       name: "Fabric Family",         width: 2, required: true },
  { no: 4, key: "fabric_type",         name: "Fabric Type",           width: 2, required: true },
  { no: 5, key: "supplier",            name: "Supplier",              width: 3, required: true },
  { no: 6, key: "supplier_article_no", name: "Supplier Article No.",  width: 5, required: true },
  { no: 7, key: "specs_finishing",     name: "Specs / Finishings",    width: 2, required: true },
  { no: 8, key: "reserved",            name: "Reserved / Future",     width: 3, required: false },
]

export const SEGMENT_BY_NO = new Map(SEGMENTS.map((s) => [s.no, s]))
export const SEGMENT_BY_KEY = new Map(SEGMENTS.map((s) => [s.key, s]))
