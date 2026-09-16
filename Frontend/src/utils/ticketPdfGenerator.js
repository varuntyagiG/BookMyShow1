import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

/**
 * Generate and download an authentic, production-grade BookMyShow Ticket PDF
 * @param {Object} booking - Complete booking details
 * @param {Object} options - Optional config (e.g. autoSave: boolean, fileName: string)
 * @returns {Promise<jsPDF>} - The jsPDF document instance
 */
export async function generateTicketPDF(booking = {}, options = {}) {
  const {
    autoSave = true,
    fileName
  } = options;

  // Resolve booking properties with resilient fallbacks
  const bookingId = booking.bookingId || `BMS-${(booking._id || Date.now().toString()).slice(-6).toUpperCase()}`;
  const movieTitle = booking.movieTitle || booking.title || 'Cinema Movie';
  const theatreName = booking.theatreName || booking.cinema?.name || 'PVR Multiplex Cinemas';
  const screenName = booking.screenName || booking.screen?.name || (booking.screen?.screenNumber ? `Audi ${booking.screen.screenNumber}` : 'Audi 2');
  const showtime = booking.showtime || '10:00 AM';
  const showDate = booking.showDate || (booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today');
  const seats = Array.isArray(booking.seats) ? booking.seats : (booking.seats ? [booking.seats] : ['A1', 'A2']);
  const seatsCount = booking.seatsCount || seats.length || 1;
  const ticketPrice = Number(booking.ticketPrice || 0) || (seatsCount * 220);
  const convenienceFee = Number(booking.convenienceFee || 0) || (seatsCount * 35);
  const snacksFee = Number(booking.snacksFee || 0);
  const totalAmount = Number(booking.totalAmount || booking.amount || booking.totalPrice || (ticketPrice + convenienceFee + snacksFee));
  const paymentMethod = (booking.paymentMethod || 'upi_phonepe').replace('upi_', '').replace('_', ' ').toUpperCase();
  const transactionId = booking.transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}-UP`;
  const includeSnacks = Boolean(booking.includeSnacks || (booking.snacksList && booking.snacksList.length > 0) || snacksFee > 0);
  const snacksList = Array.isArray(booking.snacksList) ? booking.snacksList : [];
  const deliveryPreference = booking.deliveryPreference === 'counter_pickup' ? 'Counter Pickup' : 'In-Seat Delivery';

  // Generate real 2D Scannable QR Code Data URL
  // Encodes the turnstile scan URL that staff can scan at cinema gate
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const qrTargetUrl = `${origin}/vendor/scanner?bookingId=${encodeURIComponent(bookingId)}`;
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 250,
      color: {
        dark: '#111827',
        light: '#FFFFFF'
      }
    });
  } catch (qrErr) {
    console.warn('Failed to generate QR data URL:', qrErr);
  }

  // Initialize jsPDF (A4 portrait: 210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const leftMargin = 14;
  const contentWidth = 182;
  const rightMargin = leftMargin + contentWidth;

  // -------------------------------------------------------------
  // 1. BRAND HEADER BANNER (Deep Charcoal & BMS Coral)
  // -------------------------------------------------------------
  doc.setFillColor(28, 30, 42); // #1C1E2A
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Coral accent top strip
  doc.setFillColor(248, 68, 100); // #F84464
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Brand Logo Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('book', leftMargin, 16);
  const bookWidth = doc.getTextWidth('book');

  doc.setTextColor(248, 68, 100);
  doc.text('my', leftMargin + bookWidth, 16);
  const myWidth = doc.getTextWidth('my');

  doc.setTextColor(255, 255, 255);
  doc.text('show', leftMargin + bookWidth + myWidth, 16);

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175); // gray-400
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL ELECTRONIC ADMISSION PASS & TAX INVOICE', leftMargin, 22);

  // Booking Ref Pill (Top Right)
  doc.setFillColor(39, 42, 59);
  doc.roundedRect(rightMargin - 52, 8, 52, 14, 2, 2, 'F');
  doc.setTextColor(248, 68, 100);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('BOOKING REFERENCE', rightMargin - 49, 13);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(bookingId, rightMargin - 49, 19);

  let currentY = 34;

  // -------------------------------------------------------------
  // 2. MOVIE DETAILS CARD
  // -------------------------------------------------------------
  doc.setFillColor(248, 249, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftMargin, currentY, contentWidth, 26, 3, 3, 'FD');

  // Left Coral Accent vertical line inside card
  doc.setFillColor(248, 68, 100);
  doc.roundedRect(leftMargin, currentY, 2.5, 26, 1, 1, 'F');

  // Movie Title
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(movieTitle.toUpperCase(), leftMargin + 6, currentY + 8);

  // Badges (Certification, Language, Format)
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(248, 68, 100);
  doc.text('UA16+', leftMargin + 6, currentY + 15);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('•  HINDI / ENGLISH  •  IMAX 2D  •  DOLBY ATMOS 7.1', leftMargin + 18, currentY + 15);

  // Cinema Venue
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(theatreName, leftMargin + 6, currentY + 21);

  currentY += 31;

  // -------------------------------------------------------------
  // 3. SHOWTIME & ADMISSION GRID
  // -------------------------------------------------------------
  const gridHeight = 15;
  const colW = contentWidth / 4;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(226, 232, 240);
  doc.rect(leftMargin, currentY, contentWidth, gridHeight, 'FD');

  const headers = ['AUDITORIUM', 'DATE', 'SHOWTIME', 'TICKETS'];
  const values = [screenName, showDate, showtime, `${seatsCount} ${seatsCount === 1 ? 'Seat' : 'Seats'}`];

  for (let i = 0; i < 4; i++) {
    const colX = leftMargin + (i * colW) + 4;
    // Header
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(headers[i], colX, currentY + 5);

    // Value
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(values[i], colX, currentY + 11);

    // Divider line between columns
    if (i > 0) {
      doc.setDrawColor(203, 213, 225);
      doc.line(leftMargin + (i * colW), currentY, leftMargin + (i * colW), currentY + gridHeight);
    }
  }

  currentY += gridHeight + 5;

  // -------------------------------------------------------------
  // 4. RESERVED SEATS & SCANNABLE TURNSTILE QR CODE BOX
  // -------------------------------------------------------------
  const passBoxHeight = 52;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(leftMargin, currentY, contentWidth, passBoxHeight, 3, 3, 'D');

  // Embed Real 2D QR Code (Left Column: 44mm x 44mm)
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', leftMargin + 4, currentY + 4, 44, 44);
  }

  // QR Instruction Subtext
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SCAN FOR GATE ADMISSION', leftMargin + 7, currentY + 49.5);

  // Vertical Separator
  doc.setDrawColor(226, 232, 240);
  doc.line(leftMargin + 52, currentY + 4, leftMargin + 52, currentY + passBoxHeight - 4);

  // Right Column: Seats and Gate Instructions
  const seatInfoX = leftMargin + 57;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CONFIRMED SEATS', seatInfoX, currentY + 9);

  // Large Coral Seats Display
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(248, 68, 100);
  doc.text(seats.join(', '), seatInfoX, currentY + 18);

  // Tier & Entry Details
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tier: Executive Prime  •  Turnstile: Gate 3 (Main Hall)`, seatInfoX, currentY + 25);
  doc.text(`Entry Status: Verified & Paid  •  One scan admits all ${seatsCount} guest(s)`, seatInfoX, currentY + 31);

  // Verified Payment Badge Box
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208); // Emerald-200
  doc.roundedRect(seatInfoX, currentY + 36, 118, 11, 2, 2, 'FD');

  doc.setTextColor(5, 150, 105); // Emerald-600
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`PAID VIA ${paymentMethod}  •  TRANSACTION ID: ${transactionId}`, seatInfoX + 4, currentY + 43);

  currentY += passBoxHeight + 5;

  // -------------------------------------------------------------
  // 5. FOOD & BEVERAGES (CONCESSIONS) VOUCHER (If Applicable)
  // -------------------------------------------------------------
  if (includeSnacks) {
    const fnbBoxHeight = 28 + (snacksList.length > 0 ? (snacksList.length * 4.5) : 0);
    doc.setFillColor(254, 243, 199); // Amber-100
    doc.setDrawColor(251, 191, 36); // Amber-400
    doc.roundedRect(leftMargin, currentY, contentWidth, fnbBoxHeight, 3, 3, 'FD');

    // F&B Header
    doc.setTextColor(120, 53, 15); // Amber-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('CINEMA CONCESSIONS VOUCHER (FOOD & REFRESHMENTS)', leftMargin + 5, currentY + 7);

    // Delivery Preference
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9); // Amber-700
    const deliveryText = deliveryPreference === 'Counter Pickup'
      ? 'PICKUP AT REFRESHMENT COUNTER #3 (SHOW THIS PASS)'
      : `IN-SEAT DELIVERY AT INTERMISSION TO SEATS: ${seats.join(', ')}`;
    doc.text(deliveryText, leftMargin + 5, currentY + 13);

    // Itemized list
    let itemY = currentY + 19;
    if (snacksList.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(69, 26, 3);
      snacksList.forEach((snack) => {
        const itemLine = `${snack.name}  x${snack.quantity || 1}`;
        const itemPrice = `INR ${(Number(snack.price) || 0) * (Number(snack.quantity) || 1)}`;
        doc.text(itemLine, leftMargin + 6, itemY);
        doc.text(itemPrice, rightMargin - 30, itemY);
        itemY += 4.5;
      });
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(69, 26, 3);
      doc.text('Standard Multiplex Gourmet Snack Combo (Beverage & Popcorn)', leftMargin + 6, itemY);
      doc.text(`INR ${snacksFee}`, rightMargin - 30, itemY);
      itemY += 5;
    }

    currentY += fnbBoxHeight + 5;
  }

  // -------------------------------------------------------------
  // 6. TAX INVOICE & PAYMENT BREAKDOWN
  // -------------------------------------------------------------
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftMargin, currentY, contentWidth, 34, 3, 3, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT RECEIPT & INVOICE BREAKDOWN', leftMargin + 5, currentY + 6);

  const col1X = leftMargin + 5;
  const col2X = leftMargin + 70;
  const col3X = leftMargin + 130;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Ticket Subtotal (${seatsCount} seats):`, col1X, currentY + 13);
  doc.text(`INR ${ticketPrice.toFixed(2)}`, col1X + 45, currentY + 13);

  doc.text('Convenience Fee & GST (18%):', col1X, currentY + 19);
  doc.text(`INR ${convenienceFee.toFixed(2)}`, col1X + 45, currentY + 19);

  if (snacksFee > 0) {
    doc.text('Cinema Concessions (F&B):', col1X, currentY + 25);
    doc.text(`INR ${snacksFee.toFixed(2)}`, col1X + 45, currentY + 25);
  }

  // Payment method & txn info
  doc.text(`Payment Gateway: ${paymentMethod}`, col2X, currentY + 13);
  doc.text(`Txn Ref: ${transactionId}`, col2X, currentY + 19);
  doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-GB')}`, col2X, currentY + 25);

  // Total Paid Large Display
  doc.setFillColor(248, 249, 252);
  doc.roundedRect(col3X, currentY + 7, 47, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL AMOUNT PAID', col3X + 4, currentY + 13);

  doc.setFontSize(14);
  doc.setTextColor(248, 68, 100);
  doc.text(`INR ${totalAmount.toFixed(2)}`, col3X + 4, currentY + 22);

  currentY += 39;

  // -------------------------------------------------------------
  // 7. PERFORATED CUTTING TICKET DIVIDER
  // -------------------------------------------------------------
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(leftMargin, currentY, rightMargin, currentY);
  doc.setLineDashPattern([], 0); // reset to solid

  currentY += 5;

  // Simulated Barcode Strips
  doc.setFillColor(30, 41, 59);
  const barcodeBars = [2, 1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2];
  let barX = leftMargin + 30;
  barcodeBars.forEach((w) => {
    doc.rect(barX, currentY, w * 0.7, 7, 'F');
    barX += (w * 0.7) + 1.2;
  });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`* ${bookingId} *`, (leftMargin + rightMargin) / 2 - 12, currentY + 11);

  currentY += 16;

  // -------------------------------------------------------------
  // 8. IMPORTANT CUSTOMER GUIDELINES & TERMS
  // -------------------------------------------------------------
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(leftMargin, currentY, contentWidth, 24, 2, 2, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('IMPORTANT TERMS & ADMISSION POLICIES:', leftMargin + 4, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  doc.text('1. Please carry this E-Ticket on your mobile or present a printed copy at the cinema entrance turnstile gate.', leftMargin + 4, currentY + 9.5);
  doc.text('2. Entry is allowed 20 minutes prior to the showtime. Rights of admission reserved by the cinema management.', leftMargin + 4, currentY + 13.5);
  doc.text('3. Outside food and beverages are strictly prohibited inside the auditorium.', leftMargin + 4, currentY + 17.5);
  doc.text('4. For cancellations or support, please visit BookMyShow Help Center or email support@bookmyshow.com', leftMargin + 4, currentY + 21.5);

  // -------------------------------------------------------------
  // 9. AUTOMATIC SAVE / RETURN
  // -------------------------------------------------------------
  const finalFileName = fileName || `BookMyShow-Ticket-${bookingId}.pdf`;

  if (autoSave && typeof window !== 'undefined') {
    doc.save(finalFileName);
  }

  return doc;
}
