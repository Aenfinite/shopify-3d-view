"use client"

import { motion } from "framer-motion"
import { useConfigurator } from "@/context/configurator-context"
import type { SizeOption } from "@/types/configurator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Ruler } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Default size options
const sizeOptions: SizeOption[] = [
  { id: "xs", name: "XS", measurements: { chest: 36, waist: 30, shoulder: 16, sleeve: 32 } },
  { id: "s", name: "S", measurements: { chest: 38, waist: 32, shoulder: 17, sleeve: 33 } },
  { id: "m", name: "M", measurements: { chest: 40, waist: 34, shoulder: 18, sleeve: 34 } },
  { id: "l", name: "L", measurements: { chest: 42, waist: 36, shoulder: 19, sleeve: 35 } },
  { id: "xl", name: "XL", measurements: { chest: 44, waist: 38, shoulder: 20, sleeve: 36 } },
  { id: "xxl", name: "XXL", measurements: { chest: 46, waist: 40, shoulder: 21, sleeve: 37 } },
]

// Size fit types
const fitTypes = [
  { id: "slim", name: "Slim Fit", description: "Tailored close to the body for a modern look" },
  { id: "regular", name: "Regular Fit", description: "Classic fit with room for movement" },
  { id: "relaxed", name: "Relaxed Fit", description: "Generous cut for maximum comfort" },
]

export function SizeSelector() {
  const { selectedSize, setSelectedSize } = useConfigurator()

  return (
    <div className="space-y-6">
      <Tabs defaultValue="standard">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard">Standard Sizes</TabsTrigger>
          <TabsTrigger value="fit">Fit Type</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4 pt-4">
          <RadioGroup
            value={selectedSize?.id}
            onValueChange={(value) => {
              const size = sizeOptions.find((s) => s.id === value)
              if (size) setSelectedSize(size)
            }}
          >
            <div className="grid grid-cols-3 gap-2">
              {sizeOptions.map((size) => (
                <div key={size.id}>
                  <RadioGroupItem value={size.id} id={`size-€{size.id}`} className="peer sr-only" />
                  <Label
                    htmlFor={`size-€{size.id}`}
                    className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <span className="text-xl font-semibold">{size.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {selectedSize && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    Size Details
                  </CardTitle>
                  <CardDescription className="text-xs">Measurements for size {selectedSize.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chest:</span>
                      <span>{selectedSize.measurements.chest}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Waist:</span>
                      <span>{selectedSize.measurements.waist}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shoulder:</span>
                      <span>{selectedSize.measurements.shoulder}"</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sleeve:</span>
                      <span>{selectedSize.measurements.sleeve}"</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="fit" className="space-y-4 pt-4">
          <RadioGroup>
            <div className="space-y-2">
              {fitTypes.map((fit) => (
                <div key={fit.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={fit.id} id={`fit-€{fit.id}`} />
                  <Label htmlFor={`fit-€{fit.id}`} className="flex flex-col">
                    <span>{fit.name}</span>
                    <span className="text-xs text-muted-foreground">{fit.description}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </TabsContent>
      </Tabs>
    </div>
  )
}
