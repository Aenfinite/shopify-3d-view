"use client"

import { useState } from "react"
import { Search, Loader2, Barcode, ArrowRight, Download, ClipboardPaste } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

interface SegmentResult {
  no: number; key: string; name: string; width: number; code: string; label: string | null
}
interface MaterialSpec {
  spec_id: string
  supplier_code: string | null; supplier_name: string | null
  supplier_article_number: string | null
  supplier_colour_number: string | null; supplier_colour_name: string | null
  our_colour_code: string | null; our_colour_label: string | null; our_colour_family: string | null
  fabric_type: string | null; fabric_composition: string | null
  fabric_width: string | null; fabric_weight_gsm: string | null
  fabric_construction: string | null; product_specification: string | null
  finishings: Array<{ code: string; label: string }>
  notes: string | null
}
interface LookupResult {
  raw_sku: string
  segments: SegmentResult[]
  colour: { code: string; label: string | null; family: string | null } | null
  material_specification: MaterialSpec | null
}

export function SkuLookup() {
  const { toast } = useToast()
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LookupResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const lookup = async () => {
    const sku = input.trim()
    if (!sku) { toast({ title: "Enter a SKU code", variant: "destructive" }); return }

    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`/api/admin/sku-lookup?sku=${encodeURIComponent(sku)}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Lookup failed")
        return
      }
      setResult(data)
    } catch {
      setError("Failed to connect to the server")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void lookup()
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInput(text.trim())
    } catch {
      toast({ title: "Could not paste from clipboard", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Enter, paste, or scan a SKU code</label>
              <div className="relative">
                <Barcode className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. 1-01-01-01-005-143-000-000123 or 1010101005143000000123"
                  className="pl-11 text-lg font-mono h-12"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Accepts both human format (with dashes) and machine format (digits only)</p>
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12" onClick={handlePaste} title="Paste from clipboard">
              <ClipboardPaste className="h-5 w-5" />
            </Button>
            <Button onClick={lookup} disabled={loading} className="h-12 px-6">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Search className="h-5 w-5 mr-2" />Lookup</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Segment breakdown */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Barcode className="h-4 w-4" /> SKU Segment Breakdown
                <span className="font-mono text-sm text-muted-foreground ml-2">{result.raw_sku}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Meaning</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.segments.map((seg) => (
                    <TableRow key={seg.no}>
                      <TableCell><Badge variant="outline">{seg.no}</Badge></TableCell>
                      <TableCell className="font-medium">{seg.name}</TableCell>
                      <TableCell className="font-mono font-semibold">{seg.code}</TableCell>
                      <TableCell>
                        {seg.label
                          ? <span className="text-green-600 dark:text-green-400">{seg.label}</span>
                          : <span className="text-muted-foreground italic">Unknown</span>
                        }
                        {seg.key === "our_colour" && result.colour?.family && (
                          <Badge variant="secondary" className="ml-2 text-xs">{result.colour.family}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Material Specification */}
          {result.material_specification ? (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  Material Specification
                  <Badge className="ml-2 font-mono">{result.material_specification.spec_id}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoField label="Supplier" value={`${result.material_specification.supplier_name ?? "—"} (${result.material_specification.supplier_code ?? ""})`} />
                  <InfoField label="Supplier Article #" value={result.material_specification.supplier_article_number} />
                  <InfoField label="Supplier Colour #" value={result.material_specification.supplier_colour_number} />
                  <InfoField label="Supplier Colour Name" value={result.material_specification.supplier_colour_name} />
                  <InfoField label="Our Colour" value={result.material_specification.our_colour_label ? `${result.material_specification.our_colour_label} (${result.material_specification.our_colour_code})` : result.material_specification.our_colour_code} />
                  <InfoField label="Colour Family" value={result.material_specification.our_colour_family} />
                  <InfoField label="Fabric Type" value={result.material_specification.fabric_type} />
                  <InfoField label="Composition" value={result.material_specification.fabric_composition} />
                  <InfoField label="Construction" value={result.material_specification.fabric_construction} />
                  <InfoField label="Weight (GSM)" value={result.material_specification.fabric_weight_gsm} />
                  <InfoField label="Width" value={result.material_specification.fabric_width} />
                  <InfoField label="Product Spec" value={result.material_specification.product_specification} />
                </div>

                {/* Finishings */}
                {result.material_specification.finishings.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Finishings</p>
                    <div className="flex flex-wrap gap-2">
                      {result.material_specification.finishings.map((f) => (
                        <Badge key={f.code} variant="secondary">
                          {f.code} — {f.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {result.material_specification.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{result.material_specification.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-500/50">
              <CardContent className="p-4 text-amber-600 dark:text-amber-400">
                No material specification found for ID <span className="font-mono font-bold">{result.segments.find((s) => s.key === "material_spec_id")?.code}</span>.
                The material may not have been created yet.
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

// ── Helper component ────────────────────────────────────────────────────────

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  )
}
