import { jsPDF } from "jspdf"
import "jspdf-autotable"

interface PDFGenerationData {
  mode: string
  fabric: any
  styles: Record<string, any>
  size?: any
  measurements?: any
  price: number
}

export async function generatePDF(data: PDFGenerationData) {
  // Create a new PDF document
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(20)
  doc.text("Custom Garment Order Summary", 105, 20, { align: "center" })

  // Add date
  doc.setFontSize(10)
  doc.text(`Date: €{new Date().toLocaleDateString()}`, 105, 30, { align: "center" })

  // Add mode
  doc.setFontSize(14)
  doc.text(`Mode: €{data.mode}`, 20, 40)

  // Add fabric details
  doc.setFontSize(14)
  doc.text("Fabric", 20, 50)

  if (data.fabric) {
    doc.setFontSize(12)
    doc.text(`Name: €{data.fabric.name}`, 30, 60)
    doc.text(`Color: €{data.fabric.color}`, 30, 70)
    doc.text(`Price: €€{data.fabric.pricePerUnit.toFixed(2)}`, 30, 80)
  } else {
    doc.setFontSize(12)
    doc.text("No fabric selected", 30, 60)
  }

  // Add style options
  doc.setFontSize(14)
  doc.text("Style Options", 20, 100)

  if (Object.keys(data.styles).length > 0) {
    const styleRows = Object.entries(data.styles).map(([category, option]: [string, any]) => [
      category,
      option.name,
      option.priceDelta > 0 ? `+€€{option.priceDelta.toFixed(2)}` : "Included",
    ])

    // @ts-ignore - jspdf-autotable types are not properly recognized
    doc.autoTable({
      startY: 110,
      head: [["Category", "Option", "Price"]],
      body: styleRows,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
    })
  } else {
    doc.setFontSize(12)
    doc.text("No style options selected", 30, 110)
  }

  // Add size or measurements
  const measurementsStartY = doc.lastAutoTable?.finalY || 130

  doc.setFontSize(14)
  doc.text(data.mode === "MTO" ? "Size" : "Measurements", 20, measurementsStartY + 10)

  if (data.mode === "MTO" && data.size) {
    doc.setFontSize(12)
    doc.text(`Size: €{data.size.name}`, 30, measurementsStartY + 20)

    const measurementRows = Object.entries(data.size.measurements).map(([key, value]) => [key, `€{value}"`])

    // @ts-ignore
    doc.autoTable({
      startY: measurementsStartY + 30,
      head: [["Measurement", "Value"]],
      body: measurementRows,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
    })
  } else if (data.mode === "MTM" && data.measurements) {
    const measurementRows = Object.entries(data.measurements).map(([key, value]) => [key, `€{value}"`])

    // @ts-ignore
    doc.autoTable({
      startY: measurementsStartY + 20,
      head: [["Measurement", "Value"]],
      body: measurementRows,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
    })
  } else {
    doc.setFontSize(12)
    doc.text(data.mode === "MTO" ? "No size selected" : "No measurements entered", 30, measurementsStartY + 20)
  }

  // Add total price
  const priceY = doc.lastAutoTable?.finalY || measurementsStartY + 40

  doc.setFontSize(14)
  doc.text("Total Price", 20, priceY + 10)
  doc.setFontSize(16)
  doc.text(`€€{data.price.toFixed(2)}`, 60, priceY + 10)

  // Add footer
  doc.setFontSize(10)
  doc.text("Thank you for your custom garment order!", 105, 280, { align: "center" })

  // Save the PDF
  doc.save("custom-garment-order.pdf")
}
