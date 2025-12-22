"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Ruler, Video, Edit3, ChevronLeft, ChevronRight, CheckCircle, Info } from "lucide-react"

interface MeasurementStepProps {
  sizeType?: "standard"
  standardSize?: string
  fitType?: string
  garmentType: "pants" | "jacket" | "shirt" | "suit" | "blazer"
  customMeasurements: {
    neck: number
    chest: number
    stomach: number
    hip: number
    length: number
    shoulder: number
    sleeve: number
  }
  customMeasurementMethod?: "sketches" | "videos"
  onUpdate: (updates: any) => void
}

interface MeasurementData {
  neck: string
  chest: string
  stomach: string
  hip: string
  length: string
  shoulder: string
  sleeve: string
  waist: string
  inseam: string
  thigh: string
  knee: string
  outseam: string
  biceps: string
  back_length: string
  armhole: string
  front_width: string
  back_width: string
  forearm: string
  wrist: string
  hem: string
  front_length: string
  backmass: string
  sleeve_opening: string
  first_button: string
  [key: string]: string
}

// Three measurement methods for each garment type - Updated with real video URLs
const GARMENT_MEASUREMENTS = {
  shirt: {
    measurements: [
      { 
        key: "neck", 
        label: "Neck Circumference", 
        description: "Measure around the neck where collar sits.", 
        detailedGuide: "Place the measuring tape around your neck at the base, where your collar would normally sit. Make sure the tape is snug but not tight.",
        unit: "cm",
        videoUrl: "https://youtu.be/8eTJzzDZ-Ps",
        sketchImage: "/measurement-guides/shirt/neck-sketch.svg"
      },
      { 
        key: "chest", 
        label: "Chest Circumference", 
        description: "Measure around the fullest part of your chest.", 
        detailedGuide: "Wrap the measuring tape around your chest at the fullest point. Keep your arms relaxed at your sides and breathe normally.",
        unit: "cm",
        videoUrl: "https://youtu.be/fN7ChyTlAS8",
        sketchImage: "/measurement-guides/shirt/chest-sketch.svg"
      },
      { 
        key: "waist", 
        label: "Waist Circumference", 
        description: "Measure around your natural waistline.", 
        detailedGuide: "Find your natural waist and wrap the tape around this area while standing straight.",
        unit: "cm",
        videoUrl: "https://youtu.be/3xVdy8Azqhs",
        sketchImage: "/measurement-guides/shirt/waist-sketch.svg"
      },
      { 
        key: "shoulder", 
        label: "Shoulder Width", 
        description: "Measure from shoulder point to shoulder point.", 
        detailedGuide: "Have someone help you measure across your back from the edge of one shoulder to the edge of the other.",
        unit: "cm",
        videoUrl: "https://youtu.be/8bT5sg4-Q0o",
        sketchImage: "/measurement-guides/shirt/shoulder-sketch.svg"
      },
      { 
        key: "sleeve", 
        label: "Sleeve Length", 
        description: "Measure from shoulder to wrist.", 
        detailedGuide: "With your arm slightly bent, measure from the edge of your shoulder down to your wrist bone.",
        unit: "cm",
        videoUrl: "https://youtu.be/D9StvHaSgM8",
        sketchImage: "/measurement-guides/shirt/sleeve-sketch.svg"
      },
      { 
        key: "length", 
        label: "Shirt Length", 
        description: "Measure from neck to desired shirt length.", 
        detailedGuide: "Start at the base of your neck and measure straight down to where you want the shirt to end.",
        unit: "cm",
        videoUrl: "https://youtu.be/Yi1Zd1MigyM",
        sketchImage: "/measurement-guides/shirt/length-sketch.svg"
      },
      {
        key: "biceps",
        label: "Bicep Circumference",
        description: "Measure around the fullest part of your upper arm.",
        detailedGuide: "Flex your arm and measure around the fullest part of your bicep muscle.",
        unit: "cm",
        videoUrl: "https://youtu.be/h5GvZbTVSH8",
        sketchImage: "/measurement-guides/shirt/bicep-sketch.svg"
      },
      {
        key: "forearm",
        label: "Forearm Circumference",
        description: "Measure around the fullest part of your forearm.",
        detailedGuide: "Measure around the widest part of your forearm, usually about 5 cm below your elbow.",
        unit: "cm",
        videoUrl: "https://youtu.be/h5GvZbTVSH8",
        sketchImage: "/measurement-guides/shirt/forearm-sketch.svg"
      },
      {
        key: "wrist",
        label: "Wrist Circumference",
        description: "Measure around your wrist where the cuff will sit.",
        detailedGuide: "Measure around your wrist bone where the shirt cuff would normally sit.",
        unit: "cm",
        videoUrl: "https://youtu.be/fmmIXzBVVVU",
        sketchImage: "/measurement-guides/shirt/wrist-sketch.svg"
      },
      {
        key: "back_width",
        label: "Back Width",
        description: "Measure across the back from armpit to armpit.",
        detailedGuide: "Measure straight across the back from one armpit to the other, keeping the tape parallel to the ground.",
        unit: "cm",
        videoUrl: "https://youtu.be/QY9CK9wqHMw",
        sketchImage: "/measurement-guides/shirt/back-width-sketch.svg"
      },
      {
        key: "yoke",
        label: "Yoke Width",
        description: "Measure the yoke from shoulder seam to shoulder seam.",
        detailedGuide: "Measure across the yoke (upper back area) from one shoulder seam to the other.",
        unit: "cm",
        videoUrl: "https://youtu.be/QY9CK9wqHMw",
        sketchImage: "/measurement-guides/shirt/yoke-sketch.svg"
      },
      {
        key: "front_width",
        label: "Front Width",
        description: "Measure across the front from armpit to armpit.",
        detailedGuide: "Measure straight across the front from one armpit to the other, keeping the tape parallel to the ground.",
        unit: "cm",
        videoUrl: "https://youtu.be/fN7ChyTlAS8",
        sketchImage: "/measurement-guides/shirt/front-width-sketch.svg"
      },
      {
        key: "hip",
        label: "Hip Circumference",
        description: "Measure around the fullest part of your hips.",
        detailedGuide: "Stand with feet together and measure around the fullest part of your hips and buttocks.",
        unit: "cm",
        videoUrl: "https://youtu.be/DVy9E71T3cI",
        sketchImage: "/measurement-guides/shirt/hip-sketch.svg"
      },
      {
        key: "hem_width",
        label: "Hem Width",
        description: "Measure the width at the bottom hem of the shirt.",
        detailedGuide: "Measure straight across the bottom hem of the shirt from one side seam to the other.",
        unit: "cm",
        videoUrl: "https://youtu.be/DVy9E71T3cI",
        sketchImage: "/measurement-guides/shirt/hem-sketch.svg"
      }
    ]
  },
  jacket: {
    measurements: [
      // 1. Neck
      {
        key: "neck",
        label: "Neck",
        description: "Measure around the neck where collar sits.",
        detailedGuide: "Place the measuring tape around your neck at the base, where your collar would normally sit. Make sure the tape is snug but not tight.",
        videoGuide: "Stand upright and look straight ahead. Place the tape just below the larynx and wrap it horizontally around the neck where it meets the shoulders. Leave a finger's width of space between the tape and the neck. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/8eTJzzDZ-Ps",
        sketchImage: "/images/jacket/neck.png"
      },
      // 2. Chest
      {
        key: "chest",
        label: "Chest",
        description: "Measure around the fullest part of your chest.",
        detailedGuide: "Chest Width (Pit to Pit): Button or zip the jacket fully and lay it flat. Measure from the lowest point of one underarm seam straight across to the other, then double this measurement to get the full chest circumference.",
        videoGuide: "Stand upright with arms relaxed and breathe normally. Position the tape across the fullest part of your chest, over the nipples, under the armpits, and around the shoulder blades. Keep the tape level. Record the measurement.",
        unit: "cm",
        videoUrl: "/images/jacket/chest.mp4",
        sketchImage: "/images/jacket/chest.png"
      },
      // 3. Waist
      {
        key: "waist",
        label: "Waist",
        description: "Measure around your natural waistline.",
        detailedGuide: "Waist / Midsection Width: With the jacket flat, buttoned and secured, measure across the narrowest part of the jacket (mid-torso area). Double the result for the full waist circumference.",
        videoGuide: "Wrap the tape horizontally around your waist over the navel (or fullest part of the stomach if applicable). The tape should be snug but not tight. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/3xVdy8Azqhs",
        sketchImage: "/images/jacket/waist.png"
      },
      // 4. Hip
      {
        key: "hip",
        label: "Hip",
        description: "Measure around the fullest part of your hips.",
        detailedGuide: "Hem: With the jacket laid flat, buttoned, and smoothed out, measure approximately 5 inches (12.5 cm) down from the front pockets, straight across from one side seam to the other, keeping the tape parallel to the hem. Double this measurement to obtain the full hem circumference.",
        videoGuide: "Stand upright, empty your pockets, and wrap the tape around the fullest part of your hips. Keep the tape level. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/DVy9E71T3cI",
        sketchImage: "/images/jacket/hem.png"
      },
      // 5. Front Width
      {
        key: "front_width",
        label: "Front Width",
        description: "Measure across the chest from armpit to armpit.",
        detailedGuide: "Measure straight across the front from one armpit to the other, keeping the tape parallel to the ground at chest height.",
        videoGuide: "At chest height, place the tape between the midpoints of each armpit where the arm meets the chest. Keep horizontal. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/fN7ChyTlAS8",
        sketchImage: "/images/jacket/chest.png"
      },
      // 6. Front Length
      {
        key: "front_length",
        label: "Front Length",
        description: "Measure from shoulder to desired front length.",
        detailedGuide: "Front Length: With the jacket laid flat, buttoned, and smoothed out, measure from the highest point of the shoulder seam at the collar straight down the front over the buttons to the bottom edge of the hem.",
        videoGuide: "Measure from the shoulder seam at the base of the neck straight down the front to the base of the thumb. Maintain an upright posture. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/Yi1Zd1MigyM",
        sketchImage: "/images/jacket/front-length.png"
      },
      // 7. Back Width
      {
        key: "back_width",
        label: "Back Width",
        description: "Measure across the back from armpit to armpit.",
        detailedGuide: "Back Mass: With the jacket laid flat and face down, measure straight across the back just below the armholes, where the side seams meet the sleeves, from the left point to the right point.",
        videoGuide: "At chest height, measure across the back between the midpoints of each armpit. Keep horizontal. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/ZeOSNRw9NRM",
        sketchImage: "/images/jacket/backmass.png"
      },
      // 8. Back Length
      {
        key: "back_length",
        label: "Back Length",
        description: "Measure from neck to desired back length.",
        detailedGuide: "Center Back Length: Turn the jacket face down. From the intersection of the collar and center back seam, measure straight down along the center back to the hem.",
        videoGuide: "Start at the prominent bone at the base of your neck. Measure straight down your back to where you want the jacket to end (usually where your hand naturally falls).",
        unit: "cm",
        videoUrl: "https://youtu.be/qJn27RFvNsk",
        sketchImage: "/images/jacket/back-length.png"
      },
      // 9. Shoulder
      {
        key: "shoulder",
        label: "Shoulder",
        description: "Measure across your shoulders.",
        detailedGuide: "Shoulder Width / Yoke: Lay the jacket face down, smooth it out, then measure from one shoulder seam to the other straight across the back.",
        videoGuide: "Have someone assist. Measure from the outer edge of one shoulder bone to the other, slightly curved over the shoulders. Ensure start and end points are level. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/8bT5sg4-Q0o",
        sketchImage: "/images/jacket/shoulder.png"
      },
      // 10. Sleeve Length
      {
        key: "sleeve_length",
        label: "Sleeve Length",
        description: "Measure from shoulder to wrist.",
        detailedGuide: "Sleeve Length: Lay the jacket with sleeves extended flat. Measure from the shoulder seam (where the sleeve meets the body) down the outer edge to the end of the cuff.",
        videoGuide: "With help, measure from the outer shoulder bone, over the elbow, down to the wrist bone. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/D9StvHaSgM8",
        sketchImage: "/images/jacket/sleeve-length.png"
      },
      // 11. Armhole
      {
        key: "armhole",
        label: "Armhole",
        description: "Measure around the armhole.",
        detailedGuide: "Armhole Circumference: With the jacket laid flat and buttoned, measure from the top shoulder point along the seam where the sleeve is attached, following the curve all the way around back to the starting point. Tip: For greater accuracy, measure with a string along the seam first, then measure the string's length with a measuring tape.",
        videoGuide: "Wrap the tape loosely around the armpit, passing over the shoulder. Avoid pulling tight. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/p3SCb2WsP2M",
        sketchImage: "/images/jacket/armhole.png"
      },
      // 12. Biceps
      {
        key: "biceps",
        label: "Biceps",
        description: "Measure around the largest part of your upper arm.",
        detailedGuide: "Sleeve Bicep Width: Measure about 1 inch below the underarm, straight across the sleeve.",
        videoGuide: "With arms relaxed, wrap the tape around the fullest part of your upper arm without tensing the muscles. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/h5GvZbTVSH8",
        sketchImage: "/images/jacket/biceps.png"
      },
      // 13. Wrist
      {
        key: "wrist",
        label: "Wrist",
        description: "Measure around your wrist bone.",
        detailedGuide: "Sleeve Opening / Cuff Width: Measure across the fully buttoned cuff.",
        videoGuide: "Wrap the tape around the widest point of your wrist, over the carpal bone. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/9fgnZ0YQ2Mk",
        sketchImage: "/images/jacket/sleeve-opening.png"
      },
    ]
  },
  pants: {
    measurements: [
      { 
        key: "waist", 
        label: "Waist Circumference", 
        description: "Measure around your natural waistline.", 
        detailedGuide: "1. Lay the trousers flat on a table and make sure the waistband is fully straightened and stretched evenly from end to end.\n2. Measure at the top edge across the waistband, from the outermost point on one side to the outermost point on the other side.\n3. Since this measurement is taken on a flat garment, multiply the measured width by two to obtain the full waistband circumference.\n4. Add 1 cm to the total (to allow minimal ease and ensure comfortable fit). Example: 38 cm × 2 = 76 cm + 1 cm = 77 cm final result.\n5. Enter this final result into the system.",
        unit: "cm",
        videoUrl: "https://www.youtube.com/watch?v=gnxiBmx5puI",
        sketchImage: "/images/sketch/pants/waistband circumference.png"
      },
      { 
        key: "hip", 
        label: "Hip Circumference", 
        description: "Measure around the fullest part of your hips.", 
        detailedGuide: "1. Lay the trousers flat on a table, ensuring the fabric is smooth and the legs and waistband are fully straightened.\n2. Locate the widest part of the trousers, usually around the hip area, slightly below the waistband.\n3. Measure straight across the garment at this widest point, from one side seam to the other, keeping the fabric flat and free of hidden folds.\n4. Since this measurement is taken on a flat-lay garment, double the measured width to calculate the full hip circumference.",
        unit: "cm",
        videoUrl: "https://youtu.be/DVy9E71T3cI",
        sketchImage: "/images/sketch/pants/hip circumference.png"
      },
      { 
        key: "inseam", 
        label: "Inseam Length", 
        description: "Measure from crotch to ankle.", 
        detailedGuide: "1. Lay the trousers flat on a table, ensuring both legs are straightened and the fabric has no folds or creases.\n2. Locate the crotch point, where the inseams of both legs meet.\n3. Measure from the crotch point down along the inner seam of the trouser leg.\n4. Continue measuring all the way to the bottom of the hem. This total length is the inseam measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/qJ8-OeFpGUg",
        sketchImage: "/images/sketch/pants/inseam length.png"
      },
      { 
        key: "thigh", 
        label: "Thigh Circumference", 
        description: "Measure around the fullest part of your thigh.", 
        detailedGuide: "1. Lay one trouser leg flat on a smooth table, ensuring the fabric is straightened with no folds or creases.\n2. Locate the crotch point, where the inseams meet.\n3. Measure approximately 3 cm downward from the crotch point along the inside of the trouser leg. This marks the level at which the thigh is measured.\n4. Measure straight across the leg at this point, from one side to the other, keeping the fabric flat.\n5. Since this measurement is taken on a flat-lay garment, double the result to calculate the full thigh circumference.",
        unit: "cm",
        videoUrl: "https://www.youtube.com/watch?v=UUTeKB8HGCA",
        sketchImage: "/images/sketch/pants/tigh circumference.png"
      },
      { 
        key: "knee", 
        label: "Knee Circumference", 
        description: "Measure around your knee.", 
        detailedGuide: "1. Lay the trousers flat on an even surface, making sure the legs are fully straightened.\n2. Locate the knee position, which is approximately at the halfway point of the inseam length.\n3. Measure straight across the leg at this level, from one side to the other, keeping the fabric smooth and flat.\n4. Double this measurement to determine the total knee circumference, using the same method as measuring the hem.",
        unit: "cm",
        videoUrl: "https://www.youtube.com/watch?v=Mae5OCHglDo",
        sketchImage: "/images/sketch/pants/kee circumference.png"
      },
      { 
        key: "outseam", 
        label: "Outseam Length", 
        description: "Measure from waist to ankle on the outside.", 
        detailedGuide: "1. Lay the trousers flat on a table, ensuring both legs are straight and the fabric is smooth with no creases.\n2. Locate the top edge of the waistband on the side of the trousers.\n3. Measure down along the outer seam, starting from the very top of the waistband.\n4. Continue measuring all the way down the outer side seam until you reach the bottom of the hem.\n5. The number you obtain is the total length of the trousers, also known as the outseam measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/x4E7fG3-PvY",
        sketchImage: "/images/sketch/pants/trouser length.png"
      },
      {
        key: "rise",
        label: "Front Rise",
        description: "Measure from the crotch to the waistband in front.",
        detailedGuide: "1. Lay the trousers flat on a smooth, even surface, ensuring the waistband and legs are fully straightened with no folds.\n2. Locate the top edge of the front waistband.\n3. Find the front crotch point: this is where the front fly seam meets the crotch seam between the legs.\n4. Measure straight down from the top of the front waistband to this crotch intersection point, keeping the measuring tape vertical and taut.\n5. The number you obtain is the Front Rise, which indicates how the trousers will sit and fit at the front when worn.",
        unit: "cm",
        videoUrl: "https://www.youtube.com/watch?v=0mQw-GJ5Q9o",
        sketchImage: "/images/sketch/pants/front fly.png"
      },
      {
        key: "back_rise",
        label: "Back Rise",
        description: "Measure from the crotch to the waistband in back.",
        detailedGuide: "1. Lay the trousers flat on a smooth surface, making sure the waistband and legs are fully straightened with no wrinkles.\n2. Locate the top edge of the waistband at the back of the trousers.\n3. Identify the crotch point: This is where the two inseams meet and where the side seam intersects the crotch seam between the legs.\n4. Measure straight down from the top of the back waistband to this crotch intersection point. Keep the measuring tape vertical and taut for the most accurate rise measurement.\n5. The number you obtain is the Back Rise, which indicates how the trousers will sit and fit at the back when worn.",
        unit: "cm",
        videoUrl: "https://www.youtube.com/watch?v=Ju7i6PNOADo",
        sketchImage: "/measurement-guides/pants/back-rise-sketch.svg"
      },
      {
        key: "hem_width",
        label: "Hem Width",
        description: "Measure the width of the pant leg opening.",
        detailedGuide: "1. Lay the trousers flat on a smooth surface, ensuring the bottom of each leg is fully straightened.\n2. Locate the hem at the very bottom edge of the trouser leg.\n3. Measure straight across the hem from one side to the other, keeping the fabric flat and edges aligned.\n4. Double this measurement to determine the total hem circumference, since the trousers are measured flat.",
        unit: "cm",
        videoUrl: "https://youtu.be/x4E7fG3-PvY",
        sketchImage: "/images/sketch/pants/hem circumference.png"
      }
    ]
  },
  suit: {
    measurements: [
      { 
        key: "chest", 
        label: "Chest Circumference", 
        description: "Measure around the fullest part of your chest.", 
        detailedGuide: "Wrap the measuring tape around your chest at nipple level, keeping the tape parallel to the floor.",
        unit: "inches",
        videoUrl: "https://youtu.be/fN7ChyTlAS8",
        sketchImage: "/measurement-guides/jacket/chest-sketch.svg"
      },
      { 
        key: "waist", 
        label: "Waist Circumference", 
        description: "Measure around your natural waistline.", 
        detailedGuide: "Find your natural waist (usually the narrowest part) and measure around it, keeping the tape snug but not tight.",
        unit: "inches",
        videoUrl: "https://youtu.be/3xVdy8Azqhs",
        sketchImage: "/measurement-guides/jacket/waist-sketch.svg"
      },
      { 
        key: "inseam", 
        label: "Inseam Length (Pants)", 
        description: "Measure from crotch to ankle for suit pants.", 
        detailedGuide: "Measure from your crotch down the inside of your leg to your ankle bone.",
        unit: "inches",
        videoUrl: "https://youtu.be/qJ8-OeFpGUg",
        sketchImage: "/measurement-guides/pants/inseam-sketch.svg"
      },
      {
        key: "shoulder",
        label: "Shoulder Width",
        description: "Measure from shoulder point to shoulder point.",
        detailedGuide: "Have someone help you measure across your back from the edge of one shoulder to the edge of the other.",
        unit: "inches",
        videoUrl: "https://youtu.be/8bT5sg4-Q0o",
        sketchImage: "/measurement-guides/jacket/shoulder-sketch.svg"
      },
      {
        key: "sleeve",
        label: "Sleeve Length",
        description: "Measure from shoulder point to wrist.",
        detailedGuide: "With your arm slightly bent, measure from the edge of your shoulder down to your wrist bone.",
        unit: "inches",
        videoUrl: "https://youtu.be/D9StvHaSgM8",
        sketchImage: "/measurement-guides/jacket/sleeve-sketch.svg"
      },
      {
        key: "neck",
        label: "Neck Circumference",
        description: "Measure around the neck where collar sits.",
        detailedGuide: "Place the measuring tape around your neck at the base, where your collar would normally sit. Make sure the tape is snug but not tight.",
        unit: "inches",
        videoUrl: "https://youtu.be/8eTJzzDZ-Ps",
        sketchImage: "/measurement-guides/shirt/neck-sketch.svg"
      },
      {
        key: "jacket_length",
        label: "Jacket Length",
        description: "Measure from neck to desired jacket length.",
        detailedGuide: "Start at the base of your neck and measure straight down your front to where you want the jacket to end.",
        unit: "inches",
        videoUrl: "https://youtu.be/Yi1Zd1MigyM",
        sketchImage: "/measurement-guides/jacket/front-length-sketch.svg"
      },
      {
        key: "hip",
        label: "Hip Circumference",
        description: "Measure around the fullest part of your hips.",
        detailedGuide: "Stand with feet together and measure around the fullest part of your hips and buttocks.",
        unit: "inches",
        videoUrl: "https://youtu.be/DVy9E71T3cI",
        sketchImage: "/measurement-guides/pants/hip-sketch.svg"
      },
      {
        key: "thigh",
        label: "Thigh Circumference (Pants)",
        description: "Measure around the fullest part of your thigh.",
        detailedGuide: "Measure around the fullest part of your upper thigh, usually about 2 inches below the crotch.",
        unit: "inches",
        videoUrl: "https://youtu.be/yHkL-9z_6Lg",
        sketchImage: "/measurement-guides/pants/thigh-sketch.svg"
      },
      {
        key: "back_length",
        label: "Jacket Back Length",
        description: "Measure the back length of the jacket.",
        detailedGuide: "Turn the jacket face down. From the intersection of the collar and center back seam, measure straight down along the center back to the hem.",
        unit: "inches",
        videoUrl: "https://youtu.be/dJgJkL_EXqM",
        sketchImage: "/images/jacket/back-length.png"
      },
      {
        key: "biceps",
        label: "Sleeve Bicep Width",
        description: "Measure about 1 inch below the underarm, straight across the sleeve.",
        detailedGuide: "Measure about 1 inch below the underarm, straight across the sleeve.",
        unit: "inches",
        videoUrl: "https://youtu.be/h5GvZbTVSH8",
        sketchImage: "/images/jacket/biceps.png"
      },
      {
        key: "outseam",
        label: "Outseam Length (Pants)",
        description: "Measure from waist to ankle on the outside.",
        detailedGuide: "Measure from your waist down the outside of your leg to your ankle.",
        unit: "inches",
        videoUrl: "https://youtu.be/x4E7fG3-PvY",
        sketchImage: "/measurement-guides/pants/outseam-sketch.svg"
      },
      {
        key: "armhole",
        label: "Armhole Circumference",
        description: "With the jacket laid flat and buttoned, measure from the top shoulder point along the seam where the sleeve is attached.",
        detailedGuide: "With the jacket laid flat and buttoned, measure from the top shoulder point along the seam where the sleeve is attached, following the curve all the way around back to the starting point.",
        unit: "inches",
        videoUrl: "https://youtu.be/TBFxP6pX-GE",
        sketchImage: "/images/jacket/armhole.png"
      },
      {
        key: "crotch_depth",
        label: "Crotch Depth (Pants)",
        description: "Measure from the waistband to the crotch seam.",
        detailedGuide: "Measure from the top of the waistband straight down to where the crotch seam begins.",
        unit: "inches",
        videoUrl: "https://youtu.be/qJ8-OeFpGUg",
        sketchImage: "/measurement-guides/pants/crotch-depth-sketch.svg"
      }
    ]
  },
  blazer: {
    measurements: [
      { 
        key: "chest", 
        label: "Chest Circumference", 
        description: "Measure around the fullest part of your chest.", 
        detailedGuide: "Wrap the measuring tape around your chest at nipple level, keeping the tape parallel to the floor.",
        unit: "inches",
        videoUrl: "https://youtu.be/fN7ChyTlAS8",
        sketchImage: "/measurement-guides/jacket/chest-sketch.svg"
      },
      { 
        key: "waist", 
        label: "Waist Circumference", 
        description: "Measure around your natural waistline.", 
        detailedGuide: "Find your natural waist (usually the narrowest part) and measure around it, keeping the tape snug but not tight.",
        unit: "inches",
        videoUrl: "https://youtu.be/3xVdy8Azqhs",
        sketchImage: "/measurement-guides/jacket/waist-sketch.svg"
      },
      { 
        key: "length", 
        label: "Blazer Length", 
        description: "Measure from neck to desired blazer length.", 
        detailedGuide: "Start at the base of your neck and measure straight down your front to where you want the blazer to end.",
        unit: "inches",
        videoUrl: "https://youtu.be/Yi1Zd1MigyM",
        sketchImage: "/measurement-guides/jacket/front-length-sketch.svg"
      },
      {
        key: "shoulder",
        label: "Shoulder Width",
        description: "Measure from shoulder point to shoulder point.",
        detailedGuide: "Have someone help you measure across your back from the edge of one shoulder to the edge of the other.",
        unit: "inches",
        videoUrl: "https://youtu.be/8bT5sg4-Q0o",
        sketchImage: "/measurement-guides/jacket/shoulder-sketch.svg"
      },
      {
        key: "sleeve",
        label: "Sleeve Length",
        description: "Measure from shoulder point to wrist.",
        detailedGuide: "With your arm slightly bent, measure from the edge of your shoulder down to your wrist bone.",
        unit: "inches",
        videoUrl: "https://youtu.be/D9StvHaSgM8",
        sketchImage: "/measurement-guides/jacket/sleeve-sketch.svg"
      },
      {
        key: "biceps",
        label: "Sleeve Bicep Width",
        description: "Measure about 1 inch below the underarm, straight across the sleeve.",
        detailedGuide: "Measure about 1 inch below the underarm, straight across the sleeve.",
        unit: "inches",
        videoUrl: "https://youtu.be/h5GvZbTVSH8",
        sketchImage: "/images/jacket/biceps.png"
      },
      {
        key: "back_length",
        label: "Center Back Length",
        description: "Turn the blazer face down. From the intersection of the collar and center back seam, measure straight down along the center back to the hem.",
        detailedGuide: "Turn the blazer face down. From the intersection of the collar and center back seam, measure straight down along the center back to the hem.",
        unit: "inches",
        videoUrl: "https://youtu.be/dJgJkL_EXqM",
        sketchImage: "/images/jacket/back-length.png"
      },
      {
        key: "armhole",
        label: "Armhole Circumference",
        description: "With the blazer laid flat and buttoned, measure from the top shoulder point along the seam where the sleeve is attached.",
        detailedGuide: "With the blazer laid flat and buttoned, measure from the top shoulder point along the seam where the sleeve is attached, following the curve all the way around back to the starting point.",
        unit: "inches",
        videoUrl: "https://youtu.be/TBFxP6pX-GE",
        sketchImage: "/images/jacket/armhole.png"
      },
      {
        key: "neck",
        label: "Neck Circumference",
        description: "Measure around the neck where collar sits.",
        detailedGuide: "Place the measuring tape around your neck at the base, where your collar would normally sit. Make sure the tape is snug but not tight.",
        unit: "inches",
        videoUrl: "https://youtu.be/8eTJzzDZ-Ps",
        sketchImage: "/measurement-guides/shirt/neck-sketch.svg"
      },
      {
        key: "sleeve_opening",
        label: "Sleeve Opening / Cuff Width",
        description: "Measure across the fully buttoned cuff.",
        detailedGuide: "Measure across the fully buttoned cuff.",
        unit: "inches",
        videoUrl: "https://youtu.be/fmmIXzBVVVU",
        sketchImage: "/images/jacket/sleeve-opening.png"
      },
      {
        key: "lapel_width",
        label: "Lapel Width",
        description: "Measure the width of the lapel at its widest point.",
        detailedGuide: "Measure from the outer edge of the lapel to where it meets the collar, at the widest part of the lapel.",
        unit: "inches",
        videoUrl: "https://youtu.be/8bT5sg4-Q0o",
        sketchImage: "/measurement-guides/jacket/lapel-sketch.svg"
      },
      {
        key: "button_stance",
        label: "Button Stance",
        description: "Measure from collar to first button.",
        detailedGuide: "With the blazer laid flat and buttoned, measure from the shoulder point where the seam meets the collar straight down the front to the center of the first button.",
        unit: "inches",
        videoUrl: "https://youtu.be/8eTJzzDZ-Ps",
        sketchImage: "/images/jacket/image.png"
      },
      {
        key: "vent_length",
        label: "Back Vent Length",
        description: "Measure the length of the back vent.",
        detailedGuide: "Measure from the bottom of the blazer up to where the back vent begins.",
        unit: "inches",
        videoUrl: "https://youtu.be/Yi1Zd1MigyM",
        sketchImage: "/measurement-guides/jacket/vent-sketch.svg"
      },
      {
        key: "hem_width",
        label: "Hem Width",
        description: "Measure the width at the bottom hem.",
        detailedGuide: "With the blazer laid flat, measure straight across the bottom hem from one side seam to the other.",
        unit: "inches",
        videoUrl: "https://youtu.be/DVy9E71T3cI",
        sketchImage: "/images/jacket/hem.png"
      }
    ]
  }
}

