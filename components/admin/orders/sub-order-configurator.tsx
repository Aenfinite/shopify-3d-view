"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  colorsFor, hasConfigurableOptions, EMBROIDERY_MAX_CHARS,
  CHINO_FRONT, CHINO_BACK_POCKETS, SAFE_POCKET_POSITIONS,
  SHIRT_COLLAR, SHIRT_FRONT, SHIRT_BACK, SHIRT_SLEEVE,
  EMBROIDERY_FONTS, EMBROIDERY_COLORS, type Option,
} from "@/lib/safe-chino/catalog"

export interface ConfiguratorResult {
  articleCodeHuman?: string | null
  articleCodeBarcode?: string | null
}

type Sel = Record<string, string | number>

export function SubOrderConfigurator({
  subOrderId,
  itemType,
  open,
  onOpenChange,
  onSaved,
  canEdit = true,
}: {
  subOrderId: string
  itemType: string
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: (result: ConfiguratorResult) => void
  canEdit?: boolean
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [color, setColor] = useState<string>("")
  const [sel, setSel] = useState<Sel>({})
  const [notes, setNotes] = useState("")
  const [allowedColors, setAllowedColors] = useState<string[]>([])
  const [constraints, setConstraints] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`/api/admin/sub-orders/${subOrderId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        setColor(d.color ?? "")
        setSel((d.configurator_selections ?? {}) as Sel)
        setNotes(d.notes ?? "")
        setAllowedColors(d.allowed_colors ?? [])
        setConstraints(d.item_constraints ?? {})
        setErrors([])
      })
      .finally(() => setLoading(false))
  }, [open, subOrderId])

  const set = (k: string, v: string | number) => setSel((s) => ({ ...s, [k]: v }))

  const palette = colorsFor(itemType).filter((c) => !allowedColors.length || allowedColors.includes(c.value))
  const lockedSleeve = constraints.sleeve as string | undefined

  const submit = async (confirm: boolean) => {
    setSaving(true)
    setErrors([])
    try {
      const res = await fetch(`/api/admin/sub-orders/${subOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configuration: { selections: sel, color, notes, confirm } }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 422) { setErrors(data.errors ?? ["Not allowed by this package."]); return }
      if (!res.ok) throw new Error(data.error || "Save failed")
      toast({ title: confirm ? "Item confirmed" : "Configuration saved" })
      onSaved({ articleCodeHuman: data.articleCodeHuman, articleCodeBarcode: data.articleCodeBarcode })
      onOpenChange(false)
    } catch (e) {
      toast({ title: "Could not save", description: e instanceof Error ? e.message : String(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const SelectRow = ({ label, k, opts, disabled }: { label: string; k: string; opts: Option[]; disabled?: boolean }) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={String(sel[k] ?? "")} onValueChange={(v) => set(k, v)} disabled={!canEdit || disabled}>
        <SelectTrigger><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
        <SelectContent>{opts.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">Configure {itemType}</DialogTitle>
          <DialogDescription>Choices are validated against the package rules; the article code is resolved from the SKU.</DialogDescription>
        </DialogHeader>

        {errors.length > 0 && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive space-y-1">
            <div className="flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" /> Not allowed</div>
            <ul className="list-disc list-inside">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Colour swatches */}
            <div className="space-y-1.5">
              <Label>Colour</Label>
              <div className="flex flex-wrap gap-2">
                {palette.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => setColor(c.value)}
                    title={c.label}
                    className={cn(
                      "h-9 w-9 rounded-full border-2 transition",
                      color === c.value ? "border-primary ring-2 ring-primary/30" : "border-border",
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              {color && <p className="text-xs text-muted-foreground">{palette.find((c) => c.value === color)?.label ?? color}</p>}
            </div>

            {itemType === "chino" && (
              <>
                <SelectRow label="Front" k="front" opts={CHINO_FRONT} />
                <SelectRow label="Back pockets" k="backPockets" opts={CHINO_BACK_POCKETS} />
                <SelectRow label="SAFE pocket" k="safePocketPosition" opts={SAFE_POCKET_POSITIONS} />
                {sel.safePocketPosition && (
                  <div className="grid grid-cols-3 gap-2">
                    {([["safePocketH", "H (cm)"], ["safePocketW", "W (cm)"], ["safePocketT", "Thickness (cm)"]] as const).map(([k, lbl]) => (
                      <div key={k} className="space-y-1.5">
                        <Label className="text-xs">{lbl}</Label>
                        <Input type="number" step="0.1" disabled={!canEdit} value={String(sel[k] ?? "")} onChange={(e) => set(k, e.target.value)} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {itemType === "shirt" && (
              <>
                <SelectRow label="Collar" k="collar" opts={SHIRT_COLLAR} />
                <SelectRow label="Front" k="front" opts={SHIRT_FRONT} />
                <SelectRow label="Back" k="back" opts={SHIRT_BACK} />
                <SelectRow label="Chest pocket" k="chestPocket" opts={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                <SelectRow label={lockedSleeve ? `Sleeve (package: ${lockedSleeve})` : "Sleeve"} k="sleeve" opts={SHIRT_SLEEVE} disabled={!!lockedSleeve} />
              </>
            )}

            {/* Embroidery (chino + shirt) */}
            {hasConfigurableOptions(itemType) && (
              <div className="rounded-md border border-border p-3 space-y-3">
                <p className="text-sm font-medium">Embroidery</p>
                <div className="space-y-1.5">
                  <Label className="text-xs">Initials (max {EMBROIDERY_MAX_CHARS})</Label>
                  <Input
                    maxLength={EMBROIDERY_MAX_CHARS} disabled={!canEdit}
                    value={String(sel.embroideryInitials ?? "")}
                    onChange={(e) => set("embroideryInitials", e.target.value.toUpperCase())}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <SelectRow label="Font" k="embroideryFont" opts={EMBROIDERY_FONTS} />
                  <SelectRow label="Thread colour" k="embroideryColor" opts={EMBROIDERY_COLORS} />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} disabled={!canEdit} />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="secondary" onClick={() => submit(false)} disabled={saving || !canEdit || loading}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save draft
          </Button>
          <Button onClick={() => submit(true)} disabled={saving || !canEdit || loading}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Confirm item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
