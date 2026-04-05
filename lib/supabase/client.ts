import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

// Lazily initialised so the module doesn't throw during Next.js static build
let _client: ReturnType<typeof createClient<Database>> | null = null

function getClient() {
  if (!_client) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
    }
    _client = createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return _client
}

export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_t, prop) {
    return (getClient() as any)[prop]
  },
})
