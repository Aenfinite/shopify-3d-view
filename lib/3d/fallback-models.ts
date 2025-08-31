import * as THREE from "three"

export interface FallbackModel {
  id: string
  name: string
  geometry: THREE.BufferGeometry
  materials: Record<string, THREE.Material>
  layers: string[]
}

// Create a simple shirt-like model using boxes
export function createShirtModel(): THREE.Group {
  const group = new THREE.Group()
  group.name = "shirt_model"

  // Main body (torso)
  const bodyGeometry = new THREE.BoxGeometry(2, 2.5, 0.5)
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
    metalness: 0.1,
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.name = "shirt_body"
  body.position.set(0, 0, 0)
  group.add(body)

  // Sleeves
  const sleeveGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.4)
  const sleeveMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
    metalness: 0.1,
  })

  const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial)
  leftSleeve.name = "shirt_sleeve_left"
  leftSleeve.position.set(-1.2, 0.5, 0)
  group.add(leftSleeve)

  const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial)
  rightSleeve.name = "shirt_sleeve_right"
  rightSleeve.position.set(1.2, 0.5, 0)
  group.add(rightSleeve)

  // Collar variations (only one visible at a time)
  const collarGeometry = new THREE.BoxGeometry(1.8, 0.3, 0.1)

  // Spread collar
  const spreadCollar = new THREE.Mesh(collarGeometry, new THREE.MeshStandardMaterial({ color: 0xf0f0f0 }))
  spreadCollar.name = "collar_spread"
  spreadCollar.position.set(0, 1.4, 0.3)
  spreadCollar.visible = true
  group.add(spreadCollar)

  // Button down collar
  const buttonDownCollar = new THREE.Mesh(collarGeometry, new THREE.MeshStandardMaterial({ color: 0xe0e0e0 }))
  buttonDownCollar.name = "collar_button_down"
  buttonDownCollar.position.set(0, 1.4, 0.3)
  buttonDownCollar.visible = false
  group.add(buttonDownCollar)

  // Cutaway collar
  const cutawayCollar = new THREE.Mesh(collarGeometry, new THREE.MeshStandardMaterial({ color: 0xd0d0d0 }))
  cutawayCollar.name = "collar_cutaway"
  cutawayCollar.position.set(0, 1.4, 0.3)
  cutawayCollar.visible = false
  group.add(cutawayCollar)

  // Button variations
  const buttonGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8)

  // Standard buttons
  const standardButtonsGroup = new THREE.Group()
  standardButtonsGroup.name = "buttons_standard"
  for (let i = 0; i < 5; i++) {
    const button = new THREE.Mesh(buttonGeometry, new THREE.MeshStandardMaterial({ color: 0x888888 }))
    button.position.set(0, 0.8 - i * 0.4, 0.26)
    standardButtonsGroup.add(button)
  }
  standardButtonsGroup.visible = true
  group.add(standardButtonsGroup)

  // Hidden placket (no visible buttons)
  const hiddenButtonsGroup = new THREE.Group()
  hiddenButtonsGroup.name = "buttons_hidden"
  hiddenButtonsGroup.visible = false
  group.add(hiddenButtonsGroup)

  // Contrast buttons
  const contrastButtonsGroup = new THREE.Group()
  contrastButtonsGroup.name = "buttons_contrast"
  for (let i = 0; i < 5; i++) {
    const button = new THREE.Mesh(buttonGeometry, new THREE.MeshStandardMaterial({ color: 0x333333 }))
    button.position.set(0, 0.8 - i * 0.4, 0.26)
    contrastButtonsGroup.add(button)
  }
  contrastButtonsGroup.visible = false
  group.add(contrastButtonsGroup)

  return group
}

