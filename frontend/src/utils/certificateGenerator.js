import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * generateCertificatePDF — Creates an official single-page A4 landscape PDF certificate with WHITE background.
 * @param {Object} cert - Certificate object ({ id, chapter, date, code, grade })
 * @param {Object} user - User profile object ({ name, title, level })
 */
export async function generateCertificatePDF(cert, user = {}) {
  const studentName = user.name || 'Alex Vance';
  const chapterName = cert.chapter || 'Chemistry Mastery';
  const dateStr = cert.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const certCode = cert.code || `CHEM-${Math.floor(1000 + Math.random() * 9000)}-PT`;
  const gradeStr = cert.grade || '98.5%';

  // 1. Create off-screen A4 Landscape DOM container (297mm x 210mm ratio = 1123px x 794px at 96DPI)
  const certElement = document.createElement('div');
  certElement.style.position = 'fixed';
  certElement.style.left = '-9999px';
  certElement.style.top = '-9999px';
  certElement.style.width = '1123px';
  certElement.style.height = '794px';
  certElement.style.backgroundColor = '#FFFFFF';
  certElement.style.color = '#0F172A';
  certElement.style.fontFamily = "'Space Grotesk', 'Inter', sans-serif";
  certElement.style.boxSizing = 'border-box';
  certElement.style.padding = '36px';
  certElement.style.overflow = 'hidden';

  // 2. Build Premium WHITE Diploma Certificate HTML Layout
  certElement.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      border: 4px solid #047857;
      border-radius: 16px;
      position: relative;
      background: #FFFFFF;
      box-sizing: border-box;
      padding: 40px 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      box-shadow: inset 0 0 30px rgba(4, 120, 87, 0.05);
    ">
      <!-- Inner Gold Accent Border -->
      <div style="
        position: absolute;
        inset: 12px;
        border: 2px solid #D97706;
        border-radius: 10px;
        pointer-events: none;
      "></div>

      <!-- Corner Chemistry Ornaments -->
      <div style="position: absolute; top: 22px; left: 24px; font-size: 22px; color: #047857;">⚛️</div>
      <div style="position: absolute; top: 22px; right: 24px; font-size: 22px; color: #047857;">🧪</div>
      <div style="position: absolute; bottom: 22px; left: 24px; font-size: 22px; color: #0891B2;">🧬</div>
      <div style="position: absolute; bottom: 22px; right: 24px; font-size: 22px; color: #D97706;">⚡</div>

      <!-- Header Section -->
      <div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 6px;">
          <span style="font-size: 32px;">⚗️</span>
          <span style="
            font-family: 'Orbitron', monospace;
            font-size: 30px;
            font-weight: 900;
            letter-spacing: 4px;
            color: #047857;
            text-transform: uppercase;
          ">ChemEscape</span>
        </div>
        <p style="
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 6px;
          color: #B45309;
          text-transform: uppercase;
          margin: 0;
        ">Official Certificate of Achievement</p>
      </div>

      <!-- Recipient Section -->
      <div style="margin-top: 5px; margin-bottom: 5px; width: 100%;">
        <p style="font-size: 13px; color: #64748B; margin: 0 0 8px 0; letter-spacing: 2px; text-transform: uppercase; font-weight: 600;">
          This is proudly presented to
        </p>
        <h1 style="
          font-family: 'Space Grotesk', sans-serif;
          font-size: 44px;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          letter-spacing: 1px;
          border-bottom: 3px solid #047857;
          display: inline-block;
          padding-bottom: 6px;
          padding-left: 28px;
          padding-right: 28px;
        ">${studentName}</h1>
        
        <p style="
          font-size: 14px;
          color: #334155;
          max-width: 820px;
          margin: 16px auto 0 auto;
          line-height: 1.6;
          font-weight: 500;
        ">
          For demonstrating exceptional mastery, scientific reasoning, and analytical skill in completing the advanced unit
        </p>

        <h2 style="
          font-family: 'Orbitron', monospace;
          font-size: 25px;
          font-weight: 800;
          color: #047857;
          margin: 8px 0 0 0;
          letter-spacing: 1px;
        ">${chapterName}</h2>
      </div>

      <!-- Badges & Metrics Strip -->
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 36px;
        background: #F8FAFC;
        border: 1px solid #CBD5E1;
        border-radius: 14px;
        padding: 14px 32px;
        width: 82%;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
      ">
        <div>
          <span style="font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; font-weight: 600;">Final Score</span>
          <span style="font-family: 'Orbitron', monospace; font-size: 18px; font-weight: 800; color: #047857;">${gradeStr}</span>
        </div>
        <div style="width: 1px; height: 28px; background: #CBD5E1;"></div>
        <div>
          <span style="font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; font-weight: 600;">Date Issued</span>
          <span style="font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: #0F172A;">${dateStr}</span>
        </div>
        <div style="width: 1px; height: 28px; background: #CBD5E1;"></div>
        <div>
          <span style="font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; font-weight: 600;">Certificate Code</span>
          <span style="font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 700; color: #0369A1;">${certCode}</span>
        </div>
        <div style="width: 1px; height: 28px; background: #CBD5E1;"></div>
        <div>
          <span style="font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; display: block; font-weight: 600;">Verification</span>
          <span style="font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 800; color: #B45309;">✓ AUTHENTICATED</span>
        </div>
      </div>

      <!-- Signatures Footer -->
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        width: 100%;
        margin-top: 10px;
        padding-left: 20px;
        padding-right: 20px;
        box-sizing: border-box;
      ">
        <div style="text-align: center;">
          <div style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 26px; color: #047857; margin-bottom: 2px;">
            Dr. V. Ramanathan
          </div>
          <div style="width: 180px; height: 1.5px; background: #94A3B8; margin: 0 auto 4px auto;"></div>
          <span style="font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Head of Chemistry Dept.</span>
        </div>

        <!-- Official Gold Seal Badge -->
        <div style="
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F59E0B, #B45309);
          border: 3px solid #FEF3C7;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(180, 83, 9, 0.3);
          transform: translateY(-8px);
        ">
          <span style="font-size: 20px;">🏆</span>
          <span style="font-family: 'Orbitron', monospace; font-size: 7px; font-weight: 900; color: #FFFFFF; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px;">
            VERIFIED
          </span>
        </div>

        <div style="text-align: center;">
          <div style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 26px; color: #0369A1; margin-bottom: 2px;">
            AEGIS-9000 Core
          </div>
          <div style="width: 180px; height: 1.5px; background: #94A3B8; margin: 0 auto 4px auto;"></div>
          <span style="font-size: 10px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">AI Verification Authority</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(certElement);

  try {
    // 3. Render HTML to canvas with high resolution scale
    const canvas = await html2canvas(certElement, {
      scale: 2, // High resolution (approx 300DPI equivalent)
      useCORS: true,
      backgroundColor: '#FFFFFF',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');

    // 4. Create jsPDF single-page A4 Landscape document
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();   // 297 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 210 mm

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // 5. Save the single-page A4 PDF file
    const safeFilename = `ChemEscape_Certificate_${certCode}.pdf`;
    pdf.save(safeFilename);
  } finally {
    // Clean up DOM container
    if (document.body.contains(certElement)) {
      document.body.removeChild(certElement);
    }
  }
}
