// ============================================================================
// Kickstarter ingest — shared types
// ----------------------------------------------------------------------------
// A `NormalizedBacker` is the source-agnostic shape every adapter produces.
// CSV today, a pledge-manager API later — both must emit this same shape so the
// import service (lib/supabase/kickstarter-service.ts) never knows or cares
// where the data came from.
// ============================================================================

export interface NormalizedShippingAddress {
  line1?: string
  line2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface NormalizedBacker {
  /** Stable per-backer identity used for dedupe. KS "Backer Number"/"Backer UID". */
  backerUid: string
  email: string
  name: string
  /** Raw tier/reward label exactly as it appears in the source. */
  pledgeTierLabel: string
  rewardTitle?: string
  /** Units of the selected reward the backer ordered. Defaults to 1. */
  quantity: number
  /**
   * Whether the pledge actually collected. False for errored/dropped/cancelled
   * pledges. Defaults to true when the export has no status column (a report
   * downloaded after collection lists collected backers).
   */
  collected: boolean
  pledgeAmount?: number
  currency?: string
  /** Add-ons as a raw string; parsed into structured items in a later phase. */
  addonsRaw?: string
  shippingAddress?: NormalizedShippingAddress
  /** The full original row/record, preserved verbatim for audit + re-mapping. */
  raw: Record<string, unknown>
}

export type KickstarterSourceKind =
  | "kickstarter_csv"
  | "backerkit"
  | "crowdox"
  | "manual"

/**
 * Every ingest source implements this. The import service depends only on this
 * interface, so swapping CSV → pledge-manager API is a one-line wiring change.
 */
export interface KickstarterSource {
  readonly kind: KickstarterSourceKind
  /** Produce normalized backers from whatever this source reads (file, API, ...). */
  fetchBackers(): Promise<NormalizedBacker[]>
}

export interface ImportResult {
  importId: string
  rawRowCount: number
  importedCount: number   // new orders created
  updatedCount: number    // existing orders matched/updated
  skippedCount: number
  errors: string[]
}
