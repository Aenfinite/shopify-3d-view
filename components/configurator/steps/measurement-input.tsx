"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useConfigurator } from "@/context/configurator-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Info, Ruler, User } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Measurement fields with descriptions
const measurementFields = [
  {
    id: "chest",
    name: "Chest",
    description: "Measure around the fullest part of your chest, keeping the tape horizontal.",
    imageUrl: "/placeholder.svg?height=150&width=150",
  },
  {
    id: "waist",
    name: "Waist",
    description: "Measure around your natural waistline, keeping the tape comfortably loose.",
    imageUrl: "/placeholder.svg?height=150&width=150",
  },
  {
    id: "shoulder",
    name: "Shoulder Width",
    description: "Measure from the end of one shoulder to the other, across the back.",
    imageUrl: "/placeholder.svg?height=150&width=150",
  },
  {
    id: "sleeve",
    name: "Sleeve Length",
    description: "Measure from the shoulder seam to the end of the wrist.",
    imageUrl: "/placeholder.svg?height=150&width=150",
  },
  {
    id: "neck",
    name: "Neck",
    description: "Measure around the base of your neck, where a collar would sit.",
    imageUrl: "/placeholder.svg?height=150&width=150",
  },
  {
    id: "hip",
    name: "Hip",
    description: "Measure around the fullest part of your hips.",
    imageUrl: "/placeholder.svg?height=150&width=150",
  },
]

export function MeasurementInput() {
  const { measurements, setMeasurements } = useConfigurator()
  const [activeField, setActiveField] = useState<string | null>("chest")

  // Initialize measurements if not already set
  const currentMeasurements = measurements || {}

  const handleMeasurementChange = (field: string, value: string) => {
    const numValue = Number.parseFloat(value)
    if (!isNaN(numValue)) {
      setMeasurements({
        ...currentMeasurements,
        [field]: numValue,
      })
    } else if (value === "") {
      // Allow clearing the field
      const newMeasurements = { ...currentMeasurements }
      delete newMeasurements[field as keyof typeof newMeasurements]
      setMeasurements(newMeasurements)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="manual">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Input</TabsTrigger>
          <TabsTrigger value="profile">From Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {measurementFields.map((field) => (
              <div
                key={field.id}
                className={`
                  relative cursor-pointer rounded-lg border p-3 transition-all
                  €{activeField === field.id ? "border-primary ring-2 ring-primary/20" : "border-border"}
                `}
                onClick={() => setActiveField(field.id)}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor={`measurement-€{field.id}`} className="font-medium text-sm">
                    {field.name}
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="max-w-xs">{field.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="mt-2 flex items-center">
                  <Input
                    id={`measurement-€{field.id}`}
                    type="number"
                    placeholder="0.0"
                    value={currentMeasurements[field.id as keyof typeof currentMeasurements] || ""}
                    onChange={(e) => handleMeasurementChange(field.id, e.target.value)}
                    className="h-8"
                    step="0.25"
                    min="0"
                  />
                  <span className="ml-2 text-sm">in</span>
                </div>
              </div>
            ))}
          </div>

          {activeField && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    How to Measure
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {measurementFields.find((f) => f.id === activeField)?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <img
                    src={measurementFields.find((f) => f.id === activeField)?.imageUrl || "/placeholder.svg"}
                    alt={`How to measure €{activeField}`}
                    className="h-32 object-contain"
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="profile" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-1">
                <User className="h-4 w-4" />
                Saved Measurements
              </CardTitle>
              <CardDescription className="text-xs">Load measurements from your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  My Measurements
                </Button>
                <p className="text-xs text-muted-foreground">
                  You can save your measurements to your profile for future orders.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
