// ============================================================================
// Article-code segment definitions — 22-digit Material Management model.
// ----------------------------------------------------------------------------
// 8 fixed segments, each a zero-padded numeric field of a fixed width. The
// complete SKU is 22 digits: 1-01-01-01-005-143-000-000123
//
// Segment order and widths are the contract the whole engine + UI rely on.
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
  | "our_colour"
  | "reserved"
  | "material_spec_id"

export const SEGMENTS: SegmentDef[] = [
  { no: 1, key: "target_group",      name: "Target Group",          width: 1, required: true },
  { no: 2, key: "product_category",  name: "Product Category",      width: 2, required: true },
  { no: 3, key: "fabric_family",     name: "Fabric Family",         width: 2, required: true },
  { no: 4, key: "fabric_type",       name: "Fabric Type",           width: 2, required: true },
  { no: 5, key: "supplier",          name: "Supplier",              width: 3, required: true },
  { no: 6, key: "our_colour",        name: "Our Colour",            width: 3, required: true },
  { no: 7, key: "reserved",          name: "Reserved / Future",     width: 3, required: true },
  { no: 8, key: "material_spec_id",  name: "Material Spec ID",      width: 6, required: true },
]

export const SEGMENT_BY_NO = new Map(SEGMENTS.map((s) => [s.no, s]))
export const SEGMENT_BY_KEY = new Map(SEGMENTS.map((s) => [s.key, s]))
