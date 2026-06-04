"use client"

import { useMemo } from "react"
import { code128DataUri } from "@/lib/article-code/barcode"

/**
 * Shows the human-readable article code plus a live Code 128 barcode rendered
 * from the stored machine string. Pure client-side render — no image fetch.
 */
export function ArticleCodeBadge({
  human,
  barcode,
}: {
  human: string | null
  barcode: string | null
}) {
  const dataUri = useMemo(() => (barcode ? code128DataUri(barcode, { height: 44, moduleWidth: 1.6 }) : null), [barcode])

  if (!human && !barcode) {
    return <span className="text-xs text-muted-foreground italic">Article code pending — configure the garment to generate it.</span>
  }

  return (
    <div className="flex items-center gap-3">
      <div className="space-y-0.5">
        <p className="font-mono text-sm font-semibold tracking-wide">{human ?? "—"}</p>
        {barcode && <p className="font-mono text-[10px] text-muted-foreground">{barcode}</p>}
      </div>
      {dataUri && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUri} alt={`Barcode ${barcode}`} className="h-12 bg-white rounded border border-border p-1" />
      )}
    </div>
  )
}
