// SERVER-ONLY — never import this in client components.
// Uses the service role key which bypasses RLS.
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

// Lazily initialised so the module doesn't throw during Next.js static build
// when env vars are not yet populated.
let _adminClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!_adminClient) {
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    }
    _adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })
  }
  return _adminClient
}

/** @deprecated use getSupabaseAdmin() instead */
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_t, prop) {
    return (getSupabaseAdmin() as any)[prop]
  },
})
