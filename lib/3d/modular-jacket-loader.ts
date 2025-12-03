/**
 * Modular Jacket Loader
 * 
 * This loader combines multiple GLTF parts to create a complete jacket.
 * Each part is loaded separately and then assembled into one jacket model.
 * Uses React Three Fiber's useGLTF with built-in DRACO support.
 * Includes real-time color customization and performance optimizations.
 */

import * as THREE from "three"
import { useGLTF } from "@react-three/drei"
import { useJacketPart } from "./jacket-part-loader"
import { useMemo, useEffect } from "react"
import { BasicJacketCustomization } from "@/types/configurator"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"
import { applyColorToMesh } from './material-utils'

// Define color categories for all jacket parts
export const ColorCategories = {
  UPPER_LAPEL: 'upper_lapel',
  LOWER_LAPEL: 'lower_lapel',
  MAIN_FABRIC: 'main_fabric',
  BUTTONS: 'buttons',
  THREAD: 'thread',
  LINING: 'lining'
} as const

// Map mesh IDs to color categories - centralized color management
export const meshColorMap: Record<string, typeof ColorCategories[keyof typeof ColorCategories]> = {
  // Upper Lapel meshes
  'lapel_upper': ColorCategories.UPPER_LAPEL,
  'upper_lapel': ColorCategories.UPPER_LAPEL,
  'upper_collar': ColorCategories.UPPER_LAPEL,
  'cl3_upper': ColorCategories.UPPER_LAPEL,
  'uppercl3': ColorCategories.UPPER_LAPEL,
  'cl2': ColorCategories.UPPER_LAPEL,
  'cl1': ColorCategories.UPPER_LAPEL,
  'collar': ColorCategories.UPPER_LAPEL,
  'lapel': ColorCategories.UPPER_LAPEL,
  
  // Lower Lapel meshes
  'lapel_lower': ColorCategories.LOWER_LAPEL,
  'lower_lapel': ColorCategories.LOWER_LAPEL,
  'lower_collar': ColorCategories.LOWER_LAPEL,
  'cl3_lower': ColorCategories.LOWER_LAPEL,
  'lowercl3': ColorCategories.LOWER_LAPEL,
  
  // Main fabric meshes
  'front_body': ColorCategories.MAIN_FABRIC,
  'back_body': ColorCategories.MAIN_FABRIC,
  'sleeve': ColorCategories.MAIN_FABRIC,
  'vent': ColorCategories.MAIN_FABRIC,
  'center_vent': ColorCategories.MAIN_FABRIC,
  'curved': ColorCategories.MAIN_FABRIC,
  'front_bottom': ColorCategories.MAIN_FABRIC,
  'novent': ColorCategories.MAIN_FABRIC,
  'PK-9': ColorCategories.MAIN_FABRIC,
  'pk-1': ColorCategories.MAIN_FABRIC,
  'pk7': ColorCategories.MAIN_FABRIC,
  'pk1': ColorCategories.MAIN_FABRIC,
  'pocket': ColorCategories.MAIN_FABRIC,
  'front_pocket': ColorCategories.MAIN_FABRIC,
  'chest_pocket': ColorCategories.MAIN_FABRIC,
  'chestpocket': ColorCategories.MAIN_FABRIC,
  'chestpatch1': ColorCategories.MAIN_FABRIC,
  'chestpatch2': ColorCategories.MAIN_FABRIC,
  'chestpatch': ColorCategories.MAIN_FABRIC,
  'tessuto': ColorCategories.MAIN_FABRIC,  // ChestPatch1 mesh name
  
  // Button meshes - specific names from S4.gltf files
  'button': ColorCategories.BUTTONS,
  'front_button': ColorCategories.BUTTONS,
  'sleeve_button': ColorCategories.BUTTONS,
  'last_button': ColorCategories.BUTTONS,
  'working_button': ColorCategories.BUTTONS,
  'last_standard': ColorCategories.BUTTONS,
  'last_standard001': ColorCategories.BUTTONS,
  'last_standard002': ColorCategories.BUTTONS,
  'standard': ColorCategories.BUTTONS,
  'standard001': ColorCategories.BUTTONS,
  'standard002': ColorCategories.BUTTONS,
  'standard003': ColorCategories.BUTTONS,
  'standard004': ColorCategories.BUTTONS,
  'S4': ColorCategories.BUTTONS,
  's4': ColorCategories.BUTTONS,
  'Button': ColorCategories.BUTTONS,
  'button001': ColorCategories.BUTTONS,
  'button002': ColorCategories.BUTTONS,
  'button003': ColorCategories.BUTTONS,
  'button004': ColorCategories.BUTTONS,
  's4.002': ColorCategories.BUTTONS,  // 3-button jacket buttons
  's4002': ColorCategories.BUTTONS,  // 3-button without dot
  's14_circle.008': ColorCategories.BUTTONS,  // 6D2 double-breasted main
  's14_circle.009': ColorCategories.BUTTONS,  // 6D2 double-breasted mesh
  's14_circle008': ColorCategories.BUTTONS,  // 6D2 without dot
  's14_circle009': ColorCategories.BUTTONS,  // 6D2 without dot
  's14_circle': ColorCategories.BUTTONS,  // 6D2 pattern
  's14circle': ColorCategories.BUTTONS,  // 6D2 without underscore
  's14': ColorCategories.BUTTONS,  // 6D2 button variations
  
  // Thread meshes - MUST be listed AFTER buttons to prevent button_thread confusion
  'thread': ColorCategories.THREAD,
  'button_thread': ColorCategories.THREAD,
  'sleeve_thread': ColorCategories.THREAD,
  'last_thread': ColorCategories.THREAD,
  '1_Thread': ColorCategories.THREAD,
  '2_Thread': ColorCategories.THREAD,
  '3_Thread': ColorCategories.THREAD,
  '4_Thread': ColorCategories.THREAD,
  
  // Lining meshes
  'lining': ColorCategories.LINING,
  'lining_standard': ColorCategories.LINING,
  'lining_custom': ColorCategories.LINING,
  'interior_lining': ColorCategories.LINING,
  'jacket_lining': ColorCategories.LINING,
  'inner_lining': ColorCategories.LINING,
  'liningcurved': ColorCategories.LINING,  // Half lined curved mesh (lowercase)
  'LiningCurved': ColorCategories.LINING,  // Half lined curved mesh (exact match from GLTF)
  'liningcurved.001': ColorCategories.LINING,  // Full lined curved mesh (lowercase)
  'LiningCurved.001': ColorCategories.LINING,  // Full lined curved mesh (exact match from GLTF)
  'fully_lined': ColorCategories.LINING,
  'fullylining': ColorCategories.LINING,
  '1_Thread003': ColorCategories.THREAD,
  'Thread': ColorCategories.THREAD,
  'buttonthread': ColorCategories.THREAD,
  'sleevethread': ColorCategories.THREAD,
  'button_hole': ColorCategories.THREAD,
  'button_stitching': ColorCategories.THREAD,
  'buttonhole': ColorCategories.THREAD,
  'buttonstitching': ColorCategories.THREAD,
  'stitching': ColorCategories.THREAD,
  'hole': ColorCategories.THREAD
}