export function MeasurementStep({
  garmentType = "jacket",
  onUpdate,
}: MeasurementStepProps) {
  const [isMethodSelectionOpen, setIsMethodSelectionOpen] = useState(false)
  const [isStepByStepOpen, setIsStepByStepOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentMeasurement, setCurrentMeasurement] = useState("")
  const [currentMethod, setCurrentMethod] = useState<"videos" | "sketches">("videos")
  const [savedMeasurements, setSavedMeasurements] = useState<Record<string, string>>({})
  const [manualMeasurements, setManualMeasurements] = useState<MeasurementData>({
    neck: "", chest: "", stomach: "", hip: "", length: "", shoulder: "", sleeve: "",
    waist: "", inseam: "", thigh: "", knee: "", outseam: "", biceps: "", back_length: "",
    armhole: "", front_width: "", back_width: "", forearm: "", wrist: "", hem: "",
    front_length: "", backmass: "", sleeve_opening: "", first_button: ""
  })

  // Auto-open method selection on mount
  useEffect(() => {
    setIsMethodSelectionOpen(true)
  }, [])

  // Helper functions
  const getGarmentMeasurements = () => {
    const garmentConfig = (GARMENT_MEASUREMENTS as any)[garmentType] || GARMENT_MEASUREMENTS.jacket
    return garmentConfig.measurements || []
  }

  const getTotalMeasurementCount = (garmentType: string) => {
    const garmentConfig = (GARMENT_MEASUREMENTS as any)[garmentType] || GARMENT_MEASUREMENTS.jacket
    return garmentConfig.measurements?.length || 0
  }

  const getActiveMeasurements = () => getGarmentMeasurements()
  const getCurrentField = () => getActiveMeasurements()[currentStep]

  const handleMeasurementChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    
    // Save to local state for display in cart/configuration
    setSavedMeasurements(prev => ({
      ...prev,
      [field]: value
    }))
    
    onUpdate({
      sizeType: "custom", // Set as custom measurements
      customMeasurements: {
        neck: field === "neck" ? numValue : 0,
        chest: field === "chest" ? numValue : 0,
        stomach: field === "stomach" || field === "waist" ? numValue : 0,
        hip: field === "hip" ? numValue : 0,
        length: field === "length" ? numValue : 0,
        shoulder: field === "shoulder" ? numValue : 0,
        sleeve: field === "sleeve" ? numValue : 0,
      },
      measurementData: savedMeasurements, // Pass all measurements for cart display
      measurementMethod: currentMethod
    })

    setManualMeasurements((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleStepMeasurementSubmit = () => {
    const field = getCurrentField()
    if (field && currentMeasurement) {
      handleMeasurementChange(field.key, currentMeasurement)
    }
    
    if (currentStep < getActiveMeasurements().length - 1) {
      setCurrentStep(prev => prev + 1)
      const nextField = getActiveMeasurements()[currentStep + 1]
      setCurrentMeasurement(manualMeasurements[nextField.key as keyof MeasurementData] || "")
    } else {
      setIsStepByStepOpen(false)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      const prevField = getActiveMeasurements()[currentStep - 1]
      setCurrentMeasurement(manualMeasurements[prevField.key as keyof MeasurementData] || "")
    }
  }

  const startStepByStepMeasurement = (method: "videos" | "sketches") => {
    setCurrentMethod(method)
    onUpdate({ 
      sizeType: "custom", // Set as custom measurements
      customMeasurementMethod: method 
    })
    setIsMethodSelectionOpen(false)
    setIsStepByStepOpen(true)
    setCurrentStep(0)
    const firstField = getActiveMeasurements()[0]
    setCurrentMeasurement(manualMeasurements[firstField.key as keyof MeasurementData] || "")
  }

  return (
    <>
      {/* Sidebar Content */}
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-green-600" />
            <h3 className="font-medium text-green-800">Two Measurement Methods</h3>
          </div>
          <p className="text-sm text-green-700">
            Choose from video tutorials or sketch guides for your {garmentType} measurements.
          </p>
        </div>

        <Button 
          onClick={() => setIsMethodSelectionOpen(true)}
          className="w-full"
          variant="outline"
        >
          <Ruler className="w-4 h-4 mr-2" />
          Choose Measurement Method
        </Button>

        {/* Saved Measurements Summary */}
        {Object.keys(savedMeasurements).length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <h3 className="font-medium text-blue-800">Your Measurements</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(savedMeasurements).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-blue-700 capitalize">{key.replace('_', ' ')}:</span>
                  <span className="text-blue-900 font-medium">{value}"</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <Badge variant="secondary" className="text-blue-700">
                Method: {currentMethod === "videos" ? "Video Tutorial" : "Sketch Guide"}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Method Selection Modal */}
      <Dialog open={isMethodSelectionOpen} onOpenChange={setIsMethodSelectionOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose Your Measurement Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Ruler className="h-4 w-4" />
              <AlertDescription>
                Choose your measurement method for your {garmentType}. Each method provides a complete set of measurements.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 gap-4">
              {/* Video Tutorial Method */}
              <Card 
                className="cursor-pointer border-2 hover:border-blue-300 transition-colors"
                onClick={() => startStepByStepMeasurement("videos")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Video className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="font-medium">Video Tutorial Method</h3>
                      <p className="text-sm text-gray-600">
                        Step-by-step video guides for {getTotalMeasurementCount(garmentType)} {garmentType} measurements
                      </p>
                    </div>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Sketch Guide Method */}
              <Card 
                className="cursor-pointer border-2 hover:border-green-300 transition-colors"
                onClick={() => startStepByStepMeasurement("sketches")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Edit3 className="w-8 h-8 text-green-600" />
                    <div className="flex-1">
                      <h3 className="font-medium">Sketch Guide Method</h3>
                      <p className="text-sm text-gray-600">
                        Visual diagram guides for {getTotalMeasurementCount(garmentType)} {garmentType} measurements
                      </p>
                    </div>
                    <Badge variant="outline">Visual Guide</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step-by-Step Measurement Modal */}
      <Dialog open={isStepByStepOpen} onOpenChange={setIsStepByStepOpen}>
        <DialogContent className={`max-h-[90vh] overflow-y-auto ${currentMethod === "videos" ? "max-w-7xl" : "max-w-6xl"}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentMethod === "videos" ? (
                <Video className="w-5 h-5 text-blue-600" />
              ) : (
                <Edit3 className="w-5 h-5 text-green-600" />
              )}
              {currentMethod === "videos" ? "Video Tutorial" : "Sketch Guide"} - Step {currentStep + 1} of {getActiveMeasurements().length}: {getCurrentField()?.label}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{currentStep + 1} / {getActiveMeasurements().length}</span>
              </div>
              <Progress value={((currentStep + 1) / getActiveMeasurements().length) * 100} />
            </div>

            {getCurrentField() && (
              <>
                {/* VIDEO METHOD - Different Layout */}
                {currentMethod === "videos" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Video Player Section - Takes more space */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-xl font-semibold text-blue-900">{getCurrentField().label}</h3>
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                        {getCurrentField().videoUrl ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={getCurrentField().videoUrl.replace('youtu.be/', 'youtube.com/embed/')}
                            title={`How to measure ${getCurrentField().label}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Input Section - Compact */}
                    <div className="space-y-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <Label htmlFor="measurement" className="text-sm font-medium text-gray-700 mb-3 block">
                          Enter {getCurrentField().label}
                        </Label>
                        <div className="space-y-3">
                          <Input
                            id="measurement"
                            type="number"
                            step="0.25"
                            min="0"
                            placeholder={`Enter in ${getCurrentField().unit}`}
                            value={currentMeasurement}
                            onChange={(e) => setCurrentMeasurement(e.target.value)}
                            className="text-lg text-center"
                          />
                          <div className="text-xs text-gray-500 text-center">
                            Unit: {getCurrentField().unit}
                          </div>
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="space-y-2">
                        <Button
                          onClick={handleStepMeasurementSubmit}
                          className="w-full"
                          disabled={!currentMeasurement}
                        >
                          {currentStep === getActiveMeasurements().length - 1 ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete Measurements
                            </>
                          ) : (
                            <>
                              Next Measurement
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handlePreviousStep}
                          disabled={currentStep === 0}
                          variant="outline"
                          className="w-full"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>
                      </div>

                      {/* Saved Measurements Summary */}
                      {Object.keys(savedMeasurements).length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-green-800 mb-2">Saved Measurements</h4>
                          <div className="space-y-1">
                            {Object.entries(savedMeasurements).map(([key, value]) => (
                              <div key={key} className="text-xs text-green-700 flex justify-between">
                                <span className="capitalize">{key}:</span>
                                <span>{value} {getCurrentField().unit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Video Instructions Section - Below buttons */}
                      {getCurrentField().videoGuide && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-900">Video Instructions</h4>
                          </div>
                          <p className="text-sm text-blue-800 leading-relaxed">
                            {getCurrentField().videoGuide}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SKETCH METHOD - Different Layout */}
                {currentMethod === "sketches" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sketch Diagram Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-green-800">{getCurrentField().label}</h3>
                      <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        {getCurrentField().sketchImage ? (
                          <img
                            src={getCurrentField().sketchImage}
                            alt={`Measurement guide for ${getCurrentField().label}`}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <Edit3 className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Measurement Diagram</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Input Section */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="measurement" className="text-sm font-medium">
                          Enter {getCurrentField().label} ({getCurrentField().unit})
                        </Label>
                        <Input
                          id="measurement"
                          type="number"
                          step="0.25"
                          min="0"
                          placeholder={`Enter ${getCurrentField().label.toLowerCase()}`}
                          value={currentMeasurement}
                          onChange={(e) => setCurrentMeasurement(e.target.value)}
                          className="text-lg mt-2"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handlePreviousStep}
                          disabled={currentStep === 0}
                          variant="outline"
                          className="flex-1"
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>
                        <Button
                          onClick={handleStepMeasurementSubmit}
                          className="flex-1"
                          disabled={!currentMeasurement}
                        >
                          {currentStep === getActiveMeasurements().length - 1 ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete
                            </>
                          ) : (
                            <>
                              Next Measurement
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Step-by-Step Guide Section - Below buttons */}
                      {getCurrentField().detailedGuide && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-green-600" />
                            <h4 className="font-semibold text-green-900">Step-by-Step Guide</h4>
                          </div>
                          <p className="text-sm text-green-800 leading-relaxed">
                            {getCurrentField().detailedGuide}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}