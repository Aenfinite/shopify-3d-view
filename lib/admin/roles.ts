// ============================================================================
// Admin role model — two levels: 'admin' and 'operator'.
// ----------------------------------------------------------------------------
// admin    : full control — manage packages, fabrics, article-code map, settings,
//            imports, plus everything an operator can do.
// operator : day-to-day production — view orders, configure sub-orders, enter
//            measurements, change statuses, run exports. No structural/config or
//            destructive management.
//
// Used for UI gating today (hide actions an operator can't take). The same
// `can()` predicate is the single source of truth a server guard can reuse.
// ============================================================================

export type AdminRole = "admin" | "operator"

export type Permission =
  | "orders:view"
  | "orders:status"
  | "orders:configure"      // edit sub-order selections
  | "measurements:edit"
  | "export:run"
  | "articleCodes:generate"
  | "packages:manage"
  | "fabrics:manage"
  | "articleCodes:manage"   // edit the lookup map
  | "imports:run"
  | "settings:manage"

const OPERATOR_PERMISSIONS: Permission[] = [
  "orders:view",
  "orders:status",
  "orders:configure",
  "measurements:edit",
  "export:run",
  "articleCodes:generate",
]

const ADMIN_PERMISSIONS: Permission[] = [
  ...OPERATOR_PERMISSIONS,
  "packages:manage",
  "fabrics:manage",
  "articleCodes:manage",
  "imports:run",
  "settings:manage",
]

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  admin: ADMIN_PERMISSIONS,
  operator: OPERATOR_PERMISSIONS,
}

export function normalizeRole(role: string | null | undefined): AdminRole {
  return role === "operator" ? "operator" : "admin"
}

/** Does `role` grant `permission`? Unknown roles default to admin (back-compat). */
export function can(role: string | null | undefined, permission: Permission): boolean {
  return ROLE_PERMISSIONS[normalizeRole(role)].includes(permission)
}

export const ROLE_LABEL: Record<AdminRole, string> = {
  admin: "Administrator",
  operator: "Operator",
}
