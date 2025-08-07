// Enhanced PDF exports with better formatting and visibility
// These functions are called from client components only

import type { SaleWithLines, PurchaseWithLines } from '@/types'
import { COMPANY_NAME } from '@/lib/constants'

export async function exportSalesReportPDF(options: {
  sales: SaleWithLines[]
  periodLabel?: string
  filtersLabel?: string
}) {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' }) // Changed to landscape

  // Enhanced Header
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(20) // Increased font size
  doc.text(`${COMPANY_NAME} — Rapport des Ventes`, 40, 45)
  
  // Add a subtle line under header
  doc.setLineWidth(1)
  doc.line(40, 52, 800, 52)
  
  doc.setFontSize(11) // Slightly larger
  const generatedAt = new Date().toLocaleString('fr-FR')
  doc.text(`Généré le: ${generatedAt}`, 40, 70)

  // Meta block with better spacing
  let metaY = 90
  if (options.periodLabel) {
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60) // Slightly gray for meta info
    doc.text(options.periodLabel, 40, metaY)
    metaY += 18
  }
  if (options.filtersLabel) {
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.text(options.filtersLabel, 40, metaY)
    metaY += 18
  }

  const rows: any[] = []
  options.sales.forEach((sale) => {
    sale.lignes_vente.forEach((line) => {
      rows.push([
        `#${sale.id}`,
        new Date(sale.date_vente).toLocaleDateString('fr-FR'), // Only date, not time
        sale.nom_client,
        sale.utilisateurs ? `${sale.utilisateurs.prenom} ${sale.utilisateurs.nom}` : '-',
        line.produit_nom,
        (line as any).categories?.nom || '-',
        line.quantite.toString(),
        `${Number(line.prix_unitaire).toFixed(2)} DH`,
        `${Number(line.total_ligne).toFixed(2)} DH`,
      ])
    })
  })

  doc.setTextColor(0, 0, 0) // Reset to black

  autoTable(doc, {
    startY: metaY + 20,
    head: [[
      'N° Vente', 'Date', 'Client', 'Vendeur', 'Produit', 'Catégorie', 'Qté', 'Prix Unit.', 'Total Ligne'
    ]],
    body: rows,
    styles: { 
      fontSize: 10, // Increased from 9
      lineColor: [200, 200, 200], // Lighter lines
      lineWidth: 0.5, 
      textColor: [0, 0, 0],
      cellPadding: { top: 6, right: 4, bottom: 6, left: 4 }, // More padding
    },
    headStyles: { 
      fillColor: [245, 245, 245], // Light gray background
      textColor: [0, 0, 0], 
      fontStyle: 'bold', 
      lineColor: [150, 150, 150], 
      lineWidth: 1,
      fontSize: 11, // Larger header font
    },
    alternateRowStyles: { fillColor: [252, 252, 252] }, // Very light alternating rows
    columnStyles: {
      0: { cellWidth: 60, halign: 'center' }, // Vente ID
      1: { cellWidth: 80, halign: 'center' }, // Date
      2: { cellWidth: 120, halign: 'left' }, // Client
      3: { cellWidth: 100, halign: 'left' }, // Vendeur
      4: { cellWidth: 150, halign: 'left' }, // Produit
      5: { cellWidth: 100, halign: 'left' }, // Catégorie
      6: { cellWidth: 50, halign: 'center' }, // Quantité
      7: { cellWidth: 80, halign: 'right' }, // Prix unitaire
      8: { cellWidth: 80, halign: 'right' }, // Total ligne
    }
  })

  // Enhanced totals section
  const total = options.sales.reduce((s, v) => s + Number(v.total), 0)
  const finalY = (doc as any).lastAutoTable.finalY + 30
  
  // Add a line above total
  doc.setLineWidth(1)
  doc.line(40, finalY - 10, 800, finalY - 10)
  
  doc.setFontSize(14) // Larger total font
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL GÉNÉRAL: ${total.toFixed(2)} DH`, 40, finalY)

  // Add summary info
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Nombre de ventes: ${options.sales.length}`, 40, finalY + 20)
  doc.text(`Nombre d'articles: ${rows.length}`, 40, finalY + 35)

  doc.save('rapport-ventes.pdf')
}

