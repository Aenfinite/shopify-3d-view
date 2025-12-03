import { Object3D } from "three"

// Basic jacket customization type
export interface BasicJacketCustomization {
  frontStyle?: "2button" | "3button" | "6d2"
  fabricColor?: string
  buttonColor?: string
  threadColor?: string
  lapelColor?: string
  liningColor?: string
  liningMeshType?: string // "unlined", "custom-coloured" (half), or "quilted" (full)
  frontPocket?: string // e.g., "flap-pocket" or "patch-pocket"
  chestPocket?: string // e.g., "piping-pocket" or "patch-pocket-chest"
  sleeveButtons?: string // e.g., "4-buttons-with-holes" or "4-buttons-no-holes"
  ventStyle?: string // e.g., "one-back-vent" or "two-back-vent"
}

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

// Basic color customization interface
export interface BasicJacketCustomization {
  upperLapelColor?: string;
  lowerLapelColor?: string;
  mainFabricColor?: string;
  buttonColor?: string;
  threadColor?: string;
  frontStyle?: "2button" | "3button" | "6d2";
}

// Available front styles for jacket configuration
export type FrontStyle = '2button' | '3button' | '6d2';

// Standard jacket parts interface
export interface StandardJacketParts {
  frontBody: Object3D;
  backBody: Object3D;
  lapelUpper: Object3D;
  lapelLower: Object3D;
  sleeves: Object3D;
  buttons: Object3D;
  thread: Object3D;
}

// Jacket configuration interface
export interface JacketConfig {
  priority: {
    frontBottom: string;
    frontButtons: string;
    frontThread: string;
    lapelUpper: string;
    lapelLower: string;
  };
  secondary: {
    sleeve: string;
    sleeveWorkingButtons: string;
    sleeveLastButton: string;
    sleeveButtonThread: string;
    sleeve4ButtonThread: string;
    centerVent: string;
    fullyLined: string; // Fully lined interior layer
  };
}
