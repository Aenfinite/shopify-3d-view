import { MediaLibrary } from "@/components/admin/media/media-library"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">Manage all your images, 3D models, and other media files</p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </div>
      <MediaLibrary />
    </div>
  )
}
