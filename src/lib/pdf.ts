import { jsPDF } from 'jspdf';
import type { Business, Customer, Invoice, InvoiceItem } from './types';
import { formatMoney } from './currency';

export interface InvoicePdfData {
  invoice: Invoice;
  items: InvoiceItem[];
  business: Business;
  customer: Customer | null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Build a clean, professional A4 invoice PDF with jsPDF only
 * (no extra table plugins — the grid is drawn manually).
 */
export function generateInvoicePdf(data: InvoicePdfData): jsPDF {
  const { invoice, items, business, customer } = data;
  const currency = business.currency || 'INR';
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const right = pageWidth - margin;
  let y = 18;

  // ── Header: business name + INVOICE title ──────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);
  doc.text(business.name || 'Your Business', margin, y);

  doc.setFontSize(24);
  doc.setTextColor(79, 70, 229);
  doc.text('INVOICE', right, y, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  const bizLines = [
    invoice.business_address || business.address || '',
    [business.email, business.phone].filter(Boolean).join('  •  '),
  ].filter(Boolean);
  for (const line of bizLines) {
    if (!line) continue;
    const wrapped = doc.splitTextToSize(line, pageWidth / 2 - margin);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 5;
  }
  y = Math.max(y, 34);

  // ── Meta block (right aligned) ─────────────────────────────────────────
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const meta: Array<[string, string]> = [
    ['Invoice no:', invoice.invoice_number],
    ['Issue date:', fmtDate(invoice.issue_date)],
    ['Due date:', fmtDate(invoice.due_date)],
    ['Status:', invoice.status],
  ];
  let my = 30;
  for (const [label, value] of meta) {
    doc.setFont('helvetica', 'bold');
    doc.text(label, right - 62, my);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), right, my, { align: 'right' });
    my += 6;
  }

  y = Math.max(y + 6, my + 4);

  // ── Bill to ────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('Bill to', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  const billLines = [
    customer?.name || '—',
    customer?.company || '',
    invoice.customer_address || customer?.address || '',
    customer?.email || '',
    customer?.phone || '',
  ].filter(Boolean);
  for (const line of billLines) {
    const wrapped = doc.splitTextToSize(line, pageWidth - margin * 2);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 5;
  }
  y += 6;

  // ── Items table ────────────────────────────────────────────────────────
  const colX = { desc: margin, qty: 118, price: 142, amount: right };
  const rowH = 8;

  const drawHeader = (yy: number) => {
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, yy - 5.5, pageWidth - margin * 2, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Description', colX.desc, yy);
    doc.text('Qty', colX.qty, yy, { align: 'right' });
    doc.text('Unit price', colX.price, yy, { align: 'right' });
    doc.text('Amount', colX.amount, yy, { align: 'right' });
  };

  const newPageIfNeeded = () => {
    if (y > 250) {
      doc.addPage();
      y = 20;
      drawHeader(y);
      y += rowH;
    }
  };

  drawHeader(y);
  y += rowH;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);

  for (const item of items) {
    newPageIfNeeded();
    const descLines = doc.splitTextToSize(item.description || '', colX.qty - colX.desc - 4);
    const lines = Math.max(descLines.length, 1);
    doc.text(descLines, colX.desc, y);
    doc.text(String(item.quantity), colX.qty, y, { align: 'right' });
    doc.text(formatMoney(item.unit_price, currency), colX.price, y, { align: 'right' });
    doc.text(formatMoney(item.amount, currency), colX.amount, y, { align: 'right' });
    y += lines * 5 + 3;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y - 2, right, y - 2);
  }

  // ── Totals ─────────────────────────────────────────────────────────────
  newPageIfNeeded();
  y += 4;
  const totals: Array<[string, number, boolean]> = [
    ['Subtotal', invoice.subtotal, false],
    [`${business.tax_name || 'Tax'} (${invoice.tax_rate}%)`, invoice.tax_amount, false],
    ['Discount', invoice.discount, false],
  ];
  doc.setFontSize(10);
  for (const [label, value, bold] of totals) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(label, colX.price, y, { align: 'right' });
    doc.setTextColor(30, 30, 30);
    doc.text(formatMoney(value, currency), colX.amount, y, { align: 'right' });
    y += 6;
  }
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.6);
  doc.line(colX.price - 30, y - 4, right, y - 4);
  doc.setLineWidth(0.2);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text('Total', colX.price, y + 2, { align: 'right' });
  doc.setTextColor(79, 70, 229);
  doc.text(formatMoney(invoice.total, currency), colX.amount, y + 2, { align: 'right' });
  y += 12;

  // ── Notes ──────────────────────────────────────────────────────────────
  if (invoice.notes) {
    newPageIfNeeded();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Notes', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 90);
    const wrapped = doc.splitTextToSize(invoice.notes, pageWidth - margin * 2);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 5 + 6;
  }

  // ── Footer ─────────────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 14;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated with BizOS — free Business OS for freelancers & small businesses.', pageWidth / 2, footerY, { align: 'center' });

  return doc;
}