export async function exportPurchasesReportPDF(options: {
  purchases: PurchaseWithLines[]
  periodLabel?: string
  filtersLabel?: string
}) {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' })

  // Enhanced Header
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(20)
  doc.text(`${COMPANY_NAME} — Rapport des Achats`, 40, 45)
  
  doc.setLineWidth(1)
  doc.line(40, 52, 800, 52)
  
  doc.setFontSize(11)
  const generatedAt = new Date().toLocaleString('fr-FR')
  doc.text(`Généré le: ${generatedAt}`, 40, 70)

  // Meta block
  let metaY = 90
  if (options.periodLabel) {
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.text(options.periodLabel, 40, metaY)
    metaY += 18
  }
  if (options.filtersLabel) {
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.text(options.filtersLabel, 40, metaY)
    metaY += 18
  }

  const rows: any[] = []
  options.purchases.forEach((p) => {
    p.lignes_achat.forEach((line) => {
      rows.push([
        `#${p.id}`,
        new Date(p.date_achat).toLocaleDateString('fr-FR'),
        p.nom_fournisseur,
        p.utilisateurs ? `${p.utilisateurs.prenom} ${p.utilisateurs.nom}` : '-',
        line.produit_nom,
        (line as any).categories?.nom || '-',
        (line as any).wood_types?.nom || '-',
        line.quantite.toString(),
        `${Number(line.prix_unitaire).toFixed(2)} DH`,
        `${Number(line.total_ligne).toFixed(2)} DH`,
      ])
    })
  })

  doc.setTextColor(0, 0, 0)

  autoTable(doc, {
    startY: metaY + 20,
    head: [[
      'N° Achat', 'Date', 'Fournisseur', 'Acheteur', 'Produit', 'Catégorie', 'Type Bois', 'Qté', 'Prix Unit.', 'Total'
    ]],
    body: rows,
    styles: { 
      fontSize: 10,
      lineColor: [200, 200, 200],
      lineWidth: 0.5, 
      textColor: [0, 0, 0],
      cellPadding: { top: 6, right: 4, bottom: 6, left: 4 },
    },
    headStyles: { 
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0], 
      fontStyle: 'bold', 
      lineColor: [150, 150, 150], 
      lineWidth: 1,
      fontSize: 11,
    },
    alternateRowStyles: { fillColor: [252, 252, 252] },
    columnStyles: {
      0: { cellWidth: 50, halign: 'center' }, // Achat ID
      1: { cellWidth: 75, halign: 'center' }, // Date
      2: { cellWidth: 90, halign: 'left' }, // Fournisseur
      3: { cellWidth: 80, halign: 'left' }, // Acheteur
      4: { cellWidth: 100, halign: 'left' }, // Produit
      5: { cellWidth: 85, halign: 'left' }, // Catégorie
      6: { cellWidth: 60, halign: 'left' }, // Type de bois
      7: { cellWidth: 45, halign: 'center' }, // Quantité
      8: { cellWidth: 75, halign: 'right' }, // Prix unitaire
      9: { cellWidth: 80, halign: 'right' }, // Total ligne
    }
  })

  const total = options.purchases.reduce((s, v) => s + Number(v.total), 0)
  const finalY = (doc as any).lastAutoTable.finalY + 30
  
  doc.setLineWidth(1)
  doc.line(40, finalY - 10, 800, finalY - 10)
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL GÉNÉRAL: ${total.toFixed(2)} DH`, 40, finalY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Nombre d'achats: ${options.purchases.length}`, 40, finalY + 20)
  doc.text(`Nombre d'articles: ${rows.length}`, 40, finalY + 35)

  doc.save('rapport-achats.pdf')
}

export async function exportSaleReceiptPDF(sale: SaleWithLines) {
  const { default: jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ unit: 'pt', format: 'a5' })
  
  // Enhanced Header
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16) // Increased
  doc.text(`${COMPANY_NAME}`, 40, 35)
  
  doc.setFontSize(14)
  doc.text(`Reçu de Vente`, 40, 55)
  
  // Add line separator
  doc.setLineWidth(1)
  doc.line(40, 62, 380, 62)
  
  doc.setFontSize(11) // Increased from 10
  doc.text(`N°: #${sale.id}`, 40, 80)
  doc.text(`Client: ${sale.nom_client}`, 40, 96)
  doc.text(`Date: ${new Date(sale.date_vente).toLocaleString('fr-FR')}`, 40, 112)

  const rows = sale.lignes_vente.map((l) => [
    l.produit_nom,
    (l as any).categories?.nom || '-',
    l.quantite.toString(),
    `${Number(l.prix_unitaire).toFixed(2)} DH`,
    `${Number(l.total_ligne).toFixed(2)} DH`,
  ])

  autoTable(doc, {
    startY: 130,
    head: [['Produit', 'Catégorie', 'Qté', 'Prix Unit.', 'Total']],
    body: rows,
    styles: { 
      fontSize: 10, // Increased from 9
      lineColor: [200, 200, 200],
      lineWidth: 0.5, 
      textColor: [0, 0, 0],
      cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
    },
    headStyles: { 
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0], 
      fontStyle: 'bold', 
      lineColor: [150, 150, 150], 
      lineWidth: 1,
      fontSize: 11,
    },
    columnStyles: {
      0: { cellWidth: 140, halign: 'left' }, // Produit
      1: { cellWidth: 80, halign: 'left' }, // Catégorie
      2: { cellWidth: 40, halign: 'center' }, // Quantité
      3: { cellWidth: 65, halign: 'right' }, // Prix unitaire
      4: { cellWidth: 70, halign: 'right' }, // Total
    }
  })

  // Enhanced total section
  const finalY = (doc as any).lastAutoTable.finalY + 25
  
  doc.setLineWidth(1)
  doc.line(40, finalY - 5, 380, finalY - 5)
  
  doc.setFontSize(14) // Larger total
  doc.setFont('helvetica', 'bold')
  doc.text(`TOTAL: ${Number(sale.total).toFixed(2)} DH`, 40, finalY + 15)
  
  // Add thank you message
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Merci pour votre achat!`, 40, finalY + 35)
  
  doc.save(`recu-vente-${sale.id}.pdf`)
}