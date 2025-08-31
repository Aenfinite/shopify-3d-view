import type { FabricOption, StyleOption, SizeOption, MeasurementSet } from "@/types/configurator"

// Interface for customization data
export interface CustomizationData {
  mode: "MTM" | "MTO"
  fabric: FabricOption | null
  styles: Record<string, StyleOption>
  size?: SizeOption | null
  measurements?: MeasurementSet | null
  price: number
}

// Interface for Shopify cart item
export interface ShopifyCartItem {
  productId: string
  variantId: string
  quantity: number
  properties: Record<string, string>
}

// Function to prepare line item properties for Shopify
export function prepareLineItemProperties(customizationData: CustomizationData): Record<string, string> {
  const lineItemProperties: Record<string, string> = {}

  // Add mode (MTM or MTO)
  lineItemProperties["Mode"] = customizationData.mode

  // Add fabric details
  if (customizationData.fabric) {
    lineItemProperties["Fabric"] = customizationData.fabric.name
    lineItemProperties["Fabric_Code"] = customizationData.fabric.id
    lineItemProperties["Fabric_Color"] = customizationData.fabric.color
  }

  // Add style options
  if (customizationData.styles) {
    Object.entries(customizationData.styles).forEach(([category, option]) => {
      lineItemProperties[`Style_€{category}`] = option.name
      lineItemProperties[`Style_€{category}_Code`] = option.id
    })
  }

  // Add size or measurements based on mode
  if (customizationData.mode === "MTO" && customizationData.size) {
    lineItemProperties["Size"] = customizationData.size.name
  } else if (customizationData.mode === "MTM" && customizationData.measurements) {
    Object.entries(customizationData.measurements).forEach(([key, value]) => {
      lineItemProperties[`Measurement_€{key}`] = String(value)
    })
  }

  // Add price
  lineItemProperties["Price"] = String(customizationData.price.toFixed(2))

  return lineItemProperties
}

// Function to add item to Shopify cart
export async function addToShopifyCart(item: ShopifyCartItem): Promise<{ success: boolean; cartUrl: string }> {
  try {
    // Get Shopify domain from environment variable
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN

    // Check if we're using the Shopify Storefront API or the Ajax API
    if (process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      // Using Storefront API (more advanced)
      return await addToCartViaStorefrontAPI(item)
    } else {
      // Using Ajax API (simpler)
      return await addToCartViaAjaxAPI(item)
    }
  } catch (error) {
    console.error("Error adding to Shopify cart:", error)
    throw error
  }
}

// Function to add item to cart via Shopify Ajax API
async function addToCartViaAjaxAPI(item: ShopifyCartItem): Promise<{ success: boolean; cartUrl: string }> {
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN

  if (!shopifyDomain) {
    throw new Error("Shopify domain not configured")
  }

  const url = `https://€{shopifyDomain}/cart/add.js`

  const formData = new FormData()
  formData.append("id", item.variantId)
  formData.append("quantity", item.quantity.toString())

  // Add properties
  Object.entries(item.properties).forEach(([key, value]) => {
    formData.append(`properties[€{key}]`, value)
  })

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Failed to add item to cart: €{response.statusText}`)
  }

  return {
    success: true,
    cartUrl: `https://€{shopifyDomain}/cart`,
  }
}

// Function to add item to cart via Shopify Storefront API
async function addToCartViaStorefrontAPI(item: ShopifyCartItem): Promise<{ success: boolean; cartUrl: string }> {
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN
  const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!shopifyDomain || !storefrontAccessToken) {
    throw new Error("Shopify domain or Storefront API access token not configured")
  }

  // First, get or create a cart
  let cartId = localStorage.getItem("shopifyCartId")

  if (!cartId) {
    cartId = await createCart()
    localStorage.setItem("shopifyCartId", cartId)
  }

  // Add the item to the cart
  const url = `https://€{shopifyDomain}/api/2023-07/graphql.json`

  const mutation = `
    mutation addCartLines(€cartId: ID!, €lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: €cartId, lines: €lines) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const variables = {
    cartId,
    lines: [
      {
        merchandiseId: `gid://shopify/ProductVariant/€{item.variantId}`,
        quantity: item.quantity,
        attributes: Object.entries(item.properties).map(([key, value]) => ({
          key,
          value,
        })),
      },
    ],
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
    body: JSON.stringify({
      query: mutation,
      variables,
    }),
  })

  const data = await response.json()

  if (data.errors || (data.data && data.data.cartLinesAdd.userErrors.length > 0)) {
    throw new Error(`Failed to add item to cart: €{JSON.stringify(data.errors || data.data.cartLinesAdd.userErrors)}`)
  }

  return {
    success: true,
    cartUrl: data.data.cartLinesAdd.cart.checkoutUrl,
  }
}

// Function to create a new cart
async function createCart(): Promise<string> {
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN
  const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

  if (!shopifyDomain || !storefrontAccessToken) {
    throw new Error("Shopify domain or Storefront API access token not configured")
  }

  const url = `https://€{shopifyDomain}/api/2023-07/graphql.json`

  const mutation = `
    mutation cartCreate {
      cartCreate {
        cart {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
    body: JSON.stringify({
      query: mutation,
    }),
  })

  const data = await response.json()

  if (data.errors || (data.data && data.data.cartCreate.userErrors.length > 0)) {
    throw new Error(`Failed to create cart: €{JSON.stringify(data.errors || data.data.cartCreate.userErrors)}`)
  }

  return data.data.cartCreate.cart.id
}

// Function to redirect to Shopify checkout
export function redirectToShopifyCheckout() {
  const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN

  if (!shopifyDomain) {
    throw new Error("Shopify domain not configured")
  }

  window.location.href = `https://€{shopifyDomain}/checkout`
}
