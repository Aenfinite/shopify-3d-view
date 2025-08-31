"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Ruler, ShoppingBag } from "lucide-react"
import type { ConfiguratorMode } from "./configurator-layout"

interface ModeSelectorProps {
  onModeSelect: (mode: ConfiguratorMode) => void
}

export function ModeSelector({ onModeSelect }: ModeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full text-center mb-12"
      >
        <h1 className="text-4xl font-bold tracking-tight mb-4">Custom Garment Configurator</h1>
        <p className="text-muted-foreground text-lg">Choose your customization experience below</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onModeSelect("MTM")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Made-to-Measure
              </CardTitle>
              <CardDescription>Full customization with precise measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Custom measurements for perfect fit</li>
                <li>Complete style customization</li>
                <li>Premium fabric selection</li>
                <li>Personalized details</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => onModeSelect("MTM")}>
                Start MTM Experience
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onModeSelect("MTO")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Made-to-Order
              </CardTitle>
              <CardDescription>Standard sizes with curated customization options</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Standard sizing (XS, S, M, L, XL)</li>
                <li>Selected style customization</li>
                <li>Curated fabric options</li>
                <li>Faster production time</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => onModeSelect("MTO")}>
                Start MTO Experience
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
