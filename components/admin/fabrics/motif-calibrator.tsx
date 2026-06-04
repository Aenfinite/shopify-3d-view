"use client"

import { useRef, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Ruler, Trash2 } from "lucide-react"

/**
 * MotifCalibrator
 * ───────────────
 * Anchors the fabric's print scale to a single physically-measurable feature.
 *
 * The admin draws a box around one motif (e.g. a hibiscus flower) and types its
 * REAL size in cm. From that we derive one number — centimetres-per-pixel — and
 * set BOTH repeat dimensions as (image_px × cm_per_px). Because both come from
 * the same cm/px applied to the image's own pixel dimensions, the resulting
 * `repeat_width_cm : repeat_height_cm` ratio is *forced* to equal the image's
 * pixel aspect ratio. That removes the only controllable source of motif stretch
 * (entered aspect ≠ image aspect) and anchors scale to a real ruler measurement.
 *
 * A live 10 cm reference square is overlaid on the image so the result can be
 * verified against the physical printed sample before saving.
 */

export interface MotifCalibration {
  /** Box in normalized [0..1] image coordinates (survives re-upload / resize). */
  box: { x: number; y: number; w: number; h: number }
  /** Physical size of the box along `axis`, in cm. */
  real_cm: number
  /** Which box edge `real_cm` measures; the other follows the box pixel aspect. */
  axis: "w" | "h"
}

export interface MotifCalibrationResult {
  cmPerPx: number
  repeatWidthCm: number
  repeatHeightCm: number
  calibration: MotifCalibration
}

interface MotifCalibratorProps {
  imageSrc: string
  imagePixels: { w: number; h: number }
  value?: MotifCalibration | null
  onApply: (result: MotifCalibrationResult) => void
}

type Box = { x: number; y: number; w: number; h: number }

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v))
}

