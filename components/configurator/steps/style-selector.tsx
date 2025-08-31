"use client"
import { motion } from "framer-motion"
import { useConfigurator } from "@/context/configurator-context"
import type { StyleOption } from "@/types/configurator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

export function StyleSelector() {
  const { selectedStyles, setStyleOption, styleOptions, loading } = useConfigurator()

  // Style categories
  const categories = [
    { id: "collar", name: "Collar" },
    { id: "cuff", name: "Cuff" },
    { id: "placket", name: "Placket" },
    { id: "pocket", name: "Pocket" },
    { id: "back", name: "Back" },
    { id: "monogram", name: "Monogram" },
  ]

  if (loading) {
    return <StyleSelectorSkeleton />
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="collar">
        <TabsList className="flex overflow-x-auto hide-scrollbar">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex-shrink-0">
              {category.name}
              {selectedStyles[category.id] && (
                <Badge variant="secondary" className="ml-1.5 h-4 w-4 p-0 flex items-center justify-center">
                  ✓
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-4">
            <StyleCategorySelector
              category={category.id}
              options={styleOptions[category.id] || []}
              selectedOption={selectedStyles[category.id]}
              onSelect={(option) => setStyleOption(category.id, option)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function StyleSelectorSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-3 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
}

interface StyleCategorySelectorProps {
  category: string
  options: StyleOption[]
  selectedOption: StyleOption | undefined
  onSelect: (option: StyleOption) => void
}

function StyleCategorySelector({ category, options, selectedOption, onSelect }: StyleCategorySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <StyleOptionCard
          key={option.id}
          option={option}
          isSelected={selectedOption?.id === option.id}
          onSelect={() => onSelect(option)}
        />
      ))}

      {options.length === 0 && (
        <div className="col-span-2 text-center py-8 text-muted-foreground">No options available for this category.</div>
      )}
    </div>
  )
}

interface StyleOptionCardProps {
  option: StyleOption
  isSelected: boolean
  onSelect: () => void
}

function StyleOptionCard({ option, isSelected, onSelect }: StyleOptionCardProps) {
  return (
    <TooltipProvider>
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
            backgroundImage: `url(€{option.imageUrl || "/placeholder.svg?height=100&width=200"})`,
          }}
        />
        <div className="p-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{option.name}</h3>

            {option.priceDelta !== 0 && (
              <Badge variant={option.priceDelta > 0 ? "outline" : "secondary"}>
                {option.priceDelta > 0 ? `+€${option.priceDelta.toFixed(2)}` : "Included"}
              </Badge>
            )}
          </div>

          <div className="flex items-center mt-1">
            <p className="text-xs text-muted-foreground truncate mr-1">{option.description}</p>

            {option.description && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{option.description}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
            ✓
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  )
}
