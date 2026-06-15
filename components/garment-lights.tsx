"use client"

import { Environment } from "@react-three/drei"

/**
 * GarmentLights — single source of truth for the 3D lighting rig per garment type.
 *
 * The admin fabric-wizard preview and the customer-facing product viewers must
 * light the fabric identically, otherwise the same fabric reads differently
 * (e.g. shinier/brighter) depending on where it's shown. Each garment had its
 * own inline light rig in its viewer, and the wizard had a third rig — so they
 * drifted. This component holds the one rig per type; both sides render it so
 * they can never diverge again.
 *
 * Values are the customer viewers' tuned rigs:
 *   jacket → studio HDR @ 0.12, soft key + fills (gentle textile shadows)
 *   shirt  → studio HDR @ 0.10, top-right key, warm hemisphere
 *   pants  → apartment HDR @ 0.08 (uniform, no studio softbox glints), brighter base
 *
 * Place inside a <Canvas>. Scene background/fog stay with each canvas — this
 * component only emits lights + the environment map.
 */
export function GarmentLights({ productType }: { productType?: string }) {
  const p = (productType || "shirt").toLowerCase()

  if (p === "jacket" || p === "blazer" || p === "coat") {
    return (
      <>
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[3, 7, 4]}
          intensity={0.72}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-4, 4, 2]} intensity={0.5} />
        <directionalLight position={[0, 8, 1]} intensity={0.28} />
        <directionalLight position={[0, 2, -4]} intensity={0.18} />
        <hemisphereLight args={["#f4efe8", "#3a3a3a", 0.3]} />
        <Environment preset="studio" environmentIntensity={0.12} />
      </>
    )
  }

  if (p === "pants" || p === "pant" || p === "trousers" || p === "trouser") {
    return (
      <>
        <ambientLight intensity={1.0} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-5, 3, 3]} intensity={0.5} />
        <directionalLight position={[-4, 4, -4]} intensity={0.35} />
        <directionalLight position={[4, 4, -4]} intensity={0.35} />
        <hemisphereLight args={["#ffffff", "#888888", 0.45]} />
        <Environment preset="apartment" environmentIntensity={0.08} />
      </>
    )
  }

  // shirt (default)
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3, 8, 4]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-3, 5, 2]} intensity={0.45} />
      <directionalLight position={[0, 4, -4]} intensity={0.2} />
      <hemisphereLight args={["#f4efe8", "#3a3a3a", 0.28]} />
      <Environment preset="studio" environmentIntensity={0.1} />
    </>
  )
}
