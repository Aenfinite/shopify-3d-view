import { NextRequest, NextResponse } from "next/server"
import { CsvSource, resolveColumnMapping } from "@/lib/kickstarter/csv-source"

export const dynamic = "force-dynamic"

// POST /api/admin/kickstarter/preview
// Body: multipart/form-data { file: File(.csv) }
// Parses the CSV WITHOUT writing anything, so the admin can verify the column
// mapping and a sample of rows before committing the import.
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })

  let text: string
  try {
    text = await file.text()
  } catch {
    return NextResponse.json({ error: "Could not read file" }, { status: 400 })
  }

  const source = new CsvSource(text)
  const headers = source.headers
  if (headers.length === 0) {
    return NextResponse.json({ error: "No rows found in CSV" }, { status: 400 })
  }

  const mapping = resolveColumnMapping(headers)
  const backers = await source.fetchBackers()

  const collectedCount = backers.filter((b) => b.collected).length
  const sample = backers.slice(0, 8).map((b) => ({
    backerUid: b.backerUid,
    name: b.name,
    email: b.email,
    reward: b.pledgeTierLabel,
    quantity: b.quantity,
    collected: b.collected,
    pledgeAmount: b.pledgeAmount ?? null,
    currency: b.currency ?? null,
    shippingCountry: b.shippingAddress?.country ?? null,
  }))

  return NextResponse.json({
    filename: file.name,
    headers,
    mapping,
    total: backers.length,
    collectedCount,
    skippedCount: backers.length - collectedCount,
    sample,
  })
}
