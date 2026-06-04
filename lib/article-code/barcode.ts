// ============================================================================
// Self-contained Code 128 (subset B/C) barcode encoder → SVG.
// ----------------------------------------------------------------------------
// No external dependency. Produces a crisp, scalable SVG string that can be
// embedded in print/production sheets or rendered in the browser. Code 128-C is
// used automatically for all-digit payloads (the machine code) for density;
// otherwise Code 128-B covers full alphanumerics (the human code).
// ============================================================================

// 108 Code128 symbol patterns (each a width-run of bars/spaces, 11 modules).
const PATTERNS = [
  "11011001100","11001101100","11001100110","10010011000","10010001100","10001001100","10011001000","10011000100","10001100100","11001001000",
  "11001000100","11000100100","10110011100","10011011100","10011001110","10111001100","10011101100","10011100110","11001110010","11001011100",
  "11001001110","11011100100","11001110100","11101101110","11101001100","11100101100","11100100110","11101100100","11100110100","11100110010",
  "11011011000","11011000110","11000110110","10100011000","10001011000","10001000110","10110001000","10001101000","10001100010","11010001000",
  "11000101000","11000100010","10110111000","10110001110","10001101110","10111011000","10111000110","10001110110","11101110110","11010001110",
  "11000101110","11011101000","11011100010","11011101110","11101011000","11101000110","11100010110","11101101000","11101100010","11100011010",
  "11101111010","11001000010","11110001010","10100110000","10100001100","10010110000","10010000110","10000101100","10000100110","10110010000",
  "10110000100","10011010000","10011000010","10000110100","10000110010","11000010010","11001010000","11110111010","11000010100","10001111010",
  "10100111100","10010111100","10010011110","10111100100","10011110100","10011110010","11110100100","11110010100","11110010010","11011011110",
  "11011110110","11110110110","10101111000","10100011110","10001011110","10111101000","10111100010","11110101000","11110100010","10111011110",
  "10111101110","11101011110","11110101110","11010000100","11010010000","11010011100","11000111010",
]
const STOP = "1100011101011"

const CODE_B_START = 104
const CODE_C_START = 105
const CODE_B = 100
const STOP_CODE = 106

function encodeValues(payload: string): number[] {
  const allDigits = /^\d+$/.test(payload) && payload.length % 2 === 0
  if (allDigits) {
    // Code 128-C: pairs of digits → one symbol each.
    const values = [CODE_C_START]
    for (let i = 0; i < payload.length; i += 2) values.push(parseInt(payload.slice(i, i + 2), 10))
    return values
  }
  // Code 128-B: ASCII 32..126 → value (char - 32).
  const values = [CODE_B_START]
  for (const ch of payload) {
    const code = ch.charCodeAt(0)
    values.push(code >= 32 && code <= 126 ? code - 32 : CODE_B /* unsupported → switch noise; clamp */)
  }
  return values
}

function checksum(values: number[]): number {
  let sum = values[0]
  for (let i = 1; i < values.length; i++) sum += values[i] * i
  return sum % 103
}

/**
 * Raw module bit-string for `payload` (start + data + checksum + stop), no
 * quiet zone. '1' = bar, '0' = space, each module one unit wide. Shared by the
 * SVG renderer and the PDF renderer (which draws bars as filled rectangles).
 */
export function code128Bits(payload: string): string {
  if (!payload) return ""
  const values = encodeValues(payload)
  values.push(checksum(values))
  values.push(STOP_CODE)
  return values.map((v) => (v === STOP_CODE ? STOP : PATTERNS[v])).join("")
}

/**
 * Build a Code 128 barcode as an SVG string for `payload`.
 * @returns SVG markup, or an empty-rect SVG if payload is empty.
 */
export function code128Svg(
  payload: string,
  opts: { height?: number; moduleWidth?: number; margin?: number; showText?: boolean } = {},
): string {
  const height = opts.height ?? 60
  const mw = opts.moduleWidth ?? 2
  const margin = opts.margin ?? 10
  const showText = opts.showText ?? true
  const textH = showText ? 16 : 0

  if (!payload) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="${height}"></svg>`
  }

  const bits = code128Bits(payload)
  const totalWidth = margin * 2 + bits.length * mw
  const totalHeight = height + textH

  let x = margin
  const rects: string[] = []
  for (const bit of bits) {
    if (bit === "1") rects.push(`<rect x="${x}" y="0" width="${mw}" height="${height}" />`)
    x += mw
  }

  const text = showText
    ? `<text x="${totalWidth / 2}" y="${height + 12}" text-anchor="middle" font-family="monospace" font-size="12" fill="#000">${payload}</text>`
    : ""

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">` +
    `<rect width="${totalWidth}" height="${totalHeight}" fill="#fff" />` +
    `<g fill="#000">${rects.join("")}</g>${text}</svg>`
  )
}

/** Data-URI form, handy for <img src> in the browser or PDF embedding. */
export function code128DataUri(payload: string, opts?: Parameters<typeof code128Svg>[1]): string {
  const svg = code128Svg(payload, opts)
  const base64 = typeof window === "undefined"
    ? Buffer.from(svg).toString("base64")
    : btoa(unescape(encodeURIComponent(svg)))
  return `data:image/svg+xml;base64,${base64}`
}
