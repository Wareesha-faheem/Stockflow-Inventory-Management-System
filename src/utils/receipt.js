import { jsPDF } from "jspdf";

const BRAND_NAME = "StockFlow";
const BRAND_COLOR = [59, 92, 255]; // matches --primary in App.css
const BRAND_DARK = [16, 20, 44]; // matches sidebar navy
const INK = [20, 22, 43];
const INK_SOFT = [91, 95, 122];
const INK_FAINT = [149, 153, 180];
const BORDER = [231, 233, 243];
const ROW_ALT = [247, 248, 252];
const TOTALS_BG = [244, 246, 253];
const PAGE_BG = [241, 243, 249];

export function generateReceiptId(sequence) {
  return `STK-${String(sequence).padStart(5, "0")}`;
}

export function slugify(text) {
  const clean = (text || "walkin")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return clean || "walkin";
}

export function buildReceiptFilename(customerName, billId) {
  return `Receipt-${slugify(customerName)}-${billId}.pdf`;
}

// bill shape: { id, customerName, date, items: [{product, quantity, price, total, supplier}], subtotal, tax, total }
export function downloadReceiptPdf(bill) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // ---- page backdrop + floating document card ----
  doc.setFillColor(255, 255, 255);
doc.rect(0, 0, pageWidth, pageHeight, "F");

  // const cardMargin = 24;
  // const cardW = pageWidth;
  // const cardH = pageHeight;
  // doc.setFillColor(255, 255, 255);
  // doc.roundedRect(cardMargin, cardMargin, cardW, cardH, 14, 14, "F");

  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2;
  let y =50;

  // ---- header band inside the card ----
  // doc.setFillColor(...BRAND_DARK);
doc.setFillColor(...BRAND_DARK);
doc.rect(0, 0, pageWidth, 12, "F");

  // ---- brand mark + wordmark ----
  doc.setFillColor(...BRAND_COLOR);
  doc.roundedRect(marginX, y - 17, 28, 28, 7, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("S", marginX + 14, y + 1, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...INK);
  doc.text(BRAND_NAME, marginX + 38, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_FAINT);
  doc.text("TAX INVOICE / RECEIPT", marginX + 38, y + 14, { charSpace: 0.6 });

  // ---- receipt id / date chip, top right ----
  const chipW = 172;
  const chipX = marginX + contentWidth - chipW;
  doc.setFillColor(...TOTALS_BG);
  doc.roundedRect(chipX, y - 24, chipW, 46, 9, 9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_FAINT);
  doc.text("RECEIPT ID", chipX + 14, y - 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...BRAND_COLOR);
  doc.text(bill.id, chipX + chipW - 14, y - 9, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_FAINT);
  doc.text("DATE", chipX + 14, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(bill.date, chipX + chipW - 14, y + 12, { align: "right" });

  y += 46;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(1);
  doc.line(marginX, y, marginX + contentWidth, y);

  // ---- billed to ----
  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_FAINT);
  doc.text("BILLED TO", marginX, y, { charSpace: 0.5 });

  y += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text(bill.customerName || "Walk-in customer", marginX, y);

  y += 34;

  // ---- line items table ----
  const numColW = 26;
  const cols = {
    num: marginX + 14,
    product: marginX + 14 + numColW,
    qty: marginX + contentWidth * 0.58,
    price: marginX + contentWidth * 0.76,
    total: marginX + contentWidth - 14,
  };

  const headerHeight = 32;
  doc.setFillColor(...BRAND_DARK);
  doc.rect(marginX, y, contentWidth, headerHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("PRODUCT", cols.product, y + 20, { charSpace: 0.4 });
  doc.text("QTY", cols.qty, y + 20, { align: "right", charSpace: 0.4 });
  doc.text("PRICE", cols.price, y + 20, { align: "right", charSpace: 0.4 });
  doc.text("TOTAL", cols.total, y + 20, { align: "right", charSpace: 0.4 });

  y += headerHeight;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);

  bill.items.forEach((item, i) => {
    const rowHeight = 32;
    if (i % 2 === 1) {
      doc.setFillColor(...ROW_ALT);
      doc.rect(marginX, y, contentWidth, rowHeight, "F");
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK_FAINT);
    doc.text(String(i + 1).padStart(2, "0"), cols.num, y + 20);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(String(item.product), cols.product, y + 20);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK_SOFT);
    doc.text(String(item.quantity), cols.qty, y + 20, { align: "right" });
    doc.text(`PKR ${item.price.toLocaleString()}`, cols.price, y + 20, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...INK);
    doc.text(`PKR ${item.total.toLocaleString()}`, cols.total, y + 20, { align: "right" });

    y += rowHeight;

    if (y > pageHeight - 220){
      doc.addPage();

doc.setFillColor(255,255,255);
doc.rect(0,0,pageWidth,pageHeight,"F");

doc.setFillColor(...BRAND_DARK);
doc.rect(0,0,pageWidth,12,"F");

y = 50;
    }
  });

  doc.setDrawColor(...BORDER);
  doc.line(marginX, y, marginX + contentWidth, y);

  // ---- totals card ----
  y += 24;
  const totalsW = 250;
  const totalsX = marginX + contentWidth - totalsW;
  const lineGap = 22;
  const totalsH = lineGap * 2 + 50;

  doc.setFillColor(...TOTALS_BG);
  doc.roundedRect(totalsX, y, totalsW, totalsH, 10, 10, "F");
  doc.setFillColor(...BRAND_COLOR);
  doc.roundedRect(totalsX, y, totalsW, 4, 2, 2, "F");
  doc.rect(totalsX, y + 2, totalsW, 2, "F");

  let ty = y + 26;
  const labelX = totalsX + 18;
  const valueX = totalsX + totalsW - 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...INK_SOFT);
  doc.text("Subtotal", labelX, ty);
  doc.setTextColor(...INK);
  doc.text(`PKR ${bill.subtotal.toLocaleString()}`, valueX, ty, { align: "right" });

  ty += lineGap;
  doc.setTextColor(...INK_SOFT);
  doc.text("Tax (15%)", labelX, ty);
  doc.setTextColor(...INK);
  doc.text(`PKR ${bill.tax.toLocaleString()}`, valueX, ty, { align: "right" });

  ty += 14;
  doc.setDrawColor(...BORDER);
  doc.line(labelX, ty, valueX, ty);

  ty += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BRAND_COLOR);
  doc.text("Grand Total", labelX, ty);
  doc.text(`PKR ${bill.total.toLocaleString()}`, valueX, ty, { align: "right" });

  // ---- footer ----
  const footerY = pageHeight - 46;
  doc.setDrawColor(...BORDER);
  doc.line(marginX, footerY, marginX + contentWidth, footerY);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(...INK_SOFT);
  doc.text("Thank you for your order!", marginX, footerY + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_FAINT);
  doc.text(`${BRAND_NAME.toUpperCase()}`, marginX + contentWidth, footerY + 20, { align: "right", charSpace: 0.5 });

  doc.save(buildReceiptFilename(bill.customerName, bill.id));
}