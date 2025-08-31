"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Grid,
  List,
  MoreHorizontal,
  Trash,
  Download,
  Copy,
  Edit,
  ImageIcon,
  FileText,
  FileIcon as File3d,
} from "lucide-react"

// Mock data for media files
const mockMediaFiles = [
  {
    id: "media-1",
    name: "fabric-cotton-white.jpg",
    type: "image",
    url: "/placeholder.svg?height=200&width=200",
    size: "245 KB",
    dimensions: "800x800",
    uploadedAt: "2023-05-10",
  },
  {
    id: "media-2",
    name: "shirt-model.glb",
    type: "3d",
    url: "/placeholder.svg?height=200&width=200",
    size: "2.4 MB",
    dimensions: "N/A",
    uploadedAt: "2023-05-09",
  },
  {
    id: "media-3",
    name: "measurement-guide.pdf",
    type: "document",
    url: "/placeholder.svg?height=200&width=200",
    size: "1.2 MB",
    dimensions: "N/A",
    uploadedAt: "2023-05-08",
  },
  {
    id: "media-4",
    name: "collar-cutaway.jpg",
    type: "image",
    url: "/placeholder.svg?height=200&width=200",
    size: "180 KB",
    dimensions: "600x400",
    uploadedAt: "2023-05-07",
  },
  {
    id: "media-5",
    name: "pants-model.glb",
    type: "3d",
    url: "/placeholder.svg?height=200&width=200",
    size: "3.1 MB",
    dimensions: "N/A",
    uploadedAt: "2023-05-06",
  },
  {
    id: "media-6",
    name: "fabric-wool-navy.jpg",
    type: "image",
    url: "/placeholder.svg?height=200&width=200",
    size: "210 KB",
    dimensions: "800x800",
    uploadedAt: "2023-05-05",
  },
]

export function MediaLibrary() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedType, setSelectedType] = useState<string>("all")

  // Filter media files based on search query and type
  const filteredMedia = mockMediaFiles.filter(
    (media) =>
      media.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedType === "all" || media.type === selectedType),
  )

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-6 w-6" />
      case "3d":
        return <File3d className="h-6 w-6" />
      case "document":
        return <FileText className="h-6 w-6" />
      default:
        return <File3d className="h-6 w-6" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search media files..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="image">Images</TabsTrigger>
          <TabsTrigger value="3d">3D Models</TabsTrigger>
          <TabsTrigger value="document">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="mt-4">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredMedia.map((media) => (
                <Card key={media.id} className="overflow-hidden">
                  <div className="relative group">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      {media.type === "image" ? (
                        <img
                          src={media.url || "/placeholder.svg"}
                          alt={media.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-muted">
                          {getFileIcon(media.type)}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-1">
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium truncate">{media.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {media.size} • {media.uploadedAt}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Size</th>
                    <th className="text-left p-2">Dimensions</th>
                    <th className="text-left p-2">Uploaded</th>
                    <th className="text-right p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedia.map((media) => (
                    <tr key={media.id} className="border-b">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getFileIcon(media.type)}
                          <span className="text-sm">{media.name}</span>
                        </div>
                      </td>
                      <td className="p-2 capitalize text-sm">{media.type}</td>
                      <td className="p-2 text-sm">{media.size}</td>
                      <td className="p-2 text-sm">{media.dimensions}</td>
                      <td className="p-2 text-sm">{media.uploadedAt}</td>
                      <td className="p-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy URL
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredMedia.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No files found</h3>
              <p className="text-muted-foreground">Try a different search term or upload new files.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
