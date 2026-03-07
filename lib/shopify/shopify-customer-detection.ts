"use client"

// ─── Shopify Customer Detection ─────────────────────────────────────────────
//
// Two-layer approach:
//
// LAYER 1 — Secure token verification (recommended, requires env vars):
//   The Shopify theme passes the customer's `customerAccessToken` in the URL.
//   This app calls its own /api/shopify/verify-customer endpoint, which verifies
//   the token against the Shopify Storefront API and returns real customer data.
//   Nobody can fake this — the token only works if they're genuinely logged in.
//
//   Required Shopify theme snippet (paste before the closing </body> tag or in
//   the snippet that renders the configurator link):
//
//   <script>
//   (function() {
//     // Shopify stores the customer access token in a cookie after login
//     function getCookie(name) {
//       var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
//       return match ? decodeURIComponent(match[2]) : null;
//     }
//     var token = getCookie('_shopify_customer_access_token')
//       || (window.__st && window.__st.cst)
//       || null;
//     var links = document.querySelectorAll('a[data-configurator-link]');
//     links.forEach(function(link) {
//       if (token) {
//         var url = new URL(link.href);
//         url.searchParams.set('shopify_customer_token', token);
//         {% if customer %}
//         url.searchParams.set('shopify_customer_id', '{{ customer.id }}');
//         url.searchParams.set('shopify_customer_email', '{{ customer.email | url_encode }}');
//         url.searchParams.set('shopify_customer_name', '{{ customer.first_name | url_encode }} {{ customer.last_name | url_encode }}');
//         {% endif %}
//         link.href = url.toString();
//       }
//     });
//   })();
//   </script>
//
//   And mark your configurator link with the attribute:
//   <a href="https://shopfy3dviewer.vercel.app/product/jacket-001" data-configurator-link>
//     Customize your suit
//   </a>
//
// LAYER 2 — Liquid URL params fallback (no env vars needed):
//   If the Storefront API env vars aren't set, the app falls back to reading
//   customer data from Liquid-injected URL params (not cryptographically verified
//   but fine for non-critical use or during initial setup).
//
// ─────────────────────────────────────────────────────────────────────────────

export interface ShopifyCustomer {
  id: string          // Shopify customer ID (e.g. "gid://shopify/Customer/123456")
  email: string       // customer email
  name?: string       // first + last name
  firstName?: string
  lastName?: string
  phone?: string
  verified?: boolean  // true = confirmed via Storefront API, false = from URL params only
}

/**
 * SECURE: Verify a Shopify customer access token via our API route.
 * The API route calls the Shopify Storefront API to confirm the token is genuine.
 * Call this on mount when `shopify_customer_token` is in the URL.
 *
 * Returns verified customer data, or null if the token is invalid/expired.
 */
export async function verifyShopifyCustomerToken(
  token: string
): Promise<ShopifyCustomer | null> {
  try {
    const response = await fetch("/api/shopify/verify-customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerAccessToken: token }),
    })

    const data = await response.json()

    if (!response.ok || !data.verified) {
      if (data.reason === "env_not_configured") {
        // Env vars not set yet — fall back to URL params (development mode)
        console.warn("⚠️ Shopify env vars not configured — operating in unverified mode")
        return null
      }
      console.warn("🔒 Shopify token verification failed:", data.reason || data.error)
      return null
    }

    return {
      ...data.customer,
      verified: true,
    }
  } catch (error) {
    console.error("Error verifying Shopify token:", error)
    return null
  }
}

/**
 * Read customer data from URL params (unverified fallback).
 * Used when env vars are not yet configured, or as an initial pre-load
 * before token verification completes.
 */
export function detectShopifyCustomer(): ShopifyCustomer | null {
  if (typeof window === "undefined") return null

  try {
    const params = new URLSearchParams(window.location.search)

    const customerId = params.get("shopify_customer_id")
    const customerEmail = params.get("shopify_customer_email")

    // Must have at least customer ID and email to count as detected
    if (!customerId || !customerEmail) {
      // Fallback: check if Shopify's analytics globals are present
      // (available when running directly inside a Shopify storefront, not iframed)
      return detectFromShopifyGlobals()
    }

    const name = params.get("shopify_customer_name") || undefined
    const phone = params.get("shopify_customer_phone") || undefined

    const customer: ShopifyCustomer = {
      id: customerId,
      email: decodeURIComponent(customerEmail).toLowerCase().trim(),
      name: name ? decodeURIComponent(name).trim() : undefined,
      phone: phone ? decodeURIComponent(phone) : undefined,
      verified: false, // not yet cryptographically verified
    }

    // Split name into first/last if provided
    if (customer.name) {
      const parts = customer.name.split(" ")
      customer.firstName = parts[0]
      customer.lastName = parts.slice(1).join(" ") || undefined
    }

    console.log("🛍️ Shopify customer from URL params (unverified):", customer.email)
    return customer
  } catch (error) {
    console.error("Error detecting Shopify customer:", error)
    return null
  }
}

/**
 * Fallback: detect customer from Shopify's global JS objects.
 * These are available when the page runs directly inside the Shopify storefront
 * (not in an iframe from a different domain).
 */
function detectFromShopifyGlobals(): ShopifyCustomer | null {
  try {
    // ShopifyAnalytics.meta.page.customerId is set for logged-in customers
    const shopifyMeta = (window as any).ShopifyAnalytics?.meta?.page
    const shopifySt = (window as any).__st

    if (shopifyMeta?.customerId) {
      return {
        id: String(shopifyMeta.customerId),
        email: shopifySt?.cid || "", // __st.cid is the customer identifier
      }
    }

    // Another Shopify global: meta.customer
    const metaCustomer = (window as any).meta?.customer
    if (metaCustomer) {
      return {
        id: String(metaCustomer.id),
        email: metaCustomer.email || "",
        name: metaCustomer.name || undefined,
      }
    }
  } catch {
    // Globals not available
  }

  return null
}

/**
 * Check whether the configurator is running inside a Shopify context.
 */
export function isShopifyEmbedded(): boolean {
  if (typeof window === "undefined") return false

  // Check URL params
  const params = new URLSearchParams(window.location.search)
  if (
    params.has("shopify_customer_id") ||
    params.has("shopify_customer_email") ||
    params.has("shopify_customer_token")
  ) {
    return true
  }

  // Check Shopify globals
  if ((window as any).Shopify || (window as any).ShopifyAnalytics) {
    return true
  }

  return false
}

/**
 * Read the Shopify customer access token from the URL (if present).
 * The Shopify theme JS injects this via `shopify_customer_token` param.
 */
export function getCustomerTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  return params.get("shopify_customer_token")
}

/**
 * Build the embed URL for a product configurator with Shopify customer data.
 */
export function buildEmbedUrl(baseUrl: string, customer: ShopifyCustomer): string {
  const url = new URL(baseUrl)
  url.searchParams.set("shopify_customer_id", customer.id)
  url.searchParams.set("shopify_customer_email", customer.email)
  if (customer.name) url.searchParams.set("shopify_customer_name", customer.name)
  if (customer.phone) url.searchParams.set("shopify_customer_phone", customer.phone)
  return url.toString()
}
