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
        // Fabric texture options from public/fabrics/FabricsJacket folder
        { id: "texture-1", name: "Jet Black", value: "/fabrics/FabricsJacket/02.3716.01.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.01.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.01.jpg" },
        { id: "texture-2", name: "Midnight Plum", value: "/fabrics/FabricsJacket/02.3716.05.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.05.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.05.jpg" },
        { id: "texture-3", name: "Urban Grey", value: "/fabrics/FabricsJacket/02.3716.07.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.07.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.07.jpg" },
        { id: "texture-4", name: "Indigo Night", value: "/fabrics/FabricsJacket/02.3716.13.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.13.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.13.jpg" },
        { id: "texture-5", name: "Royal Navy", value: "/fabrics/FabricsJacket/02.3716.15.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.15.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.15.jpg" },
        { id: "texture-6", name: "Warm Almond", value: "/fabrics/FabricsJacket/02.3716.17.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.17.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.17.jpg" },
        { id: "texture-7", name: "Mocha Taupe", value: "/fabrics/FabricsJacket/02.3716.19.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.19.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.19.jpg" },
        { id: "texture-8", name: "Coffee Roast", value: "/fabrics/FabricsJacket/02.3716.20.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.20.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.20.jpg" },
        { id: "texture-9", name: "Blue Graphite", value: "/fabrics/FabricsJacket/02.3716.26.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.26.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.26.jpg" },
        { id: "texture-10", name: "Coffee Bean", value: "/fabrics/FabricsJacket/02.3716.28.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.28.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.28.jpg" },
        { id: "texture-11", name: "Carbon Grey", value: "/fabrics/FabricsJacket/02.3716.31.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.31.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.31.jpg" },
        { id: "texture-12", name: "Golden Khaki", value: "/fabrics/FabricsJacket/02.3716.32.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.32.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.32.jpg" },
        { id: "texture-13", name: "Cinnamon Rust", value: "/fabrics/FabricsJacket/02.3716.34.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.34.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.34.jpg" },
        { id: "texture-14", name: "Graphite Brown", value: "/fabrics/FabricsJacket/02.3716.39.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.39.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.39.jpg" },
        { id: "texture-15", name: "Dusty Olive", value: "/fabrics/FabricsJacket/02.3716.41.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.41.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.41.jpg" },
        { id: "texture-16", name: "Shadow Black", value: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg" },
        { id: "texture-17", name: "Deep Navy", value: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg" },
        { id: "texture-18", name: "Midnight Blue", value: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg" },
        { id: "texture-19", name: "Slate Grey", value: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg" },
        { id: "texture-20", name: "Ocean Blue", value: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg" },
      ],
    },
    {
      id: "jacket-lining-selection",
      name: "Jacket Lining",
      type: "custom" as const,
      category: "interior",
      customComponent: "lining-selection",
      values: [
        { 
          id: "standard", 
          name: "Standard Lining", 
          value: "standard", 
          price: 0,
          thumbnail: "/placeholder.svg?height=50&width=50"
        },
        { 
          id: "custom", 
          name: "Custom Lining", 
          value: "custom", 
          price: 0,
          thumbnail: "/images/lining/116_normal.jpg"
        },
        { 
          id: "none", 
          name: "No Lining", 
          value: "none", 
          price: -15,
          thumbnail: "/placeholder.svg?height=50&width=50"
        },
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
        { id: "no-pocket", name: "No Pocket", value: "no-pocket", price: 0, thumbnail: "/images/jacket-configuration/chest-pocket/nopocket.png" },
        { id: "piping-pocket", name: "Welt Chest Pocket", value: "piping-pocket", price: 0, thumbnail: "/images/jacket-configuration/chest-pocket/pipingpocket.png" },
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
        { id: "standard", name: "Standard Matching", value: "standard", price: 0, color: "standard" },
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
  "pants-001": [
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
        // Fabric texture options from public/fabrics/FabricsJacket folder
        { id: "texture-1", name: "Jet Black", value: "/fabrics/FabricsJacket/02.3716.01.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.01.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.01.jpg" },
        { id: "texture-2", name: "Midnight Plum", value: "/fabrics/FabricsJacket/02.3716.05.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.05.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.05.jpg" },
        { id: "texture-3", name: "Urban Grey", value: "/fabrics/FabricsJacket/02.3716.07.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.07.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.07.jpg" },
        { id: "texture-4", name: "Indigo Night", value: "/fabrics/FabricsJacket/02.3716.13.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.13.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.13.jpg" },
        { id: "texture-5", name: "Royal Navy", value: "/fabrics/FabricsJacket/02.3716.15.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.15.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.15.jpg" },
        { id: "texture-6", name: "Warm Almond", value: "/fabrics/FabricsJacket/02.3716.17.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.17.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.17.jpg" },
        { id: "texture-7", name: "Mocha Taupe", value: "/fabrics/FabricsJacket/02.3716.19.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.19.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.19.jpg" },
        { id: "texture-8", name: "Coffee Roast", value: "/fabrics/FabricsJacket/02.3716.20.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.20.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.20.jpg" },
        { id: "texture-9", name: "Blue Graphite", value: "/fabrics/FabricsJacket/02.3716.26.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.26.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.26.jpg" },
        { id: "texture-10", name: "Coffee Bean", value: "/fabrics/FabricsJacket/02.3716.28.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.28.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.28.jpg" },
        { id: "texture-11", name: "Carbon Grey", value: "/fabrics/FabricsJacket/02.3716.31.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.31.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.31.jpg" },
        { id: "texture-12", name: "Golden Khaki", value: "/fabrics/FabricsJacket/02.3716.32.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.32.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.32.jpg" },
        { id: "texture-13", name: "Cinnamon Rust", value: "/fabrics/FabricsJacket/02.3716.34.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.34.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.34.jpg" },
        { id: "texture-14", name: "Graphite Brown", value: "/fabrics/FabricsJacket/02.3716.39.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.39.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.39.jpg" },
        { id: "texture-15", name: "Dusty Olive", value: "/fabrics/FabricsJacket/02.3716.41.jpg", price: 15, color: "/fabrics/FabricsJacket/02.3716.41.jpg", thumbnail: "/fabrics/FabricsJacket/02.3716.41.jpg" },
        { id: "texture-16", name: "Shadow Black", value: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg" },
        { id: "texture-17", name: "Deep Navy", value: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg" },
        { id: "texture-18", name: "Midnight Blue", value: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg" },
        { id: "texture-19", name: "Slate Grey", value: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg" },
        { id: "texture-20", name: "Ocean Blue", value: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg" },
      ],
    },
    {
      id: "front-style",
      name: "Front Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "flat-front", name: "Flat Front", value: "flat-front", price: 0, thumbnail: "/images/Pants/Styles/Flat.jpg" },
        { id: "one-pleat", name: "One Front Pleat", value: "one-pleat", price: 15, thumbnail: "/images/Pants/Styles/1Pleat.jpg" },
        { id: "two-pleats", name: "Two Front Pleats", value: "two-pleats", price: 25, thumbnail: "/images/Pants/Styles/2Pleat.jpg" },
      ],
    },
    {
      id: "front-pocket",
      name: "Front Pocket",
      type: "component" as const,
      category: "style",
      values: [
        { id: "slanted-pockets", name: "Slanted Pockets", value: "slanted-pockets", price: 0, thumbnail: "/images/Pants/FrontPocket/Slanted.jpg" },
        { id: "seam-pockets", name: "Seam Pockets", value: "seam-pockets", price: 10, thumbnail: "/images/Pants/FrontPocket/Seam.jpg" },
        { id: "jeans-pockets", name: "Jeans Style Pockets", value: "jeans-pockets", price: 15, thumbnail: "/images/Pants/FrontPocket/Jeans.jpg" },
      ],
    },
    {
      id: "back-pocket",
      name: "Back Pocket",
      type: "component" as const,
      category: "style",
      values: [
        { id: "buttoned-welt", name: "Buttoned Welt Pocket", value: "buttoned-welt", price: 0, thumbnail: "/images/Pants/BackPocket/ButtonedWelt.jpg" },
        { id: "welt-with-zipper", name: "Welt Pocket with Zipper", value: "welt-with-zipper", price: 5, thumbnail: "/images/Pants/BackPocket/WeltZipPocket.jpg" },
        { id: "flap-pocket", name: "Flap Pocket", value: "flap-pocket", price: 10, thumbnail: "/images/Pants/BackPocket/Flap.jpg" },
        { id: "patch-pocket", name: "Patch Pocket", value: "patch-pocket", price: 15, thumbnail: "/images/Pants/BackPocket/Patch.jpg" },
      ],
    },
    {
      id: "bottom-cuffs",
      name: "Bottom Cuffs",
      type: "component" as const,
      category: "style",
      values: [
        { id: "turn-ups", name: "Turn Ups", value: "turn-ups", price: 10, thumbnail: "/images/Pants/BottomCuffs/TurnUps.jpg" },
        { id: "straight-hem", name: "Straight Hem", value: "straight-hem", price: 0, thumbnail: "/images/Pants/BottomCuffs/StraightHem.jpg" },
      ],
    },
    {
      id: "waist-band-extension",
      name: "Waist Band Extension",
      type: "component" as const,
      category: "style",
      values: [
        { id: "no-extension", name: "No Extension", value: "no-extension", price: 0, thumbnail: "/images/Pants/Styles/Flat.jpg" },
        { id: "with-extension", name: "With Extension", value: "with-extension", price: 20, thumbnail: "/images/Pants/WaistBandExtension/WaistBandExtension.jpg" },
      ],
    },
    {
      id: "button-color",
      name: "Button Color",
      type: "color" as const,
      category: "details",
      values: [
        { id: "standard", name: "Standard Matching", value: "standard", price: 0, color: "standard" },
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
  ],
}
