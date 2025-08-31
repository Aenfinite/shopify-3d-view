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
        unit: "inches",
        videoUrl: "https://youtu.be/8eTJzzDZ-Ps",
        sketchImage: "/measurement-guides/shirt/neck-sketch.svg"
      },
      { 
        key: "chest", 
        label: "Chest Circumference", 
        description: "Measure around the fullest part of your chest.", 
        detailedGuide: "Wrap the measuring tape around your chest at the fullest point. Keep your arms relaxed at your sides and breathe normally.",
        unit: "inches",
        videoUrl: "https://youtu.be/fN7ChyTlAS8",
        sketchImage: "/measurement-guides/shirt/chest-sketch.svg"
      },
      { 
        key: "waist", 
        label: "Waist Circumference", 
        description: "Measure around your natural waistline.", 
        detailedGuide: "Find your natural waist and wrap the tape around this area while standing straight.",
        unit: "inches",
        videoUrl: "https://youtu.be/3xVdy8Azqhs",
        sketchImage: "/measurement-guides/shirt/waist-sketch.svg"
      },
      { 
        key: "shoulder", 
        label: "Shoulder Width", 
        description: "Measure from shoulder point to shoulder point.", 
        detailedGuide: "Have someone help you measure across your back from the edge of one shoulder to the edge of the other.",
        unit: "inches",
        videoUrl: "https://youtu.be/8bT5sg4-Q0o",
        sketchImage: "/measurement-guides/shirt/shoulder-sketch.svg"
      },
      { 
        key: "sleeve", 
        label: "Sleeve Length", 
        description: "Measure from shoulder to wrist.", 
        detailedGuide: "With your arm slightly bent, measure from the edge of your shoulder down to your wrist bone.",
        unit: "inches",
        videoUrl: "https://youtu.be/D9StvHaSgM8",
        sketchImage: "/measurement-guides/shirt/sleeve-sketch.svg"
      },
      { 
        key: "length", 
        label: "Shirt Length", 
        description: "Measure from neck to desired shirt length.", 
        detailedGuide: "Start at the base of your neck and measure straight down to where you want the shirt to end.",
        unit: "inches",
        videoUrl: "https://youtu.be/Yi1Zd1MigyM",
        sketchImage: "/measurement-guides/shirt/length-sketch.svg"
      },
      {
        key: "biceps",
        label: "Bicep Circumference",
        description: "Measure around the fullest part of your upper arm.",
        detailedGuide: "Flex your arm and measure around the fullest part of your bicep muscle.",
        unit: "inches",
        videoUrl: "https://youtu.be/h5GvZbTVSH8",
        sketchImage: "/measurement-guides/shirt/bicep-sketch.svg"
      },
      {
        key: "forearm",
        label: "Forearm Circumference",
        description: "Measure around the fullest part of your forearm.",
        detailedGuide: "Measure around the widest part of your forearm, usually about 2 inches below your elbow.",
        unit: "inches",
        videoUrl: "https://youtu.be/h5GvZbTVSH8",
        sketchImage: "/measurement-guides/shirt/forearm-sketch.svg"
      },
      {
        key: "wrist",
        label: "Wrist Circumference",
        description: "Measure around your wrist where the cuff will sit.",
        detailedGuide: "Measure around your wrist bone where the shirt cuff would normally sit.",
        unit: "inches",
        videoUrl: "https://youtu.be/fmmIXzBVVVU",
        sketchImage: "/measurement-guides/shirt/wrist-sketch.svg"
      },
      {
        key: "back_width",
        label: "Back Width",
        description: "Measure across the back from armpit to armpit.",
        detailedGuide: "Measure straight across the back from one armpit to the other, keeping the tape parallel to the ground.",
        unit: "inches",
        videoUrl: "https://youtu.be/QY9CK9wqHMw",
        sketchImage: "/measurement-guides/shirt/back-width-sketch.svg"
      },
      {
        key: "yoke",
        label: "Yoke Width",
        description: "Measure the yoke from shoulder seam to shoulder seam.",
        detailedGuide: "Measure across the yoke (upper back area) from one shoulder seam to the other.",
        unit: "inches",
        videoUrl: "https://youtu.be/QY9CK9wqHMw",
        sketchImage: "/measurement-guides/shirt/yoke-sketch.svg"
      },
      {
        key: "front_width",
        label: "Front Width",
        description: "Measure across the front from armpit to armpit.",
        detailedGuide: "Measure straight across the front from one armpit to the other, keeping the tape parallel to the ground.",
        unit: "inches",
        videoUrl: "https://youtu.be/fN7ChyTlAS8",
        sketchImage: "/measurement-guides/shirt/front-width-sketch.svg"
      },
      {
        key: "hip",
        label: "Hip Circumference",
        description: "Measure around the fullest part of your hips.",
        detailedGuide: "Stand with feet together and measure around the fullest part of your hips and buttocks.",
        unit: "inches",
        videoUrl: "https://youtu.be/DVy9E71T3cI",
        sketchImage: "/measurement-guides/shirt/hip-sketch.svg"
      },
      {
        key: "hem_width",
        label: "Hem Width",
        description: "Measure the width at the bottom hem of the shirt.",
        detailedGuide: "Measure straight across the bottom hem of the shirt from one side seam to the other.",
        unit: "inches",
        videoUrl: "https://youtu.be/DVy9E71T3cI",
        sketchImage: "/measurement-guides/shirt/hem-sketch.svg"
      }
    ]
  },
  jacket: {
    measurements: [
      {
        key: "chest",
        label: "Chest",
        description: "Measure around the fullest part of your chest.",
        detailedGuide: "Stand upright with arms at your sides. Wrap the tape around the fullest part of your chest, under your arms. Keep the tape level and snug but not tight.",
        unit: "cm",
        videoUrl: "https://youtu.be/JFf0as-X7jA",
        sketchImage: "/images/jacket/chest.png"
      },
      {
        key: "waist",
        label: "Waist",
        description: "Measure around your natural waistline.",
        detailedGuide: "Find your natural waist (usually the narrowest part) and measure around it, keeping the tape snug but not tight.",
        unit: "cm",
        videoUrl: "https://youtu.be/3xVdy8Azqhs",
        sketchImage: "/images/jacket/waist.png"
      },
      {
        key: "hem",
        label: "Hem",
        description: "Measure around the hem of the jacket.",
        detailedGuide: "Measure around the bottom hem area of where the jacket would end.",
        unit: "cm",
        videoUrl: "https://youtu.be/DVy9E71T3cI",
        sketchImage: "/images/jacket/hem.png"
      },
      {
        key: "front_length",
        label: "Front Length",
        description: "Measure from shoulder to desired front length.",
        detailedGuide: "Measure from the high point of your shoulder down the front to where you want the jacket to end.",
        unit: "cm",
        videoUrl: "https://youtu.be/Yi1Zd1MigyM",
        sketchImage: "/images/jacket/front-length.png"
      },
      {
        key: "first_button",
        label: "FB (First Button)",
        description: "Position of the first button.",
        detailedGuide: "Measure from the base of the collar to where the first button should be positioned.",
        unit: "cm",
        videoUrl: "https://youtu.be/8eTJzzDZ-Ps",
        sketchImage: "/images/jacket/first-button.png"
      },
      {
        key: "back_length",
        label: "Back Length",
        description: "Measure from neck to desired back length.",
        detailedGuide: "Measure from the base of your neck down the back to where you want the jacket to end.",
        unit: "cm",
        videoUrl: "https://youtu.be/qJn27RFvNsk",
        sketchImage: "/images/jacket/back-length.png"
      },
      {
        key: "shoulder",
        label: "Shoulder",
        description: "Measure across your shoulders.",
        detailedGuide: "Measure from one shoulder point to the other across your back.",
        unit: "cm",
        videoUrl: "https://youtu.be/8bT5sg4-Q0o",
        sketchImage: "/images/jacket/shoulder.png"
      },
      {
        key: "backmass",
        label: "Backmass",
        description: "Measure the back width.",
        detailedGuide: "Measure across the back at the widest point.",
        unit: "cm",
        videoUrl: "https://youtu.be/ZeOSNRw9NRM",
        sketchImage: "/images/jacket/backmass.png"
      },
      {
        key: "sleeve_length",
        label: "Sleeve Length",
        description: "Measure from shoulder to wrist.",
        detailedGuide: "With arm slightly bent, measure from shoulder point down to your wrist.",
        unit: "cm",
        videoUrl: "https://youtu.be/D9StvHaSgM8",
        sketchImage: "/images/jacket/sleeve-length.png"
      },
      {
        key: "armhole",
        label: "Armhole",
        description: "Measure around the armhole.",
        detailedGuide: "Measure around your arm where the armhole of the jacket would sit.",
        unit: "cm",
        videoUrl: "https://youtu.be/p3SCb2WsP2M",
        sketchImage: "/images/jacket/armhole.png"
      },
      {
        key: "biceps",
        label: "Biceps",
        description: "Measure around the largest part of your upper arm.",
        detailedGuide: "With arms relaxed, wrap the tape around the fullest part of your upper arm without tensing the muscles. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/h5GvZbTVSH8",
        sketchImage: "/images/jacket/biceps.png"
      },
      {
        key: "wrist",
        label: "Wrist",
        description: "Measure around your wrist bone.",
        detailedGuide: "Wrap the tape around the widest point of your wrist, over the carpal bone. Record the measurement.",
        unit: "cm",
        videoUrl: "https://youtu.be/9fgnZ0YQ2Mk",
        sketchImage: "/images/jacket/sleeve-opening.png"
      }
    ]
  },
  pants: {
    measurements: [
      { 
        key: "waist", 
        label: "Waist Circumference", 
        description: "Measure around your natural waistline.", 
        detailedGuide: "Find your natural waist (usually the narrowest part) and measure around it, keeping the tape snug but not tight.",
        unit: "inches",
        videoUrl: "https://youtu.be/3xVdy8Azqhs",
        sketchImage: "/measurement-guides/pants/waist-sketch.svg"
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
        key: "inseam", 
        label: "Inseam Length", 
        description: "Measure from crotch to ankle.", 
        detailedGuide: "Measure from your crotch down the inside of your leg to your ankle bone.",
        unit: "inches",
        videoUrl: "https://youtu.be/qJ8-OeFpGUg",
        sketchImage: "/measurement-guides/pants/inseam-sketch.svg"
      },
      { 
        key: "thigh", 
        label: "Thigh Circumference", 
        description: "Measure around the fullest part of your thigh.", 
        detailedGuide: "Measure around the fullest part of your upper thigh, usually about 2 inches below the crotch.",
        unit: "inches",
        videoUrl: "https://youtu.be/yHkL-9z_6Lg",
        sketchImage: "/measurement-guides/pants/thigh-sketch.svg"
      },
      { 
        key: "knee", 
        label: "Knee Circumference", 
        description: "Measure around your knee.", 
        detailedGuide: "Measure around your knee at the kneecap level.",
        unit: "inches",
        videoUrl: "https://youtu.be/tN8v4L2QP_I",
        sketchImage: "/measurement-guides/pants/knee-sketch.svg"
      },
      { 
        key: "outseam", 
        label: "Outseam Length", 
        description: "Measure from waist to ankle on the outside.", 
        detailedGuide: "Measure from your waist down the outside of your leg to your ankle.",
        unit: "inches",
        videoUrl: "https://youtu.be/x4E7fG3-PvY",
        sketchImage: "/measurement-guides/pants/outseam-sketch.svg"
      },
      {
        key: "calf",
        label: "Calf Circumference",
        description: "Measure around the fullest part of your calf.",
        detailedGuide: "Measure around the widest part of your calf muscle.",
        unit: "inches",
        videoUrl: "https://youtu.be/tN8v4L2QP_I",
        sketchImage: "/measurement-guides/pants/calf-sketch.svg"
      },
      {
        key: "ankle",
        label: "Ankle Circumference",
        description: "Measure around your ankle.",
        detailedGuide: "Measure around your ankle at the narrowest point, just above the ankle bone.",
        unit: "inches",
        videoUrl: "https://youtu.be/x4E7fG3-PvY",
        sketchImage: "/measurement-guides/pants/ankle-sketch.svg"
      },
      {
        key: "rise",
        label: "Front Rise",
        description: "Measure from the crotch to the waistband in front.",
        detailedGuide: "Measure from the crotch seam straight up to the top of the waistband at the front.",
        unit: "inches",
        videoUrl: "https://youtu.be/qJ8-OeFpGUg",
        sketchImage: "/measurement-guides/pants/front-rise-sketch.svg"
      },
      {
        key: "back_rise",
        label: "Back Rise",
        description: "Measure from the crotch to the waistband in back.",
        detailedGuide: "Measure from the crotch seam straight up to the top of the waistband at the back.",
        unit: "inches",
        videoUrl: "https://youtu.be/qJ8-OeFpGUg",
        sketchImage: "/measurement-guides/pants/back-rise-sketch.svg"
      },
      {
        key: "hem_width",
        label: "Hem Width",
        description: "Measure the width of the pant leg opening.",
        detailedGuide: "Measure straight across the bottom opening of the pant leg from one side to the other.",
        unit: "inches",
        videoUrl: "https://youtu.be/x4E7fG3-PvY",
        sketchImage: "/measurement-guides/pants/hem-width-sketch.svg"
      },
      {
        key: "seat",
        label: "Seat Width",
        description: "Measure across the seat at the fullest part.",
        detailedGuide: "Lay the pants flat and measure across the seat area at the fullest part of the buttocks.",
        unit: "inches",
        videoUrl: "https://youtu.be/DVy9E71T3cI",
        sketchImage: "/measurement-guides/pants/seat-sketch.svg"
      },
      {
        key: "crotch_depth",
        label: "Crotch Depth",
        description: "Measure from the waistband to the crotch seam.",
        detailedGuide: "Measure from the top of the waistband straight down to where the crotch seam begins.",
        unit: "inches",
        videoUrl: "https://youtu.be/qJ8-OeFpGUg",
        sketchImage: "/measurement-guides/pants/crotch-depth-sketch.svg"
      },
      {
        key: "pocket_depth",
        label: "Pocket Depth",
        description: "Measure the depth of the side pockets.",
        detailedGuide: "Measure from the pocket opening straight down to the bottom of the pocket.",
        unit: "inches",
        videoUrl: "https://youtu.be/3xVdy8Azqhs",
        sketchImage: "/measurement-guides/pants/pocket-sketch.svg"
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
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Video Instructions</h4>
                        <p className="text-sm text-blue-800">{getCurrentField().detailedGuide}</p>
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
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Step-by-Step Guide</h4>
                        <p className="text-sm text-green-700">{getCurrentField().detailedGuide}</p>
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
                              Next
                              <ChevronRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Measurement Tips */}
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-amber-800 mb-1">Measurement Tips</h4>
                        <ul className="text-xs text-amber-700 space-y-1">
                          <li>• Use a flexible measuring tape</li>
                          <li>• Stand straight and relaxed</li>
                          <li>• Don't pull the tape too tight</li>
                          <li>• Ask someone to help for accuracy</li>
                        </ul>
                      </div>
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