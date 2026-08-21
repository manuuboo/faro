import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDate } from './format';
import type { Invoice } from '../types/business';

export interface IssuerInfo {
  name: string;
  cuit: string;
  logo: string; // base64 Data URL
}

export function generateInvoicePDF(invoice: Invoice, issuer: IssuerInfo, customer: any) {
  const doc = new jsPDF();
  
  // ── Faro Visual Identity (Violet Accents) ──
  const primaryColor: [number, number, number] = [139, 92, 246]; // #8b5cf6
  
  // ── Logo ──
  if (issuer.logo) {
    try {
      doc.addImage(issuer.logo, 'PNG', 14, 15, 25, 25);
    } catch (e) {
      console.error('Error adding logo to PDF', e);
    }
  }

  // ── Header (Issuer & Type) ──
  doc.setFontSize(20);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FACTURA', 196, 25, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Tipo: ${invoice.type || 'C'}`, 196, 32, { align: 'right' });
  doc.text(`Nº: ${invoice.number}`, 196, 37, { align: 'right' });
  doc.text(`Fecha: ${formatDate(invoice.issueDate)}`, 196, 42, { align: 'right' });

  // ── Issuer Info ──
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.setFont("helvetica", "bold");
  doc.text(issuer.name || 'Mi Negocio', 45, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`CUIT: ${issuer.cuit || 'No especificado'}`, 45, 32);
  
  // ── Thin Separator ──
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(14, 50, 196, 50);

  // ── Customer Info ──
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40);
  doc.text('Facturar a:', 14, 60);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Señor/a: ${customer.name || invoice.clientName}`, 14, 67);
  doc.text(`CUIT/DNI: ${customer.cuit || 'Consumidor Final'}`, 14, 73);
  if (customer.email) doc.text(`Email: ${customer.email}`, 14, 79);
  if (customer.phone) doc.text(`Tel: ${customer.phone}`, 14, 85);

  // ── Items Table ──
  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.quantity * item.unitPrice)
  ]);

  autoTable(doc, {
    startY: 95,
    head: [['Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      textColor: [60, 60, 60],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 35 },
    },
    alternateRowStyles: {
      fillColor: [249, 245, 255] // Very light violet
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // ── Totals ──
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text('Subtotal:', 140, finalY);
  doc.text(formatCurrency(invoice.subtotal), 196, finalY, { align: 'right' });
  
  if (invoice.tax > 0) {
    doc.text('Impuestos:', 140, finalY + 7);
    doc.text(formatCurrency(invoice.tax), 196, finalY + 7, { align: 'right' });
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TOTAL:', 140, finalY + 15);
  doc.text(formatCurrency(invoice.total), 196, finalY + 15, { align: 'right' });

  // ── Notes ──
  if (invoice.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text('Notas:', 14, finalY);
    doc.setFontSize(9);
    doc.text(invoice.notes, 14, finalY + 6, { maxWidth: 100 });
  }

  // ── Footer ──
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Documento no válido como factura fiscal (Generado por Faro)', 105, 285, { align: 'center' });

  doc.save(`Factura-${invoice.number}.pdf`);
}
