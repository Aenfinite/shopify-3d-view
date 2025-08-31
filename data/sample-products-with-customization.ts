export interface CustomizationOption {
  id: string
  name: string
  type: "color" | "texture" | "component"
  category: string
  values: {
    id: string
    name: string
    value: string
    price: number
    thumbnail?: string
    color?: string
    layerControls?: {
      show: string[]
      hide: string[]
    }
  }[]
}

export const SAMPLE_PRODUCTS_WITH_CUSTOMIZATION = {
  "shirt-001": [
    {
      id: "fabric-color",
      name: "Fabric Color",
      type: "color" as const,
      category: "fabric",
      values: [
        { id: "white", name: "White", value: "#FFFFFF", price: 0, color: "#FFFFFF" },
        { id: "light-blue", name: "Light Blue", value: "#E3F2FD", price: 0, color: "#E3F2FD" },
        { id: "navy", name: "Navy", value: "#1565C0", price: 5, color: "#1565C0" },
        { id: "charcoal", name: "Charcoal", value: "#424242", price: 5, color: "#424242" },
        { id: "burgundy", name: "Burgundy", value: "#8E24AA", price: 10, color: "#8E24AA" },
        { id: "forest", name: "Forest Green", value: "#2E7D32", price: 10, color: "#2E7D32" },
        { id: "cream", name: "Cream", value: "#FFF8E1", price: 0, color: "#FFF8E1" },
        { id: "pink", name: "Pink", value: "#F8BBD9", price: 5, color: "#F8BBD9" },
      ],
    },
    {
      id: "fabric-type",
      name: "Fabric Type",
      type: "texture" as const,
      category: "fabric",
      values: [
        { id: "cotton", name: "Cotton", value: "cotton", price: 0 },
        { id: "linen", name: "Linen", value: "linen", price: 15 },
        { id: "silk", name: "Silk", value: "silk", price: 50 },
        { id: "wool", name: "Wool", value: "wool", price: 25 },
        { id: "cashmere", name: "Cashmere", value: "cashmere", price: 100 },
      ],
    },
    {
      id: "collar-style",
      name: "Collar Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "spread", name: "Spread Collar", value: "spread", price: 0 },
        { id: "point", name: "Point Collar", value: "point", price: 0 },
        { id: "button-down", name: "Button Down", value: "button-down", price: 5 },
        { id: "cutaway", name: "Cutaway", value: "cutaway", price: 10 },
      ],
    },
    {
      id: "cuff-style",
      name: "Cuff Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "barrel", name: "Barrel Cuff", value: "barrel", price: 0 },
        { id: "french", name: "French Cuff", value: "french", price: 15 },
        { id: "convertible", name: "Convertible", value: "convertible", price: 10 },
      ],
    },
    {
      id: "monogram",
      name: "Embroidered Monogram",
      type: "component" as const,
      category: "personalization",
      values: [
        { id: "none", name: "No Monogram", value: "none", price: 0 },
        { id: "initials", name: "Initials (3 chars)", value: "initials", price: 6.5 },
        { id: "full-name", name: "Full Name (15 chars)", value: "full-name", price: 10 },
      ],
    },
    {
      id: "button-color",
      name: "Button Color",
      type: "color" as const,
      category: "details",
      values: [
        { id: "standard", name: "Standard Matching", value: "standard", price: 0 },
        { id: "gold", name: "Gold", value: "#FFD700", price: 8, color: "#FFD700" },
        { id: "silver", name: "Silver", value: "#C0C0C0", price: 8, color: "#C0C0C0" },
        { id: "copper", name: "Copper", value: "#B87333", price: 8, color: "#B87333" },
        { id: "bronze", name: "Bronze", value: "#CD7F32", price: 8, color: "#CD7F32" },
        { id: "pewter", name: "Pewter", value: "#96A8A1", price: 8, color: "#96A8A1" },
      ],
    },
  ],
  "pants-001": [
    {
      id: "fabric-color",
      name: "Fabric Color",
      type: "color" as const,
      category: "fabric",
      values: [
        { id: "navy", name: "Navy", value: "#1565C0", price: 0, color: "#1565C0" },
        { id: "charcoal", name: "Charcoal", value: "#424242", price: 0, color: "#424242" },
        { id: "black", name: "Black", value: "#000000", price: 5, color: "#000000" },
        { id: "khaki", name: "Khaki", value: "#8D6E63", price: 0, color: "#8D6E63" },
        { id: "olive", name: "Olive", value: "#689F38", price: 5, color: "#689F38" },
        { id: "burgundy", name: "Burgundy", value: "#8E24AA", price: 10, color: "#8E24AA" },
        { id: "stone", name: "Stone", value: "#A1887F", price: 0, color: "#A1887F" },
        { id: "cream", name: "Cream", value: "#FFF8E1", price: 5, color: "#FFF8E1" },
      ],
    },
    {
      id: "fabric-type",
      name: "Fabric Type",
      type: "texture" as const,
      category: "fabric",
      values: [
        { id: "wool", name: "Wool", value: "wool", price: 0 },
        { id: "cotton", name: "Cotton", value: "cotton", price: -10 },
        { id: "linen", name: "Linen", value: "linen", price: 15 },
        { id: "cashmere", name: "Cashmere", value: "cashmere", price: 100 },
        { id: "stretch-wool", name: "Stretch Wool", value: "stretch-wool", price: 25 },
        { id: "corduroy", name: "Corduroy", value: "corduroy", price: 20 },
      ],
    },
    {
      id: "fit-style",
      name: "Fit Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "classic", name: "Classic Fit", value: "classic", price: 0 },
        { id: "slim", name: "Slim Fit", value: "slim", price: 0 },
        { id: "tailored", name: "Tailored Fit", value: "tailored", price: 5 },
        { id: "relaxed", name: "Relaxed Fit", value: "relaxed", price: 0 },
        { id: "athletic", name: "Athletic Fit", value: "athletic", price: 10 },
      ],
    },
    {
      id: "waistband-style",
      name: "Waistband Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "standard", name: "Standard", value: "standard", price: 0 },
        { id: "extended", name: "Extended Tab", value: "extended", price: 10 },
        { id: "side-adjusters", name: "Side Adjusters", value: "side-adjusters", price: 15 },
        { id: "suspender-buttons", name: "Suspender Buttons", value: "suspender-buttons", price: 12 },
      ],
    },
    {
      id: "pocket-style",
      name: "Pocket Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "standard", name: "Standard Pockets", value: "standard", price: 0 },
        { id: "slanted", name: "Slanted Pockets", value: "slanted", price: 5 },
        { id: "coin-pocket", name: "With Coin Pocket", value: "coin-pocket", price: 8 },
        { id: "ticket-pocket", name: "With Ticket Pocket", value: "ticket-pocket", price: 10 },
      ],
    },
    {
      id: "pleat-style",
      name: "Pleat Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "flat-front", name: "Flat Front", value: "flat-front", price: 0 },
        { id: "single-pleat", name: "Single Pleat", value: "single-pleat", price: 5 },
        { id: "double-pleat", name: "Double Pleat", value: "double-pleat", price: 10 },
      ],
    },
    {
      id: "hem-style",
      name: "Hem Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "no-cuff", name: "No Cuff", value: "no-cuff", price: 0 },
        { id: "cuffed", name: "Cuffed", value: "cuffed", price: 5 },
        { id: "turn-up", name: "Turn Up", value: "turn-up", price: 8 },
        { id: "unfinished", name: "Unfinished (Tailor Hem)", value: "unfinished", price: 0 },
      ],
    },
    {
      id: "belt-loops",
      name: "Belt Loops",
      type: "component" as const,
      category: "details",
      values: [
        { id: "standard", name: "Standard Belt Loops", value: "standard", price: 0 },
        { id: "extended", name: "Extended Belt Loops", value: "extended", price: 5 },
        { id: "no-loops", name: "No Belt Loops", value: "no-loops", price: -5 },
      ],
    },
  ],
  "jacket-001": [
    {
      id: "fabric-type",
      name: "Select Fabric Type",
      type: "texture" as const,
      category: "fabric",
      values: [
        { 
          id: "wool-blend", 
          name: "Wool Blend", 
          value: "wool-blend", 
          price: 0,
          thumbnail: "/placeholder.svg?height=60&width=60&text=Wool"
        },
        { 
          id: "premium-wool", 
          name: "Premium Wool", 
          value: "premium-wool", 
          price: 50,
          thumbnail: "/placeholder.svg?height=60&width=60&text=Premium"
        },
        { 
          id: "cashmere-blend", 
          name: "Cashmere Blend", 
          value: "cashmere-blend", 
          price: 120,
          thumbnail: "/placeholder.svg?height=60&width=60&text=Cashmere"
        },
        { 
          id: "summer-wool", 
          name: "Summer Wool", 
          value: "summer-wool", 
          price: 30,
          thumbnail: "/placeholder.svg?height=60&width=60&text=Summer"
        },
        { 
          id: "tweed", 
          name: "Tweed", 
          value: "tweed", 
          price: 80,
          thumbnail: "/placeholder.svg?height=60&width=60&text=Tweed"
        },
        { 
          id: "linen-blend", 
          name: "Linen Blend", 
          value: "linen-blend", 
          price: 40,
          thumbnail: "/placeholder.svg?height=60&width=60&text=Linen"
        },
      ],
    },
    {
      id: "fabric-color",
      name: "Select Fabric Color",
      type: "color" as const,
      category: "fabric",
      values: [
        { id: "charcoal", name: "Charcoal", value: "#36454F", price: 0, color: "#36454F" },
        { id: "navy", name: "Navy", value: "#000080", price: 0, color: "#000080" },
        { id: "black", name: "Black", value: "#000000", price: 0, color: "#000000" },
        { id: "brown", name: "Brown", value: "#8B4513", price: 0, color: "#8B4513" },
        { id: "gray", name: "Gray", value: "#808080", price: 0, color: "#808080" },
        { id: "light-gray", name: "Light Gray", value: "#D3D3D3", price: 0, color: "#D3D3D3" },
        { id: "forest-green", name: "Forest Green", value: "#228B22", price: 5, color: "#228B22" },
        { id: "beige", name: "Beige", value: "#F5F5DC", price: 0, color: "#F5F5DC" },
        { id: "camel", name: "Camel", value: "#C19A6B", price: 5, color: "#C19A6B" },
        { id: "light-blue", name: "Light Blue", value: "#ADD8E6", price: 5, color: "#ADD8E6" },
        { id: "white", name: "White", value: "#FFFFFF", price: 0, color: "#FFFFFF" },
      ],
    },
    {
      id: "jacket-front-style",
      name: "Front Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "two-buttons", name: "Two Buttons", value: "two-buttons", price: 0, thumbnail: "/images/jacket-configuration/front-style/2buttons.png" },
        { id: "three-buttons", name: "Three Buttons", value: "three-buttons", price: 10, thumbnail: "/images/jacket-configuration/front-style/3buttons.png" },
        { id: "2x3-buttons", name: "2x3 Buttons", value: "2x3-buttons", price: 25, thumbnail: "/images/jacket-configuration/front-style/2x3buttons.png" },
      ],
    },
     {
      id: "front-pocket",
      name: "Front Pocket",
      type: "component" as const,
      category: "style",
      values: [
        { id: "flap-pocket", name: "Flap Pocket", value: "flap-pocket", price: 0, thumbnail: "/images/jacket-configuration/front-pocket/flappocket.png" },
        { id: "patch-pocket", name: "Patch Pocket", value: "patch-pocket", price: 10, thumbnail: "/images/jacket-configuration/front-pocket/patchpocket.png" },
      ],
    },
     {
      id: "chest-pocket",
      name: "Chest Pocket",
      type: "component" as const,
      category: "style",
      values: [
        { id: "piping-pocket", name: "Piping Pocket", value: "piping-pocket", price: 0, thumbnail: "/images/jacket-configuration/chest-pocket/pipingpocket.png" },
        { id: "patch-pocket-chest", name: "Patch Pocket", value: "patch-pocket-chest", price: 8, thumbnail: "/images/jacket-configuration/chest-pocket/patchpocket.png" },
      ],
    },
    {
      id: "jacket-sleeve-buttons",
      name: "Sleeve Buttons",
      type: "component" as const,
      category: "style",
      values: [
        { id: "4-buttons-no-holes", name: "4 Buttons No Holes", value: "4-buttons-no-holes", price: 0, thumbnail: "/images/jacket-configuration/sleeve-buttons/4buttons.png" },
        { id: "4-buttons-with-holes", name: "4 Buttons With Holes", value: "4-buttons-with-holes", price: 25, thumbnail: "/images/jacket-configuration/sleeve-buttons/4buttonswithholes.png" },
      ],
    },
    {
      id: "jacket-vent-style",
      name: "Vent Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "one-back-vent", name: "One Back Vent", value: "one-back-vent", price: 0, thumbnail: "/images/jacket-configuration/back-vent/onebackvent.png" },
        { id: "two-back-vent", name: "Two Back Vent", value: "two-back-vent", price: 15, thumbnail: "/images/jacket-configuration/back-vent/2sidevent.png" },
      ],
    },
   
      {
      id: "button-color",
      name: "Button Color",
      type: "color" as const,
      category: "details",
      values: [
        { id: "natural", name: "Natural", value: "#F5E6D3", price: 0, color: "#F5E6D3" },
        { id: "dark-brown", name: "Dark Brown", value: "#4A2C2A", price: 5, color: "#4A2C2A" },
        { id: "black", name: "Black", value: "#1A1A1A", price: 5, color: "#1A1A1A" },
        { id: "navy", name: "Navy", value: "#1565C0", price: 5, color: "#1565C0" },
        { id: "gold", name: "Gold", value: "#FFD700", price: 15, color: "#FFD700" },
        { id: "silver", name: "Silver", value: "#C0C0C0", price: 12, color: "#C0C0C0" },
        { id: "bronze", name: "Bronze", value: "#CD7F32", price: 12, color: "#CD7F32" },
        { id: "pearl-white", name: "Pearl White", value: "#F8F8FF", price: 10, color: "#F8F8FF" },
      ],
    },
    {
      id: "embroidered-monogram",
      name: "Embroidered Monogram",
      type: "custom" as const,
      category: "personalization",
      customComponent: "embroidered-monogram",
      values: [
        { id: "configure-monogram", name: "Configure Monogram", value: "configure", price: 0 },
      ],
    },
  ],
  "suit-001": [
    {
      id: "fabric-color",
      name: "Suit Fabric Color",
      type: "color" as const,
      category: "fabric",
      values: [
        { id: "navy", name: "Navy", value: "#1565C0", price: 0, color: "#1565C0" },
        { id: "charcoal", name: "Charcoal", value: "#424242", price: 0, color: "#424242" },
        { id: "black", name: "Black", value: "#000000", price: 15, color: "#000000" },
        { id: "grey", name: "Light Grey", value: "#9E9E9E", price: 10, color: "#9E9E9E" },
        { id: "pinstripe-navy", name: "Navy Pinstripe", value: "#1565C0", price: 50, color: "#1565C0" },
      ],
    },
    {
      id: "fabric-type",
      name: "Suit Fabric",
      type: "texture" as const,
      category: "fabric",
      values: [
        { id: "super-120s", name: "Super 120s Wool", value: "super-120s", price: 0 },
        { id: "super-150s", name: "Super 150s Wool", value: "super-150s", price: 200 },
        { id: "cashmere-blend", name: "Cashmere Blend", value: "cashmere-blend", price: 400 },
        { id: "mohair-blend", name: "Mohair Blend", value: "mohair-blend", price: 150 },
      ],
    },
    {
      id: "suit-style",
      name: "Suit Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "two-piece", name: "Two Piece Suit", value: "two-piece", price: 0 },
        { id: "three-piece", name: "Three Piece Suit", value: "three-piece", price: 200 },
        { id: "tuxedo", name: "Tuxedo", value: "tuxedo", price: 300 },
      ],
    },
  ],
  "blazer-001": [
    {
      id: "fabric-color",
      name: "Blazer Color",
      type: "color" as const,
      category: "fabric",
      values: [
        { id: "navy", name: "Navy Blazer", value: "#1565C0", price: 0, color: "#1565C0" },
        { id: "forest", name: "Forest Green", value: "#2E7D32", price: 10, color: "#2E7D32" },
        { id: "burgundy", name: "Burgundy", value: "#8E24AA", price: 15, color: "#8E24AA" },
        { id: "camel", name: "Camel", value: "#D2691E", price: 20, color: "#D2691E" },
      ],
    },
    {
      id: "blazer-style",
      name: "Blazer Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "classic", name: "Classic Blazer", value: "classic", price: 0 },
        { id: "sport-coat", name: "Sport Coat", value: "sport-coat", price: 25 },
        { id: "unstructured", name: "Unstructured", value: "unstructured", price: 50 },
      ],
    },
  ],
}