// Helper functions that use the central categorization
export function getMeshCategory(meshId: string): typeof ColorCategories[keyof typeof ColorCategories] | null {
  const normalizedId = meshId.toLowerCase().trim()
  
  // PRIORITY: Check if it's a lining mesh FIRST (LiningCurved, fully_lined, etc.)
  if (normalizedId.includes('lining') || meshId === 'LiningCurved') {
    console.log(`✅ Identified as LINING by pattern: ${meshId} -> ${ColorCategories.LINING}`)
    return ColorCategories.LINING
  }
  
  // PRIORITY: Check if it's a thread mesh to avoid confusion with button meshes
  if (normalizedId.includes('thread') || normalizedId.includes('stitching') || normalizedId.includes('hole')) {
    console.log(`✅ Identified as THREAD by pattern: ${meshId} -> ${ColorCategories.THREAD}`)
    return ColorCategories.THREAD
  }
  
  // Check for button patterns (S4, S14, circle) BEFORE exact match
  if (normalizedId.startsWith('s4') || normalizedId.includes('s4.') || normalizedId.includes('s4002')) {
    console.log(`✅ Identified as BUTTON by S4 pattern: ${meshId} -> ${ColorCategories.BUTTONS}`)
    return ColorCategories.BUTTONS
  }
  if (normalizedId.startsWith('s14') || normalizedId.includes('s14_circle') || normalizedId.includes('s14circle')) {
    console.log(`✅ Identified as BUTTON by S14 pattern: ${meshId} -> ${ColorCategories.BUTTONS}`)
    return ColorCategories.BUTTONS
  }
  
  // First try exact match
  if (meshColorMap[normalizedId]) {
    console.log(`✅ Found exact category match for mesh: ${meshId} -> ${meshColorMap[normalizedId]}`)
    return meshColorMap[normalizedId]
  }
  
  // Then try partial matches by removing numbers and checking core names
  const cleanId = normalizedId.replace(/[0-9]+/g, '').trim()
  for (const [knownId, category] of Object.entries(meshColorMap)) {
    const cleanKnownId = knownId.toLowerCase().replace(/[0-9]+/g, '').trim()
    if (cleanId.includes(cleanKnownId) || cleanKnownId.includes(cleanId)) {
      console.log(`✅ Found normalized category match for mesh: ${meshId} -> ${category}`)
      return category
    }
  }
  
  // Finally try partial matches with original IDs
  for (const [knownId, category] of Object.entries(meshColorMap)) {
    if (normalizedId.includes(knownId.toLowerCase()) || knownId.toLowerCase().includes(normalizedId)) {
      console.log(`✅ Found partial category match for mesh: ${meshId} -> ${category}`)
      return category
    }
  }
  
  console.log(`❌ No category match found for mesh: ${meshId}`)
  return null
}

