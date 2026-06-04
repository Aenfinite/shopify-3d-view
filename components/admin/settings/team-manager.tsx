"use client"

import { useEffect, useState } from "react"
import { Plus, Loader2, Users, Trash } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAdminAuth } from "@/context/admin-auth-context"
import { ROLE_LABEL, type AdminRole } from "@/lib/admin/roles"

interface Member {
  id: string
  email: string
  name: string
  role: AdminRole
  created_at: string
}

export function TeamManager() {
  const { toast } = useToast()
  const { can, user } = useAdminAuth()
  const canManage = can("settings:manage")

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ email: "", name: "", password: "", role: "operator" as AdminRole })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/team")
      const data = await res.json()
      setMembers(Array.isArray(data) ? data : [])
    } catch {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { if (canManage) void load() }, [canManage])

  const create = async () => {
    if (!form.email.trim() || form.password.length < 8) {
      toast({ title: "Email and an 8+ character password are required", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Create failed")
      toast({ title: "Team member created" })
      setForm({ email: "", name: "", password: "", role: "operator" })
      setDialogOpen(false)
      void load()
    } catch (e) {
      toast({ title: "Could not create", description: e instanceof Error ? e.message : String(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const changeRole = async (id: string, role: AdminRole) => {
    const prev = members
    setMembers((m) => m.map((x) => (x.id === id ? { ...x, role } : x)))
    const res = await fetch(`/api/admin/team/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }),
    })
    if (!res.ok) { setMembers(prev); toast({ title: "Role update failed", variant: "destructive" }) }
  }

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" })
    if (res.ok) { setMembers((m) => m.filter((x) => x.id !== id)); toast({ title: "Access revoked" }) }
    else toast({ title: "Could not revoke", variant: "destructive" })
  }

  if (!canManage) return null

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Team &amp; Roles</CardTitle>
          <CardDescription>Two access levels: administrators manage everything; operators handle day-to-day production.</CardDescription>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add member</Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No team members loaded.</p>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3">
                <div className="text-sm">
                  <p className="font-medium">{m.name || m.email}</p>
                  <p className="text-muted-foreground text-xs">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={m.role} onValueChange={(v) => changeRole(m.id, v as AdminRole)} disabled={m.email === user?.email}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{ROLE_LABEL.admin}</SelectItem>
                      <SelectItem value="operator">{ROLE_LABEL.operator}</SelectItem>
                    </SelectContent>
                  </Select>
                  {m.email !== user?.email && (
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(m.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add team member</DialogTitle>
            <DialogDescription>Creates a sign-in account immediately. Share the password securely.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Temporary password *</Label><Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="min 8 characters" /></div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AdminRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">{ROLE_LABEL.operator} — production only</SelectItem>
                  <SelectItem value="admin">{ROLE_LABEL.admin} — full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={create} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
