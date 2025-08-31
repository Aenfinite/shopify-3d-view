"use client"

import { useState, useEffect } from "react"
import { getModels, type Model3D } from "@/lib/firebase/model-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function ModelList() {
  const [models, setModels] = useState<Model3D[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchModels() {
      try {
        const fetchedModels = await getModels()
        setModels(fetchedModels)
      } catch (err) {
        console.error("Error fetching models:", err)
        setError("Failed to load 3D models. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg" />
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-gray-200 rounded w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>{error}</p>
        <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-3">
            <div className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No 3D Models Found</h3>
          <p className="text-muted-foreground max-w-md">
            You haven't added any 3D models yet. Add your first model to start creating customizable products.
          </p>
          <Button asChild>
            <Link href="/admin/models/new">
              <Plus className="mr-2 h-4 w-4" /> Add Your First Model
            </Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {models.map((model) => (
        <Card key={model.id} className="overflow-hidden">
          <div className="relative h-48 w-full">
            <Image
              src={model.thumbnailUrl || "/placeholder.svg?height=300&width=400"}
              alt={model.name}
              fill
              className="object-cover"
            />
            <Badge className="absolute top-2 right-2 capitalize">{model.category}</Badge>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{model.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/models/€{model.id}`}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/models/€{model.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/models/€{model.id}/customization`}>
                      <Edit className="mr-2 h-4 w-4" /> Customization Options
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground line-clamp-2">{model.description}</p>
            <p className="mt-2 font-semibold">€{model.basePrice.toFixed(2)}</p>
            <div className="mt-2">
              <Badge variant="outline" className="mr-2">
                {model.customizationOptions?.length || 0} Options
              </Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/admin/models/€{model.id}`}>Manage Model</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
