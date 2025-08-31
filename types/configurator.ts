// Fabric option type
export interface FabricOption {
  id: string
  name: string
  description: string
  category: string
  color: string
  pricePerUnit: number
  thumbnailUrl?: string
  textureUrl?: string
}

// Style option type
export interface StyleOption {
  id: string
  name: string
  description: string
  category: string
  priceDelta: number
  imageUrl?: string
}

// Size option type
export interface SizeOption {
  id: string
  name: string
  measurements: {
    chest: number
    waist: number
    shoulder: number
    sleeve: number
    [key: string]: number
  }
}

// Measurement set type
export interface MeasurementSet {
  [key: string]: number
}

// Price calculation input type
export interface PriceCalculationInput {
  mode: "MTM" | "MTO"
  fabric: FabricOption | null
  styles: Record<string, StyleOption>
  measurements?: MeasurementSet | null
}
