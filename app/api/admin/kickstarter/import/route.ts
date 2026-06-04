import { NextRequest, NextResponse } from "next/server"
import { CsvSource, resolveColumnMapping } from "@/lib/kickstarter/csv-source"
import { importBackers } from "@/lib/supabase/kickstarter-service"

export const dynamic = "force-dynamic"

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

// POST /api/admin/kickstarter/import
// Body: multipart/form-data { file: File(.csv), createdBy?: string }
// Runs the idempotent import: creates/updates customers, orders and sub-orders.
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get("file") as File | null
  const createdBy = (form.get("createdBy") as string | null) || undefined
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })

  let text: string
  try {
    text = await file.text()
  } catch {
    return NextResponse.json({ error: "Could not read file" }, { status: 400 })
  }

  const source = new CsvSource(text)
  if (source.headers.length === 0) {
    return NextResponse.json({ error: "No rows found in CSV" }, { status: 400 })
  }

  try {
    const result = await importBackers(source, {
      filename: file.name,
      fileHash: await sha256Hex(text),
      createdBy,
      columnMapping: resolveColumnMapping(source.headers),
    })
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[api/admin/kickstarter/import] failed:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
