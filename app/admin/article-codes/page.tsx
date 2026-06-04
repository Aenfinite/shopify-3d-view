import { ArticleCodesManager } from "@/components/admin/article-codes/article-codes-manager"

export const dynamic = "force-dynamic"

export default function ArticleCodesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Article Codes</h1>
        <p className="text-muted-foreground mt-1">
          Each <strong>SKU</strong> (product + colour) carries an 8-segment article code — human (dot-joined) and
          machine (barcode) — assembled from the segment lookups below:
          target&nbsp;group · product&nbsp;category · fabric&nbsp;family · fabric&nbsp;type · supplier ·
          supplier&nbsp;article&nbsp;no · specs · reserved. Edit the lookups to add suppliers, specs or variants.
        </p>
      </div>
      <ArticleCodesManager />
    </div>
  )
}
