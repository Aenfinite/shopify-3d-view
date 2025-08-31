"use client"

import { useState } from "react"
import { ModeSelector } from "./mode-selector"
import { ConfiguratorSidebar } from "./configurator-sidebar"
import { ProductViewer } from "./product-viewer"
import { ConfiguratorProvider } from "@/context/configurator-context"

export type ConfiguratorMode = "MTM" | "MTO"

export function ConfiguratorLayout() {
  const [selectedMode, setSelectedMode] = useState<ConfiguratorMode | null>(null)

  // If no mode is selected yet, show the mode selector
  if (!selectedMode) {
    return <ModeSelector onModeSelect={setSelectedMode} />
  }

  return (
    <ConfiguratorProvider initialMode={selectedMode}>
      <div className="flex flex-col md:flex-row h-screen w-full">
        <ConfiguratorSidebar />
        <div className="flex-1 h-full relative">
          <ProductViewer />
        </div>
      </div>
    </ConfiguratorProvider>
  )
}
