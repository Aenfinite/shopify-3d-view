"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useConfigurator } from "@/context/configurator-context"
import type { FabricOption } from "@/types/configurator"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export function FabricSelector() {
  const { selectedFabric, setSelectedFabric, fabrics, loading } = useConfigurator()
  const [searchQuery, setSearchQuery] = useState("")

  // Filter fabrics based on search query
  const filteredFabrics = fabrics.filter(
    (fabric) =>
      fabric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fabric.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Group fabrics by category
  const fabricCategories = {
    cotton: filteredFabrics.filter((f) => f.category === "cotton"),
    wool: filteredFabrics.filter((f) => f.category === "wool"),
    linen: filteredFabrics.filter((f) => f.category === "linen"),
    blend: filteredFabrics.filter((f) => f.category === "blend"),
  }

  if (loading) {
    return <FabricSelectorSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search fabrics..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="cotton">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="cotton">Cotton</TabsTrigger>
          <TabsTrigger value="wool">Wool</TabsTrigger>
          <TabsTrigger value="linen">Linen</TabsTrigger>
          <TabsTrigger value="blend">Blend</TabsTrigger>
        </TabsList>

        {Object.entries(fabricCategories).map(([category, fabrics]) => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {fabrics.map((fabric) => (
                <FabricCard
                  key={fabric.id}
                  fabric={fabric}
                  isSelected={selectedFabric?.id === fabric.id}
                  onSelect={() => setSelectedFabric(fabric)}
                />
              ))}
            </div>

            {fabrics.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No fabrics found in this category.</div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function FabricSelectorSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-3 mt-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    </div>
  )
}

interface FabricCardProps {
  fabric: FabricOption
  isSelected: boolean
  onSelect: () => void
}

function FabricCard({ fabric, isSelected, onSelect }: FabricCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`
        relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
        €{isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"}
      `}
    >
      <div
        className="h-24 bg-cover bg-center"
        style={{
          backgroundColor: fabric.color,
          backgroundImage: fabric.thumbnailUrl ? `url(€{fabric.thumbnailUrl})` : undefined,
        }}
      />
      <div className="p-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{fabric.name}</h3>
          <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: fabric.color }} />
        </div>
        <p className="text-xs text-muted-foreground truncate">{fabric.description}</p>
        <div className="mt-1 text-xs font-medium">€{fabric.pricePerUnit.toFixed(2)}</div>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
          ✓
        </div>
      )}
    </motion.div>
  )
}
