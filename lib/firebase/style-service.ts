import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where } from "firebase/firestore"
import { db } from "./firebase-config"
import type { StyleOption } from "@/types/configurator"

const STYLES_COLLECTION = "styles"
const STORAGE_PATH = "styles"

// Get all style options
export async function getStyleOptions(): Promise<Record<string, StyleOption[]>> {
  // This would be implemented with Firebase Firestore
  // For now, return mock data based on the default styles

  // In a real implementation, you would fetch from Firestore:
  // const stylesCollection = collection(db, STYLES_COLLECTION)
  // const snapshot = await getDocs(stylesCollection)
  // const styles = snapshot.docs.map((doc) => doc.data() as StyleOption)

  // Group styles by category
  // const groupedStyles: Record<string, StyleOption[]> = {}
  // styles.forEach((style) => {
  //   if (!groupedStyles[style.category]) {
  //     groupedStyles[style.category] = []
  //   }
  //   groupedStyles[style.category].push(style)
  // })

  // return groupedStyles

  // For now, return mock data
  return {
    collar: [
      {
        id: "collar-spread",
        name: "Spread Collar",
        description: "Classic spread collar, versatile for any occasion",
        category: "collar",
        priceDelta: 0,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "collar-button-down",
        name: "Button-Down Collar",
        description: "Casual collar with buttons to secure the points",
        category: "collar",
        priceDelta: 0,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "collar-cutaway",
        name: "Cutaway Collar",
        description: "Wide spread collar for a modern look",
        category: "collar",
        priceDelta: 10,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "collar-band",
        name: "Band Collar",
        description: "Minimalist collar without points",
        category: "collar",
        priceDelta: 5,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
    ],
    cuff: [
      {
        id: "cuff-barrel",
        name: "Barrel Cuff",
        description: "Standard cuff with buttons",
        category: "cuff",
        priceDelta: 0,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "cuff-french",
        name: "French Cuff",
        description: "Formal cuff that requires cufflinks",
        category: "cuff",
        priceDelta: 15,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "cuff-convertible",
        name: "Convertible Cuff",
        description: "Can be worn with buttons or cufflinks",
        category: "cuff",
        priceDelta: 10,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
    ],
    placket: [
      {
        id: "placket-standard",
        name: "Standard Placket",
        description: "Classic front placket with visible buttons",
        category: "placket",
        priceDelta: 0,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "placket-hidden",
        name: "Hidden Placket",
        description: "Placket with concealed buttons for a clean look",
        category: "placket",
        priceDelta: 10,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "placket-tuxedo",
        name: "Tuxedo Placket",
        description: "Formal placket with decorative pleats",
        category: "placket",
        priceDelta: 20,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
    ],
    pocket: [
      {
        id: "pocket-none",
        name: "No Pocket",
        description: "Clean look without a pocket",
        category: "pocket",
        priceDelta: 0,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "pocket-single",
        name: "Single Pocket",
        description: "Classic single pocket on the left chest",
        category: "pocket",
        priceDelta: 5,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "pocket-dual",
        name: "Dual Pockets",
        description: "Two symmetrical chest pockets",
        category: "pocket",
        priceDelta: 10,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
    ],
    back: [
      {
        id: "back-plain",
        name: "Plain Back",
        description: "Clean back without pleats",
        category: "back",
        priceDelta: 0,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "back-center-pleat",
        name: "Center Pleat",
        description: "Single pleat in the center for extra movement",
        category: "back",
        priceDelta: 5,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "back-side-pleats",
        name: "Side Pleats",
        description: "Two pleats for maximum comfort and movement",
        category: "back",
        priceDelta: 10,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
    ],
    monogram: [
      {
        id: "monogram-none",
        name: "No Monogram",
        description: "No personalized monogram",
        category: "monogram",
        priceDelta: 0,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "monogram-cuff",
        name: "Cuff Monogram",
        description: "Subtle monogram on the cuff",
        category: "monogram",
        priceDelta: 15,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "monogram-chest",
        name: "Chest Monogram",
        description: "Visible monogram on the chest",
        category: "monogram",
        priceDelta: 15,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
      {
        id: "monogram-tail",
        name: "Tail Monogram",
        description: "Hidden monogram on the shirt tail",
        category: "monogram",
        priceDelta: 15,
        imageUrl: "/placeholder.svg?height=100&width=200",
      },
    ],
  }
}

// Get style options by category
export async function getStyleOptionsByCategory(category: string): Promise<StyleOption[]> {
  const stylesCollection = collection(db, STYLES_COLLECTION)
  const q = query(stylesCollection, where("category", "==", category))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => doc.data() as StyleOption)
}

// Get a single style option by ID
export async function getStyleOptionById(id: string): Promise<StyleOption | null> {
  const styleDoc = doc(db, STYLES_COLLECTION, id)
  const snapshot = await getDoc(styleDoc)
  return snapshot.exists() ? (snapshot.data() as StyleOption) : null
}

// Create a new style option
export async function createStyleOption(style: StyleOption): Promise<void> {
  const styleDoc = doc(db, STYLES_COLLECTION, style.id)
  await setDoc(styleDoc, style)
}

// Update an existing style option
export async function updateStyleOption(id: string, style: StyleOption): Promise<void> {
  const styleDoc = doc(db, STYLES_COLLECTION, id)
  await setDoc(styleDoc, style, { merge: true })
}

// Delete a style option
export async function deleteStyleOption(id: string): Promise<void> {
  const styleDoc = doc(db, STYLES_COLLECTION, id)
  await deleteDoc(styleDoc)
}
