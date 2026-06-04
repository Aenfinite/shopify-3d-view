"use client"

import { useRef, useState } from "react"
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { useAdminAuth } from "@/context/admin-auth-context"

// Fields we care about most; a missing mapping for these gets a warning.
const REQUIRED_FIELDS = ["backerUid", "email", "name", "pledgeTierLabel"]
const FIELD_LABELS: Record<string, string> = {
  backerUid: "Backer ID", email: "Email", name: "Name",
  pledgeTierLabel: "Reward / Tier", rewardTitle: "Reward title",
  quantity: "Quantity", pledgeStatus: "Pledge status", addonsRaw: "Add-ons",
  pledgeAmount: "Pledge amount", currency: "Currency",
  addrLine1: "Address 1", addrLine2: "Address 2", addrCity: "City",
  addrState: "State", addrPostal: "Postal code", addrCountry: "Country",
}

interface PreviewSampleRow {
  backerUid: string; name: string; email: string; reward: string
  quantity: number; collected: boolean; pledgeAmount: number | null
  currency: string | null; shippingCountry: string | null
}
interface PreviewResult {
  filename: string
  mapping: Record<string, string | null>
  total: number; collectedCount: number; skippedCount: number
  sample: PreviewSampleRow[]
}
interface ImportResult {
  importedCount: number; updatedCount: number; skippedCount: number
  rawRowCount: number; errors: string[]
}

export function KickstarterImport() {
  const { user } = useAdminAuth()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewResult | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  const reset = () => { setPreview(null); setResult(null) }

  const onPick = (f: File | null) => {
    setFile(f)
    reset()
    if (f) void runPreview(f)
  }

  async function runPreview(f: File) {
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("file", f)
      const res = await fetch("/api/admin/kickstarter/preview", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Preview failed")
      setPreview(data)
    } catch (e) {
      toast({ title: "Could not read file", description: e instanceof Error ? e.message : String(e), variant: "destructive" })
      setFile(null)
    } finally {
      setLoading(false)
    }
  }

  async function runImport() {
    if (!file) return
    setImporting(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      if (user?.id) fd.append("createdBy", user.id)
      const res = await fetch("/api/admin/kickstarter/import", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Import failed")
      setResult(data)
      toast({ title: "Import complete", description: `${data.importedCount} new, ${data.updatedCount} updated, ${data.skippedCount} skipped` })
    } catch (e) {
      toast({ title: "Import failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" })
    } finally {
      setImporting(false)
    }
  }

  const missingRequired = preview
    ? REQUIRED_FIELDS.filter((f) => !preview.mapping[f])
    : []

  return (
    <div className="space-y-6">
      {/* Upload card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" /> Backer Report (CSV)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent/40 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files?.[0] ?? null) }}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">{file ? file.name : "Drop your Kickstarter Backer Report here, or click to browse"}</p>
            <p className="text-xs text-muted-foreground mt-1">Accepts the standard KS backer export (.csv)</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
          </div>
          {loading && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Reading file…
            </p>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      {preview && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Column mapping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {missingRequired.length > 0 ? (
                <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-500">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    Couldn’t auto-match: {missingRequired.map((f) => FIELD_LABELS[f] ?? f).join(", ")}.
                    The import will still run but those values will be blank — check your file’s headers.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
                  <CheckCircle2 className="h-4 w-4" /> All key columns matched.
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                {Object.entries(preview.mapping).map(([field, col]) => (
                  <div key={field} className="flex justify-between gap-2 border-b border-border/50 py-1">
                    <span className="text-muted-foreground">{FIELD_LABELS[field] ?? field}</span>
                    <span className={col ? "font-medium" : "text-muted-foreground italic"}>{col ?? "—"}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Preview</span>
                <span className="flex gap-2 text-sm font-normal">
                  <Badge variant="secondary">{preview.total} rows</Badge>
                  <Badge className="bg-green-600 hover:bg-green-600">{preview.collectedCount} collected</Badge>
                  {preview.skippedCount > 0 && (
                    <Badge variant="destructive">{preview.skippedCount} not collected</Badge>
                  )}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Backer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Pledge</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.sample.map((r, i) => (
                      <TableRow key={i} className={r.collected ? "" : "opacity-50"}>
                        <TableCell className="font-medium">{r.name || r.backerUid || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{r.email || "—"}</TableCell>
                        <TableCell>{r.reward || "—"}</TableCell>
                        <TableCell className="text-center">{r.quantity}</TableCell>
                        <TableCell className="text-right">{r.pledgeAmount != null ? `${r.pledgeAmount} ${r.currency ?? ""}`.trim() : "—"}</TableCell>
                        <TableCell>{r.shippingCountry || "—"}</TableCell>
                        <TableCell className="text-center">
                          {r.collected
                            ? <Badge className="bg-green-600 hover:bg-green-600">collected</Badge>
                            : <Badge variant="destructive">skipped</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {preview.total > preview.sample.length && (
                <p className="text-xs text-muted-foreground">Showing first {preview.sample.length} of {preview.total} rows.</p>
              )}
              <div className="flex items-center gap-3">
                <Button onClick={runImport} disabled={importing}>
                  {importing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Import {preview.collectedCount} orders
                </Button>
                <span className="text-xs text-muted-foreground">
                  Re-running with the final report is safe — existing orders are updated, not duplicated.
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Result */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" /> Import complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge className="bg-green-600 hover:bg-green-600">{result.importedCount} new orders</Badge>
              <Badge variant="secondary">{result.updatedCount} updated</Badge>
              <Badge variant="outline">{result.skippedCount} skipped</Badge>
              <Badge variant="outline">{result.rawRowCount} rows processed</Badge>
            </div>
            {result.errors.length > 0 && (
              <div className="text-sm text-amber-600 dark:text-amber-500 space-y-1">
                <p className="font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {result.errors.length} warning(s):</p>
                <ul className="list-disc pl-6 space-y-0.5">
                  {result.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