// Create a simple pants model
export function createPantsModel(): THREE.Group {
  const group = new THREE.Group()
  group.name = "pants_model"

  // Main body (waist area)
  const waistGeometry = new THREE.BoxGeometry(2, 0.8, 0.5)
  const waistMaterial = new THREE.MeshStandardMaterial({
    color: 0xc3b091, // Khaki color
    roughness: 0.8,
    metalness: 0.1,
  })
  const waist = new THREE.Mesh(waistGeometry, waistMaterial)
  waist.name = "pants_body"
  waist.position.set(0, 1, 0)
  group.add(waist)

  // Legs
  const legGeometry = new THREE.BoxGeometry(0.8, 2.5, 0.4)
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0xc3b091,
    roughness: 0.8,
    metalness: 0.1,
  })

  const leftLeg = new THREE.Mesh(legGeometry, legMaterial)
  leftLeg.name = "pants_leg_left"
  leftLeg.position.set(-0.5, -0.5, 0)
  group.add(leftLeg)

  const rightLeg = new THREE.Mesh(legGeometry, legMaterial)
  rightLeg.name = "pants_leg_right"
  rightLeg.position.set(0.5, -0.5, 0)
  group.add(rightLeg)

  // Pocket variations
  const pocketGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.1)

  // Standard pockets
  const standardPocketsGroup = new THREE.Group()
  standardPocketsGroup.name = "pockets_standard"
  const leftPocket = new THREE.Mesh(pocketGeometry, new THREE.MeshStandardMaterial({ color: 0xb0a080 }))
  leftPocket.position.set(-0.7, 0.8, 0.3)
  const rightPocket = new THREE.Mesh(pocketGeometry, new THREE.MeshStandardMaterial({ color: 0xb0a080 }))
  rightPocket.position.set(0.7, 0.8, 0.3)
  standardPocketsGroup.add(leftPocket, rightPocket)
  standardPocketsGroup.visible = true
  group.add(standardPocketsGroup)

  // Slanted pockets
  const slantedPocketsGroup = new THREE.Group()
  slantedPocketsGroup.name = "pockets_slanted"
  const leftSlantedPocket = new THREE.Mesh(pocketGeometry, new THREE.MeshStandardMaterial({ color: 0xa09070 }))
  leftSlantedPocket.position.set(-0.7, 0.8, 0.3)
  leftSlantedPocket.rotation.z = 0.3
  const rightSlantedPocket = new THREE.Mesh(pocketGeometry, new THREE.MeshStandardMaterial({ color: 0xa09070 }))
  rightSlantedPocket.position.set(0.7, 0.8, 0.3)
  rightSlantedPocket.rotation.z = -0.3
  slantedPocketsGroup.add(leftSlantedPocket, rightSlantedPocket)
  slantedPocketsGroup.visible = false
  group.add(slantedPocketsGroup)

  return group
}

// Create a simple jacket model
export function createJacketModel(): THREE.Group {
  const group = new THREE.Group()
  group.name = "jacket_model"

  // Main body
  const bodyGeometry = new THREE.BoxGeometry(2.2, 3, 0.6)
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x000080, // Navy color
    roughness: 0.6,
    metalness: 0.2,
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.name = "jacket_body"
  body.position.set(0, 0, 0)
  group.add(body)

  // Sleeves
  const sleeveGeometry = new THREE.BoxGeometry(0.5, 2, 0.5)
  const sleeveMaterial = new THREE.MeshStandardMaterial({
    color: 0x000080,
    roughness: 0.6,
    metalness: 0.2,
  })

  const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial)
  leftSleeve.name = "jacket_sleeve_left"
  leftSleeve.position.set(-1.35, 0.5, 0)
  group.add(leftSleeve)

  const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial)
  rightSleeve.name = "jacket_sleeve_right"
  rightSleeve.position.set(1.35, 0.5, 0)
  group.add(rightSleeve)

  // Lapel variations
  const lapelGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.1)

  // Notched lapel
  const notchedLapel = new THREE.Mesh(lapelGeometry, new THREE.MeshStandardMaterial({ color: 0x000070 }))
  notchedLapel.name = "lapel_notched"
  notchedLapel.position.set(0, 0.8, 0.35)
  notchedLapel.visible = true
  group.add(notchedLapel)

  // Peak lapel
  const peakLapel = new THREE.Mesh(lapelGeometry, new THREE.MeshStandardMaterial({ color: 0x000060 }))
  peakLapel.name = "lapel_peak"
  peakLapel.position.set(0, 0.8, 0.35)
  peakLapel.rotation.z = 0.2
  peakLapel.visible = false
  group.add(peakLapel)

  // Shawl lapel
  const shawlLapel = new THREE.Mesh(lapelGeometry, new THREE.MeshStandardMaterial({ color: 0x000050 }))
  shawlLapel.name = "lapel_shawl"
  shawlLapel.position.set(0, 0.8, 0.35)
  shawlLapel.scale.set(1.2, 0.8, 1)
  shawlLapel.visible = false
  group.add(shawlLapel)

  return group
}

export const FALLBACK_MODELS = {
  "shirt-model-001": createShirtModel,
  "pants-model-001": createPantsModel,
  "jacket-model-001": createJacketModel,
}