// Helper functions that use the central categorization
export function isUpperLapel(meshId: string): boolean {
  return getMeshCategory(meshId) === ColorCategories.UPPER_LAPEL
}

export function isLowerLapel(meshId: string): boolean {
  return getMeshCategory(meshId) === ColorCategories.LOWER_LAPEL
}

export function isFabricPart(meshId: string): boolean {
  return getMeshCategory(meshId) === ColorCategories.MAIN_FABRIC
}

export function isButtonPart(meshId: string): boolean {
  return getMeshCategory(meshId) === ColorCategories.BUTTONS
}

export function isThreadPart(meshId: string): boolean {
  return getMeshCategory(meshId) === ColorCategories.THREAD
}

// Type definitions
export interface JacketConfig {
  priority: {
    frontBottom: string;
    frontButtons: string;
    frontThread: string;
    lapelUpper: string;
    lapelLower: string;
    backBody: string; // The back/body of the jacket
  };
  secondary: {
    sleeve: string;
    sleeveWorkingButtons: string;
    sleeveLastButton: string;
    sleeveButtonThread: string;
    sleeve4ButtonThread: string;
    centerVent: string; // Re-enabled vent
    frontPocket?: string; // Optional front pocket (PK-9 for flap, PK-1 for patch)
    chestPocket?: string; // Optional chest pocket
    fullyLined: string; // Fully lined interior layer
  };
}

// Available front styles
export type FrontStyle = '2button' | '3button' | '6d2';

// Import the jacket configs
import { jacketConfigs } from './configs';

// Hook for switching jacket styles while preserving customizations
export function useJacketStyle(style: FrontStyle, customizations: BasicJacketCustomization = {}) {
  console.log(`🎭 Loading jacket style: ${style}`, customizations)
  
  const config = jacketConfigs[style];
  if (!config) {
    console.error(`❌ No configuration found for style: ${style}`)
    return {}
  }
  
  const parts: Partial<StandardJacketParts> = {};
  
  // Unified part loading logic with error handling
  const loadPart = (key: string, path: string) => {
    try {
      console.log(`📦 Loading part ${key} from ${path}`)
      const { scene } = useJacketPart(key, path, customizations);
      if (scene) {
        console.log(`✅ Successfully loaded part: ${key}`)
        parts[key as keyof StandardJacketParts] = scene;
      } else {
        console.warn(`⚠️ Failed to load part: ${key}`)
      }
    } catch (error) {
      console.error(`❌ Error loading part ${key}:`, error)
    }
  };
  
  // Load priority parts first
  for (const [key, path] of Object.entries(config.priority)) {
    loadPart(key, path);
  }
  
  // Then load secondary parts
  for (const [key, path] of Object.entries(config.secondary)) {
    loadPart(key, path);
  }
  
  return parts;
}