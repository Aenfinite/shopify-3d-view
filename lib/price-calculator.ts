import type { PriceCalculationInput } from "@/types/configurator"

// Base prices
const BASE_PRICES = {
  MTO: 99.99,
  MTM: 149.99,
}

// Calculate the total price based on selections
export function calculatePrice(input: PriceCalculationInput): number {
  const { mode, fabric, styles } = input

  // Start with base price for the mode
  let totalPrice = BASE_PRICES[mode]

  // Add fabric price if selected
  if (fabric) {
    totalPrice += fabric.pricePerUnit - BASE_PRICES[mode]
  }

  // Add style option price deltas
  if (styles) {
    Object.values(styles).forEach((style) => {
      totalPrice += style.priceDelta
    })
  }

  // Add premium for complex measurements (MTM only)
  if (mode === "MTM" && input.measurements) {
    // Count the number of measurements provided
    const measurementCount = Object.keys(input.measurements).length

    // Add a small premium for each measurement beyond the basic set
    if (measurementCount > 4) {
      totalPrice += (measurementCount - 4) * 5
    }
  }

  return totalPrice
}
