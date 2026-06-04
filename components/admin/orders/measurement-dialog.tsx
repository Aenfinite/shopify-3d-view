"use client"

import { useEffect, useState } from "react"
import { Loader2, History, AlertTriangle, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAdminAuth } from "@/context/admin-auth-context"
import { getMeasurementFields, defaultAllowances, validateMeasurements, withAllowances } from "@/lib/measurements/fields"

interface Version {
  id: string
  version: number
  raw_values: Record<string, number>
  allowances: Record<string, number>
  production_values: Record<string, number>
  unit: string
  locked: boolean
  locked_at: string | null
  created_at: string
}

export function MeasurementDialog({
  subOrderId,
  garmentType,
  open,
  onOpenChange,
  onSaved,
  canEdit = true,
}: {
  subOrderId: string
  garmentType: string
  open: boolean
  onOpenChange: (o: boolean) => void
  onSaved: () => void
  canEdit?: boolean
}) {
  const { toast } = useToast()
  const { can } = useAdminAuth()
  const canManageLocks = can("settings:manage") // admins unlock; operators can lock their own entry
  const fields = getMeasurementFields(garmentType)

  const [values, setValues] = useState<Record<string, string>>({})
  const [allowances, setAllowances] = useState<Record<string, number>>({})
  const [versions, setVersions] = useState<Version[]>([])
  const [activeLock, setActiveLock] = useState<Version | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const reload = () => {
    setLoading(true)
    return fetch(`/api/admin/sub-orders/${subOrderId}/measurements`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        const vs: Version[] = data.versions ?? []
        setVersions(vs)
        const current = vs.find((v) => v.id === data.currentMeasurementId) ?? vs[0]
        if (current) loadVersion(current)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!open) return
    setValues({})
    setAllowances(defaultAllowances(garmentType))
    setActiveLock(null)
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, subOrderId])

  const loadVersion = (v: Version) => {
    setValues(Object.fromEntries(Object.entries(v.raw_values).map(([k, val]) => [k, String(val)])))
    setAllowances({ ...defaultAllowances(garmentType), ...v.allowances })
    setActiveLock(v.locked ? v : null)
  }

  const numericValues = (): Record<string, number> =>
    Object.fromEntries(Object.entries(values).filter(([, v]) => v !== "" && !Number.isNaN(Number(v))).map(([k, v]) => [k, Number(v)]))

  const issues = validateMeasurements(garmentType, numericValues())
  const preview = withAllowances(numericValues(), allowances)

  const save = async () => {
    const raw = numericValues()
    if (Object.keys(raw).length === 0) { toast({ title: "Enter at least one measurement", variant: "destructive" }); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/sub-orders/${subOrderId}/measurements`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawValues: raw, unit: "cm", allowances }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Save failed")
      toast({ title: "Measurements saved", description: "New version linked to this item." })
      await reload()
      onSaved()
    } catch (e) {
      toast({ title: "Could not save", description: e instanceof Error ? e.message : String(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const setLock = async (versionId: string, action: "lock" | "unlock") => {
    const res = await fetch(`/api/admin/measurements/${versionId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }),
    })
    if (!res.ok) { toast({ title: `${action} failed`, variant: "destructive" }); return }
    toast({ title: action === "lock" ? "Version locked" : "Version unlocked" })
    await reload()
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">{garmentType} measurements</DialogTitle>
          <DialogDescription>
            Body values in cm. Production = body + allowance. Lock a version to freeze it for production; unlocking requires admin.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="p-8 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="space-y-4 py-2">
            {versions.length > 0 && (
              <div className="rounded-md border border-border p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium"><History className="h-4 w-4" /> Versions</div>
                <div className="space-y-1.5">
                  {versions.map((v) => (
                    <div key={v.id} className="flex items-center justify-between gap-2 text-sm">
                      <button className="hover:underline text-left" onClick={() => loadVersion(v)}>
                        v{v.version} · {new Date(v.created_at).toLocaleDateString()}
                        {v.locked && <Badge className="ml-2 bg-green-700 hover:bg-green-700"><Lock className="h-3 w-3 mr-1" />locked</Badge>}
                      </button>
                      {v.locked
                        ? canManageLocks && <Button variant="ghost" size="sm" onClick={() => setLock(v.id, "unlock")}><Unlock className="h-3.5 w-3.5 mr-1" />Unlock</Button>
                        : canEdit && <Button variant="ghost" size="sm" onClick={() => setLock(v.id, "lock")}><Lock className="h-3.5 w-3.5 mr-1" />Lock</Button>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeLock && (
              <div className="flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">
                <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Viewing locked v{activeLock.version} (frozen {activeLock.locked_at ? new Date(activeLock.locked_at).toLocaleString() : ""}). Saving creates a new editable version; the locked one stays frozen.</span>
              </div>
            )}

            <div className="grid grid-cols-[1fr_6rem_6rem_6rem] gap-2 items-center text-xs font-medium text-muted-foreground px-1">
              <span>Measurement</span><span>Body (cm)</span><span>Ease (cm)</span><span>Production</span>
            </div>
            {fields.map((f) => {
              const hasIssue = issues.some((i) => i.key === f.key)
              return (
                <div key={f.key} className="grid grid-cols-[1fr_6rem_6rem_6rem] gap-2 items-center">
                  <Label className="text-sm">
                    {f.label}
                    {f.hint && <span className="block text-xs text-muted-foreground font-normal">{f.hint}</span>}
                  </Label>
                  <Input type="number" inputMode="decimal" step="0.1" disabled={!canEdit}
                    className={hasIssue ? "border-amber-500" : ""}
                    value={values[f.key] ?? ""} onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))} />
                  <Input type="number" inputMode="decimal" step="0.1" disabled={!canEdit}
                    value={allowances[f.key] ?? 0} onChange={(e) => setAllowances((s) => ({ ...s, [f.key]: Number(e.target.value) }))} />
                  <span className="text-sm tabular-nums text-muted-foreground">{preview[f.key] ?? "—"}</span>
                </div>
              )
            })}

            {issues.length > 0 && (
              <div className="flex items-start gap-2 text-xs text-amber-600">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{issues.map((i) => `${i.label}: ${i.message}`).join(" · ")} (saved anyway — double-check before locking).</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={save} disabled={saving || !canEdit}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save new version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