export default function MotifCalibrator({
  imageSrc,
  imagePixels,
  value,
  onApply,
}: MotifCalibratorProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)

  const [box, setBox] = useState<Box | null>(value?.box ?? null)
  const [realCm, setRealCm] = useState<number>(value?.real_cm ?? 0)
  const [axis, setAxis] = useState<"w" | "h">(value?.axis ?? "w")
  const [dragging, setDragging] = useState(false)

  // Pixel size of the box along each axis
  const boxWpx = box ? box.w * imagePixels.w : 0
  const boxHpx = box ? box.h * imagePixels.h : 0
  const boxAxisPx = axis === "w" ? boxWpx : boxHpx

  // cm-per-pixel from the chosen axis; both repeats derive from this single number.
  const cmPerPx = box && realCm > 0 && boxAxisPx > 0 ? realCm / boxAxisPx : 0
  const repeatWidthCm = cmPerPx > 0 ? imagePixels.w * cmPerPx : 0
  const repeatHeightCm = cmPerPx > 0 ? imagePixels.h * cmPerPx : 0

  // Other box dimension in cm (sanity feedback while measuring).
  const boxWcm = cmPerPx > 0 ? boxWpx * cmPerPx : 0
  const boxHcm = cmPerPx > 0 ? boxHpx * cmPerPx : 0

  // 10 cm reference square, expressed in normalized image coordinates.
  const refPx = cmPerPx > 0 ? 10 / cmPerPx : 0
  const refNX = refPx > 0 ? refPx / imagePixels.w : 0
  const refNY = refPx > 0 ? refPx / imagePixels.h : 0
  const refFits = refNX > 0 && refNX <= 1 && refNY <= 1

  const toNorm = useCallback((clientX: number, clientY: number) => {
    const rect = overlayRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return null
    return {
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    }
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    const p = toNorm(e.clientX, e.clientY)
    if (!p) return
    e.preventDefault()
    overlayRef.current?.setPointerCapture(e.pointerId)
    dragStart.current = p
    setDragging(true)
    setBox({ x: p.x, y: p.y, w: 0, h: 0 })
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragStart.current) return
    const p = toNorm(e.clientX, e.clientY)
    if (!p) return
    const s = dragStart.current
    setBox({
      x: Math.min(s.x, p.x),
      y: Math.min(s.y, p.y),
      w: Math.abs(p.x - s.x),
      h: Math.abs(p.y - s.y),
    })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return
    setDragging(false)
    dragStart.current = null
    overlayRef.current?.releasePointerCapture?.(e.pointerId)
    if (!box) return
    // Discard accidental tiny boxes
    if (box.w < 0.01 || box.h < 0.01) {
      setBox(null)
      return
    }
    // Default the measured axis to the longer pixel edge — bigger reference,
    // proportionally smaller ruler error.
    setAxis(box.w * imagePixels.w >= box.h * imagePixels.h ? "w" : "h")
  }

  const canApply = cmPerPx > 0
  const pct = (v: number) => `${(v * 100).toFixed(3)}%`

  return (
    <div className="space-y-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
      <div className="flex items-start gap-2">
        <Ruler className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-indigo-900">Calibrate scale from a motif</p>
          <p className="text-[11px] text-indigo-700 leading-tight mt-0.5">
            Drag a box around <strong>one clear motif</strong> (the bigger, the more
            accurate), then type its real measured size. Both repeat dimensions are
            derived from this — so the print can never come out stretched.
          </p>
        </div>
      </div>

      {/* Image + drawing surface */}
      <div className="relative w-full select-none rounded overflow-hidden border border-indigo-300 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageSrc} alt="Fabric for calibration" className="block w-full h-auto" draggable={false} />
        <div
          ref={overlayRef}
          className="absolute inset-0 cursor-crosshair touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* Motif box */}
          {box && (
            <div
              className="absolute border-2 border-indigo-500 bg-indigo-400/15"
              style={{ left: pct(box.x), top: pct(box.y), width: pct(box.w), height: pct(box.h) }}
            >
              {cmPerPx > 0 && (
                <span className="absolute -top-5 left-0 text-[10px] font-mono bg-indigo-600 text-white px-1 rounded whitespace-nowrap">
                  {boxWcm.toFixed(1)} × {boxHcm.toFixed(1)} cm
                </span>
              )}
            </div>
          )}

          {/* 10 cm reference square — anchored bottom-right, for ruler verification */}
          {refFits && (
            <div
              className="absolute border-2 border-dashed border-emerald-500 bg-emerald-400/10 pointer-events-none"
              style={{ right: "2%", bottom: "2%", width: pct(refNX), height: pct(refNY) }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                10 cm
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Measurement input */}
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label className="text-xs">Real size of box ({axis === "w" ? "width" : "height"})</Label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={0}
              step={0.1}
              value={realCm || ""}
              placeholder="e.g. 24"
              disabled={!box}
              onChange={(e) => setRealCm(parseFloat(e.target.value) || 0)}
            />
            <span className="text-xs text-muted-foreground">cm</span>
          </div>
        </div>
        {/* Axis toggle */}
        <div className="flex rounded border border-indigo-300 overflow-hidden text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setAxis("w")}
            className={`px-2 py-2 ${axis === "w" ? "bg-indigo-600 text-white" : "bg-white text-indigo-700 hover:bg-indigo-50"}`}
            title="The number above measures the box width"
          >
            ↔ W
          </button>
          <button
            type="button"
            onClick={() => setAxis("h")}
            className={`px-2 py-2 ${axis === "h" ? "bg-indigo-600 text-white" : "bg-white text-indigo-700 hover:bg-indigo-50"}`}
            title="The number above measures the box height"
          >
            ↕ H
          </button>
        </div>
        {box && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            title="Clear box"
            onClick={() => {
              setBox(null)
              setRealCm(0)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Result + apply */}
      {canApply ? (
        <div className="space-y-2">
          <p className="text-[11px] text-green-700 bg-green-50 border border-green-200 rounded p-1.5 leading-snug">
            ✓ Scale: <strong>{cmPerPx.toFixed(5)} cm/px</strong> — full repeat ={" "}
            <strong>{repeatWidthCm.toFixed(1)} × {repeatHeightCm.toFixed(1)} cm</strong>{" "}
            (aspect locked to the image, {(repeatWidthCm / repeatHeightCm).toFixed(3)}).
            Compare the green 10 cm square against a ruler on the real sample.
          </p>
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={() =>
              onApply({
                cmPerPx,
                repeatWidthCm,
                repeatHeightCm,
                calibration: { box: box!, real_cm: realCm, axis },
              })
            }
          >
            Apply this scale
          </Button>
        </div>
      ) : (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-1.5">
          {box ? "Type the real measured size of the box." : "Drag a box over a motif to begin."}
        </p>
      )}
    </div>
  )
}
