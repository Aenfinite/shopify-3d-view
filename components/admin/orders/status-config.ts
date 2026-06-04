// Shared status → colour mapping for order + sub-order badges/selects.

export const ORDER_STATUSES = [
  "pledge_received", "configuring", "confirmed", "in_production", "shipped", "cancelled",
] as const
export const SUB_ORDER_STATUSES = [
  "pending", "configuring", "confirmed", "in_production", "completed", "cancelled",
] as const

export const STATUS_LABEL: Record<string, string> = {
  pledge_received: "Pledge received",
  configuring: "Configuring",
  confirmed: "Confirmed",
  in_production: "In production",
  shipped: "Shipped",
  completed: "Completed",
  pending: "Pending",
  cancelled: "Cancelled",
}

// Tailwind classes for the coloured dot next to a status.
export const STATUS_DOT: Record<string, string> = {
  pledge_received: "bg-slate-400",
  pending: "bg-slate-400",
  configuring: "bg-blue-500",
  confirmed: "bg-violet-500",
  in_production: "bg-amber-500",
  shipped: "bg-green-600",
  completed: "bg-green-600",
  cancelled: "bg-red-500",
}

export const ORIGIN_LABEL: Record<string, string> = {
  kickstarter: "Kickstarter",
  shopify: "Shopify",
  manual: "Manual",
}
