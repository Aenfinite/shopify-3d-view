export interface CustomizationOption {
  id: string
  name: string
  type: "color" | "texture" | "component" | "custom"
  category: string
  customComponent?: string
  values: {
    id: string
    name: string
    value: string
    price: number
    thumbnail?: string
    color?: string
    /** Tags a fabric-color swatch with its material type (cotton | linen | polyester).
     *  Used by getFilteredColors to show only the relevant swatches when a fabric-type
     *  category is chosen on the product page. Omit = always visible in any type. */
    fabricType?: "cotton" | "linen" | "polyester"
    layerControls?: {
      show: string[]
      hide: string[]
    }
  }[]
}

export const SAMPLE_PRODUCTS_WITH_CUSTOMIZATION = {
  "shirt-001": [
    {
      id: "fabric-type",
      name: "Select Fabric Type",
      type: "texture" as const,
      category: "fabric",
      values: [
        { id: "cotton", name: "Cotton (Poplin)", value: "cotton", price: 0, thumbnail: "/fabrics/FabricsShirt/2215-1 white.jpeg" },
        { id: "linen",  name: "Linen",           value: "linen",  price: 0, thumbnail: "/fabrics/FabricsShirt/2215-2 sand.jpeg" },
        { id: "polyester", name: "Polyester",    value: "polyester", price: 0, thumbnail: "/fabrics/FabricsShirt/2215-5 sage.png" },
      ],
    },
    {
      id: "fabric-color",
      name: "Fabric",
      type: "color" as const,
      category: "fabric",
      values: [
        { id: "white",     name: "White",      value: "/fabrics/FabricsShirt/2215-1 white.jpeg",              price: 0, color: "/fabrics/FabricsShirt/2215-1 white.jpeg",              thumbnail: "/fabrics/FabricsShirt/2215-1 white.jpeg",              fabricType: "cotton" },
        { id: "sand",      name: "Sand",       value: "/fabrics/FabricsShirt/2215-2 sand.jpeg",               price: 0, color: "/fabrics/FabricsShirt/2215-2 sand.jpeg",               thumbnail: "/fabrics/FabricsShirt/2215-2 sand.jpeg",               fabricType: "cotton" },
        { id: "coral",     name: "Coral",      value: "/fabrics/FabricsShirt/2215-3 coral.png",               price: 5, color: "/fabrics/FabricsShirt/2215-3 coral.png",               thumbnail: "/fabrics/FabricsShirt/2215-3 coral.png",               fabricType: "cotton" },
        { id: "ice-blue",  name: "Ice Blue",   value: "/fabrics/FabricsShirt/2215-4 light oxford blue.png",   price: 0, color: "/fabrics/FabricsShirt/2215-4 light oxford blue.png",   thumbnail: "/fabrics/FabricsShirt/2215-4 light oxford blue.png",   fabricType: "cotton" },
        { id: "sage",      name: "Sage",       value: "/fabrics/FabricsShirt/2215-5 sage.png",               price: 5, color: "/fabrics/FabricsShirt/2215-5 sage.png",               thumbnail: "/fabrics/FabricsShirt/2215-5 sage.png",               fabricType: "cotton" },
        { id: "ink",       name: "Ink",        value: "/fabrics/FabricsShirt/2215-8 ink.png",                price: 5, color: "/fabrics/FabricsShirt/2215-8 ink.png",                thumbnail: "/fabrics/FabricsShirt/2215-8 ink.png",                fabricType: "cotton" },
        { id: "dune",      name: "Dune",       value: "/fabrics/FabricsShirt/2215 dune.png",                 price: 0, color: "/fabrics/FabricsShirt/2215 dune.png",                 thumbnail: "/fabrics/FabricsShirt/2215 dune.png",                 fabricType: "cotton" },
        { id: "dust-blue", name: "Dust Blue",  value: "/fabrics/FabricsShirt/2215-17 powder blue.png",       price: 0, color: "/fabrics/FabricsShirt/2215-17 powder blue.png",       thumbnail: "/fabrics/FabricsShirt/2215-17 powder blue.png",       fabricType: "cotton" },
        { id: "mauve",     name: "Mauve",      value: "/fabrics/FabricsShirt/2215-18 mauve.png",             price: 5, color: "/fabrics/FabricsShirt/2215-18 mauve.png",             thumbnail: "/fabrics/FabricsShirt/2215-18 mauve.png",             fabricType: "linen"  },
        { id: "dust",      name: "Dust",       value: "/fabrics/FabricsShirt/2215-19 stone.png",             price: 0, color: "/fabrics/FabricsShirt/2215-19 stone.png",             thumbnail: "/fabrics/FabricsShirt/2215-19 stone.png",             fabricType: "linen"  },
        { id: "slate",     name: "Slate",      value: "/fabrics/FabricsShirt/2215-22 slate.png",             price: 5, color: "/fabrics/FabricsShirt/2215-22 slate.png",             thumbnail: "/fabrics/FabricsShirt/2215-22 slate.png",             fabricType: "linen"  },
        { id: "steel",     name: "Steel",      value: "/fabrics/FabricsShirt/2215-7 teal.png",               price: 5, color: "/fabrics/FabricsShirt/2215-7 teal.png",               thumbnail: "/fabrics/FabricsShirt/2215-7 teal.png",               fabricType: "linen"  },
        { id: "honey",     name: "Honey",      value: "/fabrics/FabricsShirt/2215 honey.png",                price: 5, color: "/fabrics/FabricsShirt/2215 honey.png",                thumbnail: "/fabrics/FabricsShirt/2215 honey.png",                fabricType: "polyester" },
        { id: "amber",     name: "Amber",      value: "/fabrics/FabricsShirt/2215-23 amber.png",             price: 5, color: "/fabrics/FabricsShirt/2215-23 amber.png",             thumbnail: "/fabrics/FabricsShirt/2215-23 amber.png",             fabricType: "polyester" },
        { id: "navy",      name: "Navy",       value: "/fabrics/FabricsShirt/24.png",                        price: 5, color: "/fabrics/FabricsShirt/24.png",                        thumbnail: "/fabrics/FabricsShirt/24.png",                        fabricType: "polyester" },
      ],
    },
    {
      id: "sleeve-style",
      name: "Sleeve Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "full-sleeve", name: "Full Sleeves", value: "full-sleeve", price: 0 },
        { id: "half-sleeve", name: "Half Sleeves", value: "half-sleeve", price: 0 },
      ],
    },
    {
      id: "collar-style",
      name: "Collar Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "kent-collar", name: "Kent Collar", value: "kent-collar", price: 0 },
        { id: "button-down-collar", name: "Button Down Collar", value: "button-down-collar", price: 5 },
        { id: "spread-collar", name: "Spread Collar", value: "spread-collar", price: 0 },
      ],
    },
    {
      id: "cuff-style",
      name: "Cuff Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "rounded-cuff-2-buttons", name: "Rounded Cuff 2 Buttons", value: "rounded-cuff-2-buttons", price: 0 },
        { id: "square-cuff-2-buttons", name: "Square Cuff 2 Buttons", value: "square-cuff-2-buttons", price: 0 },
      ],
    },
    {
      id: "shirt-chest-pocket",
      name: "Chest Pocket",
      type: "component" as const,
      category: "style",
      values: [
        { id: "no-pocket", name: "No Chest Pocket", value: "no-pocket", price: 0 },
        { id: "chest-pocket", name: "Chest Pocket", value: "chest-pocket", price: 5 },
      ],
    },
    {
      id: "front-placket",
      name: "Front Design",
      type: "component" as const,
      category: "style",
      values: [
        { id: "box-placket", name: "Box Placket", value: "box-placket", price: 0 },
        { id: "french-placket", name: "French Placket", value: "french-placket", price: 0 },
      ],
    },
    {
      id: "collar-cuff-contrast",
      name: "Collar & Cuff Contrast",
      type: "component" as const,
      category: "style",
      values: [
        { id: "no-contrast", name: "No", value: "no", price: 0 },
        { id: "yes-contrast", name: "Yes", value: "yes", price: 15 },
      ],
    },
    {
      id: "contrast-collar-texture",
      name: "Collar Contrast Fabric",
      type: "color" as const,
      category: "style",
      values: [
        { id: "none",  name: "None",   value: "none",   price: 0 },
        { id: "cf-01", name: "Floral", value: "/fabrics/ContrastFabric/image.png", price: 0, color: "/fabrics/ContrastFabric/image.png", thumbnail: "/fabrics/ContrastFabric/image.png" },
      ],
    },
    {
      id: "contrast-cuff-texture",
      name: "Cuff Contrast Fabric",
      type: "color" as const,
      category: "style",
      values: [
        { id: "none",  name: "None",   value: "none",   price: 0 },
        { id: "cf-01", name: "Floral", value: "/fabrics/ContrastFabric/image.png", price: 0, color: "/fabrics/ContrastFabric/image.png", thumbnail: "/fabrics/ContrastFabric/image.png" },
      ],
    },
    {
      id: "button-color",
      name: "Button Color",
      type: "color" as const,
      category: "details",
      values: [
        { id: "standard", name: "Standard", value: "standard", price: 0 },
        { id: "gold", name: "Gold", value: "#FFD700", price: 0, color: "#FFD700" },
        { id: "silver", name: "Silver", value: "#C0C0C0", price: 0, color: "#C0C0C0" },
        { id: "copper", name: "Copper", value: "#B87333", price: 0, color: "#B87333" },
        { id: "bronze", name: "Bronze", value: "#CD7F32", price: 0, color: "#CD7F32" },
        { id: "pewter", name: "Pewter", value: "#96A8A1", price: 0, color: "#96A8A1" },
      ],
    },
    {
      id: "shirt-monogram-position",
      name: "Monogram Placement",
      type: "component" as const,
      category: "details",
      values: [
        { id: "no-monogram", name: "No Monogram",  value: "no-monogram", price: 0 },
        { id: "mg-rightcuff", name: "Right Cuff",   value: "mg-rightcuff", price: 10, thumbnail: "/images/monogram/mg-rightcuff.png" },
        { id: "mg-leftcuff",  name: "Left Cuff",    value: "mg-leftcuff",  price: 10, thumbnail: "/images/monogram/mg-leftcuff.png" },
        { id: "mg-bottom",    name: "Shirt Bottom", value: "mg-bottom",    price: 10, thumbnail: "/images/monogram/mg-bottom.png" },
        { id: "mg-pocket",    name: "Chest Pocket", value: "mg-pocket",    price: 10, thumbnail: "/images/monogram/mg-pocket.png" },
      ],
    },
    {
      id: "shirt-monogram-text",
      name: "Monogram Text",
      type: "custom" as const,
      category: "details",
      customComponent: "shirt-monogram-text",
      values: [],
    },
    {
      id: "shirt-monogram-color",
      name: "Monogram Thread Color",
      type: "color" as const,
      category: "details",
      values: [
        { id: "navy",     name: "Navy",     value: "#1e3a8a", price: 0, color: "#1e3a8a" },
        { id: "white",    name: "White",    value: "#f5f5f0", price: 0, color: "#f5f5f0" },
        { id: "gold",     name: "Gold",     value: "#D4AF37", price: 0, color: "#D4AF37" },
        { id: "silver",   name: "Silver",   value: "#A8A9AD", price: 0, color: "#A8A9AD" },
        { id: "red",      name: "Red",      value: "#CC2222", price: 0, color: "#CC2222" },
        { id: "black",    name: "Black",    value: "#1a1a1a", price: 0, color: "#1a1a1a" },
        { id: "burgundy", name: "Burgundy", value: "#800020", price: 0, color: "#800020" },
      ],
    },
  ],
  "bespoke-shirt": [
    {
      id: "fabric-type",
      name: "Select Fabric Type",
      type: "texture" as const,
      category: "fabric",
      values: [
        { id: "cotton", name: "Cotton (Poplin)", value: "cotton", price: 0, thumbnail: "/fabrics/FabricsShirt/2215-1 white.jpeg" },
        { id: "linen",  name: "Linen",           value: "linen",  price: 0, thumbnail: "/fabrics/FabricsShirt/2215-2 sand.jpeg" },
        { id: "polyester", name: "Polyester",    value: "polyester", price: 0, thumbnail: "/fabrics/FabricsShirt/2215 honey.png" },
      ],
    },
    {
      id: "fabric-color",
      name: "Fabric",
      type: "color" as const,
      category: "fabric",
      values: [
        { id: "white",     name: "White",      value: "/fabrics/FabricsShirt/2215-1 white.jpeg",              price: 0, color: "/fabrics/FabricsShirt/2215-1 white.jpeg",              thumbnail: "/fabrics/FabricsShirt/2215-1 white.jpeg",              fabricType: "cotton" },
        { id: "sand",      name: "Sand",       value: "/fabrics/FabricsShirt/2215-2 sand.jpeg",               price: 0, color: "/fabrics/FabricsShirt/2215-2 sand.jpeg",               thumbnail: "/fabrics/FabricsShirt/2215-2 sand.jpeg",               fabricType: "cotton" },
        { id: "coral",     name: "Coral",      value: "/fabrics/FabricsShirt/2215-3 coral.png",               price: 5, color: "/fabrics/FabricsShirt/2215-3 coral.png",               thumbnail: "/fabrics/FabricsShirt/2215-3 coral.png",               fabricType: "cotton" },
        { id: "ice-blue",  name: "Ice Blue",   value: "/fabrics/FabricsShirt/2215-4 light oxford blue.png",   price: 0, color: "/fabrics/FabricsShirt/2215-4 light oxford blue.png",   thumbnail: "/fabrics/FabricsShirt/2215-4 light oxford blue.png",   fabricType: "cotton" },
        { id: "sage",      name: "Sage",       value: "/fabrics/FabricsShirt/2215-5 sage.png",               price: 5, color: "/fabrics/FabricsShirt/2215-5 sage.png",               thumbnail: "/fabrics/FabricsShirt/2215-5 sage.png",               fabricType: "cotton" },
        { id: "ink",       name: "Ink",        value: "/fabrics/FabricsShirt/2215-8 ink.png",                price: 5, color: "/fabrics/FabricsShirt/2215-8 ink.png",                thumbnail: "/fabrics/FabricsShirt/2215-8 ink.png",                fabricType: "cotton" },
        { id: "dune",      name: "Dune",       value: "/fabrics/FabricsShirt/2215 dune.png",                 price: 0, color: "/fabrics/FabricsShirt/2215 dune.png",                 thumbnail: "/fabrics/FabricsShirt/2215 dune.png",                 fabricType: "cotton" },
        { id: "dust-blue", name: "Dust Blue",  value: "/fabrics/FabricsShirt/2215-17 powder blue.png",       price: 0, color: "/fabrics/FabricsShirt/2215-17 powder blue.png",       thumbnail: "/fabrics/FabricsShirt/2215-17 powder blue.png",       fabricType: "cotton" },
        { id: "mauve",     name: "Mauve",      value: "/fabrics/FabricsShirt/2215-18 mauve.png",             price: 5, color: "/fabrics/FabricsShirt/2215-18 mauve.png",             thumbnail: "/fabrics/FabricsShirt/2215-18 mauve.png",             fabricType: "linen"  },
        { id: "dust",      name: "Dust",       value: "/fabrics/FabricsShirt/2215-19 stone.png",             price: 0, color: "/fabrics/FabricsShirt/2215-19 stone.png",             thumbnail: "/fabrics/FabricsShirt/2215-19 stone.png",             fabricType: "linen"  },
        { id: "slate",     name: "Slate",      value: "/fabrics/FabricsShirt/2215-22 slate.png",             price: 5, color: "/fabrics/FabricsShirt/2215-22 slate.png",             thumbnail: "/fabrics/FabricsShirt/2215-22 slate.png",             fabricType: "linen"  },
        { id: "steel",     name: "Steel",      value: "/fabrics/FabricsShirt/2215-7 teal.png",               price: 5, color: "/fabrics/FabricsShirt/2215-7 teal.png",               thumbnail: "/fabrics/FabricsShirt/2215-7 teal.png",               fabricType: "linen"  },
        { id: "honey",     name: "Honey",      value: "/fabrics/FabricsShirt/2215 honey.png",                price: 5, color: "/fabrics/FabricsShirt/2215 honey.png",                thumbnail: "/fabrics/FabricsShirt/2215 honey.png",                fabricType: "polyester" },
        { id: "amber",     name: "Amber",      value: "/fabrics/FabricsShirt/2215-23 amber.png",             price: 5, color: "/fabrics/FabricsShirt/2215-23 amber.png",             thumbnail: "/fabrics/FabricsShirt/2215-23 amber.png",             fabricType: "polyester" },
      ],
    },
    {
      id: "sleeve-style",
      name: "Sleeve Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "full-sleeve", name: "Full Sleeves", value: "full-sleeve", price: 0 },
        { id: "half-sleeve", name: "Half Sleeves", value: "half-sleeve", price: 0 },
      ],
    },
    {
      id: "collar-style",
      name: "Collar Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "kent-collar", name: "Kent Collar", value: "kent-collar", price: 0 },
        { id: "button-down-collar", name: "Button Down Collar", value: "button-down-collar", price: 5 },
        { id: "spread-collar", name: "Spread Collar", value: "spread-collar", price: 0 },
      ],
    },
    {
      id: "cuff-style",
      name: "Cuff Style",
      type: "component" as const,
      category: "style",
      values: [
        { id: "rounded-cuff-2-buttons", name: "Rounded Cuff 2 Buttons", value: "rounded-cuff-2-buttons", price: 0 },
        { id: "square-cuff-2-buttons", name: "Square Cuff 2 Buttons", value: "square-cuff-2-buttons", price: 0 },
      ],
    },
    {
      id: "shirt-chest-pocket",
      name: "Chest Pocket",
      type: "component" as const,
      category: "style",
      values: [
        { id: "no-pocket", name: "No Chest Pocket", value: "no-pocket", price: 0 },
        { id: "chest-pocket", name: "Chest Pocket", value: "chest-pocket", price: 5 },
      ],
    },
    {
      id: "front-placket",
      name: "Front Design",
      type: "component" as const,
      category: "style",
      values: [
        { id: "box-placket", name: "Box Placket", value: "box-placket", price: 0 },
        { id: "french-placket", name: "French Placket", value: "french-placket", price: 0 },
      ],
    },
    {
      id: "collar-cuff-contrast",
      name: "Collar & Cuff Contrast",
      type: "component" as const,
      category: "style",
      values: [
        { id: "no-contrast", name: "No", value: "no", price: 0 },
        { id: "yes-contrast", name: "Yes", value: "yes", price: 15 },
      ],
    },
    {
      id: "contrast-collar-texture",
      name: "Collar Contrast Fabric",
      type: "color" as const,
      category: "style",
      values: [
        { id: "none",  name: "None",   value: "none",   price: 0 },
        { id: "cf-01", name: "Floral", value: "/fabrics/ContrastFabric/image.png", price: 0, color: "/fabrics/ContrastFabric/image.png", thumbnail: "/fabrics/ContrastFabric/image.png" },
      ],
    },
    {
      id: "contrast-cuff-texture",
      name: "Cuff Contrast Fabric",
      type: "color" as const,
      category: "style",
      values: [
        { id: "none",  name: "None",   value: "none",   price: 0 },
        { id: "cf-01", name: "Floral", value: "/fabrics/ContrastFabric/image.png", price: 0, color: "/fabrics/ContrastFabric/image.png", thumbnail: "/fabrics/ContrastFabric/image.png" },
      ],
    },
    {
      id: "button-color",
      name: "Button Color",
      type: "color" as const,
      category: "details",
      values: [
        { id: "standard", name: "Standard", value: "standard", price: 0 },
        { id: "gold", name: "Gold", value: "#FFD700", price: 0, color: "#FFD700" },
        { id: "silver", name: "Silver", value: "#C0C0C0", price: 0, color: "#C0C0C0" },
        { id: "copper", name: "Copper", value: "#B87333", price: 0, color: "#B87333" },
        { id: "bronze", name: "Bronze", value: "#CD7F32", price: 0, color: "#CD7F32" },
        { id: "pewter", name: "Pewter", value: "#96A8A1", price: 0, color: "#96A8A1" },
      ],
    },
    {
      id: "shirt-monogram-position",
      name: "Monogram Placement",
      type: "component" as const,
      category: "details",
      values: [
        { id: "no-monogram", name: "No Monogram",  value: "no-monogram", price: 0 },
        { id: "mg-rightcuff", name: "Right Cuff",   value: "mg-rightcuff", price: 10, thumbnail: "/images/monogram/mg-rightcuff.png" },
        { id: "mg-leftcuff",  name: "Left Cuff",    value: "mg-leftcuff",  price: 10, thumbnail: "/images/monogram/mg-leftcuff.png" },
        { id: "mg-bottom",    name: "Shirt Bottom", value: "mg-bottom",    price: 10, thumbnail: "/images/monogram/mg-bottom.png" },
        { id: "mg-pocket",    name: "Chest Pocket", value: "mg-pocket",    price: 10, thumbnail: "/images/monogram/mg-pocket.png" },
      ],
    },
    {
      id: "shirt-monogram-text",
      name: "Monogram Text",
      type: "custom" as const,
      category: "details",
      customComponent: "shirt-monogram-text",
      values: [],
    },
    {
      id: "shirt-monogram-color",
      name: "Monogram Thread Color",
      type: "color" as const,
      category: "details",
      values: [
        { id: "navy",     name: "Navy",     value: "#1e3a8a", price: 0, color: "#1e3a8a" },
        { id: "white",    name: "White",    value: "#f5f5f0", price: 0, color: "#f5f5f0" },
        { id: "gold",     name: "Gold",     value: "#D4AF37", price: 0, color: "#D4AF37" },
        { id: "silver",   name: "Silver",   value: "#A8A9AD", price: 0, color: "#A8A9AD" },
        { id: "red",      name: "Red",      value: "#CC2222", price: 0, color: "#CC2222" },
        { id: "black",    name: "Black",    value: "#1a1a1a", price: 0, color: "#1a1a1a" },
        { id: "burgundy", name: "Burgundy", value: "#800020", price: 0, color: "#800020" },
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
          id: "polyester",
          name: "Poly Visc Performance",
          value: "polyester",
          price: 0,
          thumbnail: "/fabrics/FabricsJacket/02.3716.01.jpg"
        },
        {
          id: "linen",
          name: "Merino Wool / Lycra",
          value: "linen",
          price: 50,
          thumbnail: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg"
        },
        {
          id: "cotton",
          name: "Premium Wool/Poly",
          value: "cotton",
          price: 50,
          thumbnail: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg"
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
        { id: "texture-1",  name: "Jet Black",      value: "/fabrics/FabricsJacket/02.3716.01.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.01.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.01.jpg",           fabricType: "polyester" },
        { id: "texture-2",  name: "Midnight Plum",  value: "/fabrics/FabricsJacket/02.3716.05.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.05.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.05.jpg",           fabricType: "polyester" },
        { id: "texture-3",  name: "Urban Grey",     value: "/fabrics/FabricsJacket/02.3716.07.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.07.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.07.jpg",           fabricType: "polyester" },
        { id: "texture-4",  name: "Indigo Night",   value: "/fabrics/FabricsJacket/02.3716.13.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.13.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.13.jpg",           fabricType: "polyester" },
        { id: "texture-5",  name: "Royal Navy",     value: "/fabrics/FabricsJacket/02.3716.15.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.15.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.15.jpg",           fabricType: "polyester" },
        { id: "texture-6",  name: "Warm Almond",    value: "/fabrics/FabricsJacket/02.3716.17.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.17.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.17.jpg",           fabricType: "polyester" },
        { id: "texture-7",  name: "Mocha Taupe",    value: "/fabrics/FabricsJacket/02.3716.19.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.19.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.19.jpg",           fabricType: "polyester" },
        { id: "texture-8",  name: "Coffee Roast",   value: "/fabrics/FabricsJacket/02.3716.20.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.20.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.20.jpg",           fabricType: "polyester" },
        { id: "texture-9",  name: "Blue Graphite",  value: "/fabrics/FabricsJacket/02.3716.26.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.26.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.26.jpg",           fabricType: "polyester" },
        { id: "texture-10", name: "Coffee Bean",    value: "/fabrics/FabricsJacket/02.3716.28.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.28.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.28.jpg",           fabricType: "polyester" },
        { id: "texture-11", name: "Carbon Grey",    value: "/fabrics/FabricsJacket/02.3716.31.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.31.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.31.jpg",           fabricType: "polyester" },
        { id: "texture-12", name: "Golden Khaki",   value: "/fabrics/FabricsJacket/02.3716.32.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.32.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.32.jpg",           fabricType: "polyester" },
        { id: "texture-13", name: "Cinnamon Rust",  value: "/fabrics/FabricsJacket/02.3716.34.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.34.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.34.jpg",           fabricType: "polyester" },
        { id: "texture-14", name: "Graphite Brown", value: "/fabrics/FabricsJacket/02.3716.39.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.39.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.39.jpg",           fabricType: "polyester" },
        { id: "texture-15", name: "Dusty Olive",    value: "/fabrics/FabricsJacket/02.3716.41.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.41.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.41.jpg",           fabricType: "polyester" },
        { id: "texture-16", name: "Shadow Black",   value: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg", fabricType: "linen"     },
        { id: "texture-17", name: "Deep Navy",      value: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg", fabricType: "linen"     },
        { id: "texture-18", name: "Midnight Blue",  value: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg", fabricType: "cotton"    },
        { id: "texture-19", name: "Slate Grey",     value: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg", fabricType: "cotton"    },
        { id: "texture-20", name: "Ocean Blue",     value: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg", fabricType: "cotton"    },
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
          id: "unlined",
          name: "Unlined",
          value: "unlined",
          price: 0,
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
        { id: "2x3-buttons", name: "Double-breasted", value: "2x3-buttons", price: 25, thumbnail: "/images/jacket-configuration/front-style/2x3buttons.png" },
      ],
    },
    {
      id: "front-pocket",
      name: "Front Pocket",
      type: "component" as const,
      category: "style",
      values: [
        { id: "flap-pocket", name: "Flap Pocket", value: "flap-pocket", price: 0, thumbnail: "/images/jacket-configuration/front-pocket/flap-pocket.png" },
        { id: "patch-pocket", name: "Patch Pocket", value: "patch-pocket", price: 10, thumbnail: "/images/jacket-configuration/front-pocket/patch-pocket.png" },
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
        { id: "no-vent", name: "No Vent", value: "no-vent", price: 0, thumbnail: "/images/jacket-configuration/back-vent/onebackvent.png" },
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
        { id: "standard", name: "Standard", value: "standard", price: 0, color: "standard" },
        { id: "natural", name: "Natural", value: "#F5E6D3", price: 0, color: "#F5E6D3" },
        { id: "dark-brown", name: "Dark Brown", value: "#4A2C2A", price: 0, color: "#4A2C2A" },
        { id: "black", name: "Black", value: "#1A1A1A", price: 0, color: "#1A1A1A" },
        { id: "navy", name: "Navy", value: "#1a3055", price: 0, color: "#1a3055" },
        { id: "gold", name: "Gold", value: "#FFD700", price: 0, color: "#FFD700" },
        { id: "silver", name: "Silver", value: "#C0C0C0", price: 0, color: "#C0C0C0" },
        { id: "bronze", name: "Bronze", value: "#CD7F32", price: 0, color: "#CD7F32" },
        { id: "pearl-white", name: "Pearl White", value: "#F8F8FF", price: 0, color: "#F8F8FF" },
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
      id: "fabric-type",
      name: "Select Fabric Type",
      type: "texture" as const,
      category: "fabric",
      values: [
        { id: "cotton",    name: "Super 120s Wool",  value: "cotton",    price: 0   },
        { id: "linen",     name: "Super 150s Wool",  value: "linen",     price: 200 },
        { id: "polyester", name: "Mohair Blend",     value: "polyester", price: 150 },
      ],
    },
    {
      id: "fabric-color",
      name: "Suit Fabric Color",
      type: "color" as const,
      category: "fabric",
      values: [
        { id: "navy",         name: "Navy",         value: "#1565C0", price: 0,  color: "#1565C0", fabricType: "cotton"    },
        { id: "charcoal",     name: "Charcoal",     value: "#424242", price: 0,  color: "#424242", fabricType: "cotton"    },
        { id: "black",        name: "Black",        value: "#000000", price: 15, color: "#000000", fabricType: "linen"     },
        { id: "grey",         name: "Light Grey",   value: "#9E9E9E", price: 10, color: "#9E9E9E", fabricType: "linen"     },
        { id: "pinstripe-navy", name: "Navy Pinstripe", value: "#1565C0", price: 50, color: "#1565C0", fabricType: "polyester" },
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
      id: "fabric-type",
      name: "Select Fabric Type",
      type: "texture" as const,
      category: "fabric",
      values: [
        { id: "cotton",    name: "Cotton (Poplin)", value: "cotton",    price: 0 },
        { id: "linen",     name: "Linen",           value: "linen",     price: 0 },
        { id: "polyester", name: "Polyester",       value: "polyester", price: 0 },
      ],
    },
    {
      id: "fabric-color",
      name: "Blazer Color",
      type: "color" as const,
      category: "fabric",
      values: [
        { id: "navy",     name: "Navy Blazer",   value: "#1565C0", price: 0,  color: "#1565C0", fabricType: "cotton"    },
        { id: "forest",   name: "Forest Green",  value: "#2E7D32", price: 10, color: "#2E7D32", fabricType: "cotton"    },
        { id: "burgundy", name: "Burgundy",       value: "#8E24AA", price: 15, color: "#8E24AA", fabricType: "linen"     },
        { id: "camel",    name: "Camel",          value: "#D2691E", price: 20, color: "#D2691E", fabricType: "polyester" },
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
          name: "Poly Visc Performance",
          value: "wool-blend",
          price: 0,
          thumbnail: "/fabrics/FabricsJacket/02.3716.01.jpg"
        },
        {
          id: "linen",
          name: "Merino Wool / Lycra",
          value: "linen",
          price: 50,
          thumbnail: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg"
        },
        {
          id: "cotton",
          name: "Premium Wool/Poly",
          value: "cotton",
          price: 50,
          thumbnail: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg"
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
        { id: "texture-1",  name: "Jet Black",      value: "/fabrics/FabricsJacket/02.3716.01.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.01.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.01.jpg",           fabricType: "wool-blend" },
        { id: "texture-2",  name: "Midnight Plum",  value: "/fabrics/FabricsJacket/02.3716.05.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.05.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.05.jpg",           fabricType: "wool-blend" },
        { id: "texture-3",  name: "Urban Grey",     value: "/fabrics/FabricsJacket/02.3716.07.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.07.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.07.jpg",           fabricType: "wool-blend" },
        { id: "texture-4",  name: "Indigo Night",   value: "/fabrics/FabricsJacket/02.3716.13.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.13.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.13.jpg",           fabricType: "wool-blend" },
        { id: "texture-5",  name: "Royal Navy",     value: "/fabrics/FabricsJacket/02.3716.15.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.15.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.15.jpg",           fabricType: "wool-blend" },
        { id: "texture-6",  name: "Warm Almond",    value: "/fabrics/FabricsJacket/02.3716.17.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.17.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.17.jpg",           fabricType: "wool-blend" },
        { id: "texture-7",  name: "Mocha Taupe",    value: "/fabrics/FabricsJacket/02.3716.19.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.19.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.19.jpg",           fabricType: "wool-blend" },
        { id: "texture-8",  name: "Coffee Roast",   value: "/fabrics/FabricsJacket/02.3716.20.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.20.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.20.jpg",           fabricType: "wool-blend" },
        { id: "texture-9",  name: "Blue Graphite",  value: "/fabrics/FabricsJacket/02.3716.26.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.26.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.26.jpg",           fabricType: "wool-blend" },
        { id: "texture-10", name: "Coffee Bean",    value: "/fabrics/FabricsJacket/02.3716.28.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.28.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.28.jpg",           fabricType: "wool-blend" },
        { id: "texture-11", name: "Carbon Grey",    value: "/fabrics/FabricsJacket/02.3716.31.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.31.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.31.jpg",           fabricType: "wool-blend" },
        { id: "texture-12", name: "Golden Khaki",   value: "/fabrics/FabricsJacket/02.3716.32.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.32.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.32.jpg",           fabricType: "wool-blend" },
        { id: "texture-13", name: "Cinnamon Rust",  value: "/fabrics/FabricsJacket/02.3716.34.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.34.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.34.jpg",           fabricType: "wool-blend" },
        { id: "texture-14", name: "Graphite Brown", value: "/fabrics/FabricsJacket/02.3716.39.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.39.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.39.jpg",           fabricType: "wool-blend" },
        { id: "texture-15", name: "Dusty Olive",    value: "/fabrics/FabricsJacket/02.3716.41.jpg",           price: 15, color: "/fabrics/FabricsJacket/02.3716.41.jpg",           thumbnail: "/fabrics/FabricsJacket/02.3716.41.jpg",           fabricType: "wool-blend" },
        { id: "texture-16", name: "Shadow Black",   value: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23L6001-3-reduced.jpg", fabricType: "linen"      },
        { id: "texture-17", name: "Deep Navy",      value: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23L6001-7-reduced.jpg", fabricType: "linen"      },
        { id: "texture-18", name: "Midnight Blue",  value: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9001-1-reduced.jpg", fabricType: "cotton"     },
        { id: "texture-19", name: "Slate Grey",     value: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9001-5-reduced.jpg", fabricType: "cotton"     },
        { id: "texture-20", name: "Ocean Blue",     value: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg", price: 15, color: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg", thumbnail: "/fabrics/FabricsJacket/XHS23T9020-4-reduced.jpg", fabricType: "cotton"     },
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
  ],
}


