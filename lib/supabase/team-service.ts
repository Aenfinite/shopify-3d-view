// ============================================================================
// SERVER-ONLY — Admin team & role management.
// ----------------------------------------------------------------------------
// Lists admin_users, creates new admins/operators (provisions a Supabase auth
// user + admin_users row), changes roles, and removes access. Service-role only.
// ============================================================================

import { getSupabaseAdmin } from "./admin-client"
import { normalizeRole, type AdminRole } from "../admin/roles"

export interface TeamMember {
  id: string
  email: string
  name: string
  role: AdminRole
  created_at: string
}

export async function listTeam(): Promise<TeamMember[]> {
  const db = getSupabaseAdmin()
  const { data } = await db
    .from("admin_users")
    .select("id, email, name, role, created_at")
    .order("created_at")
  return (data ?? []).map((u) => ({ ...u, role: normalizeRole(u.role) })) as TeamMember[]
}

export interface CreateMemberInput {
  email: string
  password: string
  name?: string
  role: AdminRole
}

export async function createMember(input: CreateMemberInput): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabaseAdmin()

  // 1) Provision the auth user (email pre-confirmed so they can sign in immediately).
  const { data: authData, error: authErr } = await db.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  })
  if (authErr || !authData?.user) return { ok: false, error: authErr?.message ?? "Could not create auth user" }

  // 2) Link the admin_users profile row.
  const { error: rowErr } = await db.from("admin_users").insert({
    auth_user_id: authData.user.id,
    email: input.email,
    name: input.name ?? "",
    role: normalizeRole(input.role),
  })
  if (rowErr) {
    // Roll back the orphaned auth user so a retry isn't blocked by a dupe email.
    await db.auth.admin.deleteUser(authData.user.id).catch(() => {})
    return { ok: false, error: rowErr.message }
  }
  return { ok: true }
}

export async function updateMemberRole(id: string, role: AdminRole): Promise<boolean> {
  const { error } = await getSupabaseAdmin().from("admin_users").update({ role: normalizeRole(role) }).eq("id", id)
  return !error
}

/** Remove a member's admin access (deletes the profile row + the auth user). */
export async function removeMember(id: string): Promise<boolean> {
  const db = getSupabaseAdmin()
  const { data: row } = await db.from("admin_users").select("auth_user_id").eq("id", id).single()
  const { error } = await db.from("admin_users").delete().eq("id", id)
  if (error) return false
  if (row?.auth_user_id) await db.auth.admin.deleteUser(row.auth_user_id).catch(() => {})
  return true
}
