import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/shopify/verify-customer
 *
 * Verifies a Shopify customer access token against the Storefront API.
 * Called by the configurator when a `shopify_customer_token` is present in the URL.
 *
 * Body: { customerAccessToken: string }
 * Returns: { id, email, firstName, lastName, phone, displayName }
 *
 * Required environment variables:
 *   SHOPIFY_STORE_DOMAIN        e.g. annamorgantailoring.myshopify.com
 *   SHOPIFY_STOREFRONT_TOKEN    Storefront API public access token
 */

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN

const CUSTOMER_QUERY = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      phone
      displayName
    }
  }
`

export async function POST(req: NextRequest) {
  try {
    const { customerAccessToken } = await req.json()

    if (!customerAccessToken) {
      return NextResponse.json({ error: "customerAccessToken is required" }, { status: 400 })
    }

    if (!SHOPIFY_DOMAIN || !STOREFRONT_TOKEN) {
      // Env vars not configured — return an unverified fallback so the app still works
      console.warn("⚠️ Shopify env vars not set — skipping token verification")
      return NextResponse.json({ verified: false, reason: "env_not_configured" }, { status: 200 })
    }

    const url = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: CUSTOMER_QUERY,
        variables: { customerAccessToken },
      }),
      // Don't cache this — it must always be live
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Shopify Storefront API error:", response.status, response.statusText)
      return NextResponse.json({ error: "Shopify API error" }, { status: 502 })
    }

    const data = await response.json()

    if (data.errors) {
      console.error("Shopify GraphQL errors:", data.errors)
      return NextResponse.json({ error: "Invalid token", details: data.errors }, { status: 401 })
    }

    const customer = data?.data?.customer

    if (!customer) {
      // Token is invalid or expired
      return NextResponse.json({ verified: false, reason: "invalid_token" }, { status: 200 })
    }

    return NextResponse.json({
      verified: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        displayName: customer.displayName,
        name: `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
      },
    })
  } catch (error) {
    console.error("Error verifying Shopify customer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Also allow GET for quick checks (passing token as query param)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) {
    return NextResponse.json({ error: "token param required" }, { status: 400 })
  }

  // Delegate to POST logic
  const syntheticReq = new NextRequest(req.url, {
    method: "POST",
    body: JSON.stringify({ customerAccessToken: token }),
    headers: { "Content-Type": "application/json" },
  })
  return POST(syntheticReq)
}
