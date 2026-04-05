import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin-client"

export const dynamic = "force-dynamic"

// POST /api/admin/fabrics/upload
// Body: multipart/form-data  { file: File, productId: string }
export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get("file") as File | null
  const productId = form.get("productId") as string | null

  if (!file || !productId) {
    return NextResponse.json({ error: "Missing file or productId" }, { status: 400 })
  }

  const ext = file.name.split(".").pop() ?? "jpg"
  const fileName = `${productId}/${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage
    .from("fabrics")
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabaseAdmin.storage.from("fabrics").getPublicUrl(fileName)
  return NextResponse.json({ url: data.publicUrl })
}
