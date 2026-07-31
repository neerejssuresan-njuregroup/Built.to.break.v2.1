import jsPDF from "jspdf";

/**
 * Draws text along a circular arc on Canvas context.
 */
function drawArcText(ctx, text, centerX, centerY, radius, startAngle, endAngle, font, color, isBottom = false) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const len = text.length;
  if (len === 0) {
    ctx.restore();
    return;
  }

  const angleStep = (endAngle - startAngle) / (len > 1 ? len - 1 : 1);

  for (let i = 0; i < len; i++) {
    const char = text[i];
    const angle = startAngle + i * angleStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);

    ctx.save();
    ctx.translate(x, y);
    if (isBottom) {
      ctx.rotate(angle - Math.PI / 2);
    } else {
      ctx.rotate(angle + Math.PI / 2);
    }
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Draws a crisp vector Shield icon (for NBC Certificate).
 */
function drawShieldIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  const w = size;
  const h = size * 1.15;

  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.bezierCurveTo(w / 3, -h / 2, w / 2, -h / 3, w / 2, -h / 6);
  ctx.bezierCurveTo(w / 2, h / 3, w / 4, h / 2, 0, h / 2);
  ctx.bezierCurveTo(-w / 4, h / 2, -w / 2, h / 3, -w / 2, -h / 6);
  ctx.bezierCurveTo(-w / 2, -h / 3, -w / 3, -h / 2, 0, -h / 2);
  ctx.closePath();
  ctx.stroke();

  // Cross accent inside shield
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -h / 3.2);
  ctx.lineTo(0, h / 3.2);
  ctx.moveTo(-w / 3.5, -h / 10);
  ctx.lineTo(w / 3.5, -h / 10);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a crisp vector Zap / Lightning icon (for Show Certificate).
 */
function drawZapIcon(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;

  const s = size / 24; // scale factor from 24x24 viewport

  ctx.beginPath();
  ctx.moveTo((13 - 12) * s, (2 - 12) * s);
  ctx.lineTo((3 - 12) * s, (14 - 12) * s);
  ctx.lineTo((12 - 12) * s, (14 - 12) * s);
  ctx.lineTo((11 - 12) * s, (22 - 12) * s);
  ctx.lineTo((21 - 12) * s, (10 - 12) * s);
  ctx.lineTo((12 - 12) * s, (10 - 12) * s);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export const generateCertificateCanvasDataUrl = async ({
  userName = "Examinee",
  userState = "Delhi NCR",
  finalScorePercent = 100,
  certCode = "BTB-8921-X",
  certDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
  activeTab = "nbc",
  userPhoto = null,
  idType = "",
  idNumber = ""
}) => {
  const width = 2000;
  const height = 1414; // A4 Landscape ratio (1.414:1)
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const isNbc = activeTab === "nbc";

  // 1. Outer Dark Background
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width / 1.1);
  if (isNbc) {
    bgGrad.addColorStop(0, "#090b0c");
    bgGrad.addColorStop(0.7, "#060809");
    bgGrad.addColorStop(1, "#030405");
  } else {
    bgGrad.addColorStop(0, "#0c0909");
    bgGrad.addColorStop(0.7, "#080606");
    bgGrad.addColorStop(1, "#040303");
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Watermark Grid Text
  ctx.save();
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
  ctx.textAlign = "left";
  for (let y = 45; y < height; y += 45) {
    for (let x = 20; x < width; x += 320) {
      ctx.fillText("BUILT TO BREAK • COMPLETED • ", x, y);
    }
  }
  ctx.restore();

  // 3. Double Card Borders
  // Outer double border
  ctx.lineWidth = 8;
  ctx.strokeStyle = isNbc ? "#065f46" : "#7f1d1d";
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.lineWidth = 2;
  ctx.strokeStyle = isNbc ? "#047857" : "#b91c1c";
  ctx.strokeRect(52, 52, width - 104, height - 104);

  // Inner subtle frame accent
  ctx.lineWidth = 1;
  ctx.strokeStyle = isNbc ? "rgba(6, 78, 87, 0.4)" : "rgba(127, 29, 29, 0.4)";
  ctx.strokeRect(64, 64, width - 128, height - 128);

  // 4. Verification ID Badge (Top Right)
  const fullCertCode = isNbc ? certCode : `${certCode}-SHOW`;
  ctx.save();
  ctx.fillStyle = "#090d11";
  ctx.strokeStyle = "#27272a";
  ctx.lineWidth = 1;
  const badgeText = `ID: ${fullCertCode}`;
  ctx.font = "bold 16px monospace";
  const badgeWidth = ctx.measureText(badgeText).width + 30;
  ctx.fillRect(width - 90 - badgeWidth, 80, badgeWidth, 32);
  ctx.strokeRect(width - 90 - badgeWidth, 80, badgeWidth, 32);

  ctx.fillStyle = "#9ca3af";
  ctx.textAlign = "center";
  ctx.fillText(badgeText, width - 90 - badgeWidth / 2, 102);
  ctx.restore();

  // 5. Central Official Seal & Emblem
  const centerX = width / 2;
  const sealY = 230;

  // Concentric Seal Rings
  // Ring 1 (outer double border)
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(217, 119, 6, 0.6)";
  ctx.beginPath();
  ctx.arc(centerX, sealY, 120, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
  ctx.beginPath();
  ctx.arc(centerX, sealY, 112, 0, Math.PI * 2);
  ctx.stroke();

  // Ring 2 (dashed border)
  ctx.save();
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(245, 158, 11, 0.8)";
  ctx.beginPath();
  ctx.arc(centerX, sealY, 102, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Inner Badge Core Fill
  const sealGrad = ctx.createLinearGradient(centerX - 80, sealY - 80, centerX + 80, sealY + 80);
  if (isNbc) {
    sealGrad.addColorStop(0, "#451a03"); // amber-950
    sealGrad.addColorStop(0.5, "#450a0a"); // red-950
    sealGrad.addColorStop(1, "#090b0c"); // zinc-950
  } else {
    sealGrad.addColorStop(0, "#450a0a"); // red-950
    sealGrad.addColorStop(0.5, "#451a03"); // amber-950
    sealGrad.addColorStop(1, "#0c0909"); // zinc-950
  }
  ctx.fillStyle = sealGrad;
  ctx.beginPath();
  ctx.arc(centerX, sealY, 82, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(centerX, sealY, 82, 0, Math.PI * 2);
  ctx.stroke();

  // Emblem Icon in Seal (Shield or Zap)
  if (isNbc) {
    drawShieldIcon(ctx, centerX, sealY - 20, 36, "#fbbf24");
  } else {
    drawZapIcon(ctx, centerX, sealY - 20, 36, "#fbbf24");
  }

  // Text inside Seal Badge
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#fef3c7";
  ctx.textAlign = "center";
  ctx.fillText("BUILT TO BREAK", centerX, sealY + 18);

  ctx.font = "bold 10px monospace";
  ctx.fillStyle = "#f59e0b";
  ctx.fillText(isNbc ? "OFFICIAL SEAL" : "EXCELLENCE", centerX, sealY + 34);

  // Curved Arc Text around Seal
  // Top Arc: ★ BUILT TO BREAK AWARENESS ★
  drawArcText(
    ctx,
    "★ BUILT TO BREAK AWARENESS ★",
    centerX,
    sealY,
    108,
    -Math.PI * 0.75,
    -Math.PI * 0.25,
    "bold 13px monospace",
    "#f59e0b",
    false
  );

  // Bottom Arc: PUBLIC SAFETY COMPLIANCE / PUBLIC EMPOWERMENT ENVOY
  const bottomArcText = isNbc ? "PUBLIC SAFETY COMPLIANCE" : "PUBLIC EMPOWERMENT ENVOY";
  drawArcText(
    ctx,
    bottomArcText,
    centerX,
    sealY,
    108,
    Math.PI * 0.72,
    Math.PI * 0.28,
    "bold 12px monospace",
    "rgba(245, 158, 11, 0.85)",
    true
  );

  // 6. Subtitle Header
  ctx.font = "black 20px monospace";
  ctx.fillStyle = isNbc ? "#f59e0b" : "#ef4444";
  ctx.textAlign = "center";
  ctx.fillText("BUILT TO BREAK AWARENESS INITIATIVE TEAM", centerX, 410);

  // 7. Certificate Main Title
  ctx.font = "900 46px sans-serif";
  ctx.fillStyle = "#f3f4f6";
  ctx.fillText(
    isNbc ? "CERTIFICATE OF REGULATORY COMPLIANCE" : "HONORARY PUBLIC SAFETY ENVOY",
    centerX,
    475
  );

  // Gold/Red Accent Divider Bar
  const barWidth = 180;
  ctx.fillStyle = isNbc ? "rgba(217, 119, 6, 0.8)" : "rgba(220, 38, 38, 0.8)";
  ctx.fillRect(centerX - barWidth / 2, 505, barWidth, 4);

  // 8. Body Paragraph 1 (Certification intro)
  ctx.font = "300 24px sans-serif";
  ctx.fillStyle = "#d1d5db";
  
  if (isNbc) {
    ctx.fillText("This document officially certifies that", centerX, 575);

    // Recipient Name (LARGE GOLD GRADIENT)
    ctx.font = "900 58px sans-serif";
    const nameGrad = ctx.createLinearGradient(centerX - 350, 640, centerX + 350, 640);
    nameGrad.addColorStop(0, "#fbbf24");
    nameGrad.addColorStop(0.5, "#ffffff");
    nameGrad.addColorStop(1, "#fbbf24");
    ctx.fillStyle = nameGrad;
    const formattedName = (userName || "EXAMINEE").toUpperCase();
    ctx.fillText(formattedName, centerX, 645);

    // State / Jurisdiction
    ctx.font = "300 24px sans-serif";
    ctx.fillStyle = "#d1d5db";
    ctx.fillText(`from ${(userState || "DELHI NCR").toUpperCase()}`, centerX, 705);

    // Evaluation Citation with Score
    ctx.font = "300 22px sans-serif";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText("has completed the advanced forensic evaluation of Metropolitan Building Clearances", centerX, 755);

    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = "#34d399";
    ctx.fillText(`with an outstanding score of ${finalScorePercent}%`, centerX, 800);

    // Paragraph 2 (Authority & NBC Reference)
    ctx.font = "300 18px sans-serif";
    ctx.fillStyle = "#9ca3af";
    ctx.fillText("Honored and awarded directly by the Built to Break Awareness Initiative Team under Part 4 & Part 8", centerX, 860);
    ctx.fillText("of the National Building Code (NBC) of India, endorsing high-vulnerability structural audit proficiency.", centerX, 890);
  } else {
    ctx.fillText("This certificate is proudly awarded to", centerX, 575);

    // Recipient Name (LARGE GOLD GRADIENT)
    ctx.font = "900 58px sans-serif";
    const nameGrad = ctx.createLinearGradient(centerX - 350, 640, centerX + 350, 640);
    nameGrad.addColorStop(0, "#fbbf24");
    nameGrad.addColorStop(0.5, "#ffffff");
    nameGrad.addColorStop(1, "#fbbf24");
    ctx.fillStyle = nameGrad;
    const formattedName = (userName || "EXAMINEE").toUpperCase();
    ctx.fillText(formattedName, centerX, 645);

    // State / Jurisdiction
    ctx.font = "300 24px sans-serif";
    ctx.fillStyle = "#d1d5db";
    ctx.fillText(`from ${(userState || "DELHI NCR").toUpperCase()}`, centerX, 705);

    // Citation
    ctx.font = "300 22px sans-serif";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText("for successfully completing the 'Built to Break' interactive scrollytelling documentary analysis.", centerX, 760);

    // Paragraph 2
    ctx.font = "300 18px sans-serif";
    ctx.fillStyle = "#9ca3af";
    ctx.fillText("Awarded by the Built to Break Awareness Initiative Team for demonstrating exemplary civic awareness,", centerX, 830);
    ctx.fillText("legal vigilance, and a direct commitment to championing life-safety regulations across India's metropolitan high-vulnerability landscapes.", centerX, 860);
  }

  // 9. Signature Block
  const sigY = 1040;

  // Left Signature
  ctx.font = "italic bold 28px Georgia, serif";
  ctx.fillStyle = isNbc ? "#f59e0b" : "#f87171";
  ctx.fillText(isNbc ? "BTB Audit Council" : "BTB Initiative Core", centerX - 340, sigY);

  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#374151";
  ctx.beginPath();
  ctx.moveTo(centerX - 480, sigY + 16);
  ctx.lineTo(centerX - 200, sigY + 16);
  ctx.stroke();

  ctx.font = "bold 14px monospace";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText(isNbc ? "BUILT TO BREAK AUDIT PANEL" : "BUILT TO BREAK INITIATIVE TEAM", centerX - 340, sigY + 42);

  // Right Signature
  ctx.font = "italic bold 28px Georgia, serif";
  ctx.fillStyle = isNbc ? "#f59e0b" : "#f87171";
  ctx.fillText(isNbc ? "Public Safety Team" : "Campaign Panel", centerX + 340, sigY);

  ctx.beginPath();
  ctx.moveTo(centerX + 200, sigY + 16);
  ctx.lineTo(centerX + 480, sigY + 16);
  ctx.stroke();

  ctx.font = "bold 14px monospace";
  ctx.fillStyle = "#9ca3af";
  ctx.fillText(isNbc ? "PUBLIC SAFETY INITIATIVE BOARD" : "CIVIC AWARENESS CAMPAIGN PANEL", centerX + 340, sigY + 42);

  // 10. Footer Registry Information
  const footY = 1270;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#27272a";
  ctx.beginPath();
  ctx.moveTo(100, footY - 40);
  ctx.lineTo(width - 100, footY - 40);
  ctx.stroke();

  // Registry Date
  ctx.textAlign = "left";
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#6b7280";
  ctx.fillText(isNbc ? "REGISTRY DATE:" : "ISSUE DATE:", 120, footY);
  ctx.fillStyle = "#e5e7eb";
  ctx.font = "bold 18px monospace";
  ctx.fillText(certDate, 120, footY + 28);

  // Awarded By
  ctx.textAlign = "center";
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#6b7280";
  ctx.fillText(isNbc ? "AWARDED BY:" : "COMMITTED BY:", centerX, footY);
  ctx.fillStyle = isNbc ? "#f59e0b" : "#ef4444";
  ctx.font = "bold 18px monospace";
  ctx.fillText(isNbc ? "BUILT TO BREAK INITIATIVE TEAM" : "BUILT TO BREAK TEAM", centerX, footY + 28);

  // Certificate ID
  ctx.textAlign = "right";
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("UNIQUE CERTIFICATE ID:", width - 120, footY);
  ctx.fillStyle = isNbc ? "#34d399" : "#f87171";
  ctx.font = "bold 18px monospace";
  ctx.fillText(fullCertCode, width - 120, footY + 28);

  // 11. Optional Proctor Verified Face Identity (Top Left Card)
  if (userPhoto) {
    try {
      const img = await new Promise((resolve) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => resolve(null);
        i.src = userPhoto;
      });

      if (img) {
        const photoWidth = 180;
        const photoHeight = 225;
        const photoX = 100;
        const photoY = 100;

        // Draw card background & high-security border
        ctx.save();
        ctx.fillStyle = "#090d11";
        ctx.strokeStyle = isNbc ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)";
        ctx.lineWidth = 3;
        
        ctx.fillRect(photoX - 8, photoY - 8, photoWidth + 16, photoHeight + 36);
        ctx.strokeRect(photoX - 8, photoY - 8, photoWidth + 16, photoHeight + 36);

        // Draw photo
        ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);

        // Draw "VERIFIED" banner overlay
        const badgeH = 26;
        ctx.fillStyle = "rgba(6, 78, 59, 0.85)";
        ctx.fillRect(photoX, photoY + photoHeight - badgeH, photoWidth, badgeH);
        
        ctx.font = "bold 11px monospace";
        ctx.fillStyle = "#34d399";
        ctx.textAlign = "center";
        ctx.fillText("PROCTOR VERIFIED", photoX + photoWidth / 2, photoY + photoHeight - badgeH / 2 + 4);

        // Subtitle text
        ctx.font = "bold 10px monospace";
        ctx.fillStyle = "#9ca3af";
        ctx.textAlign = "center";
        ctx.fillText("EXAMINEE PHOTO ID", photoX + photoWidth / 2, photoY + photoHeight + 18);
        
        ctx.restore();
      }
    } catch (e) {
      console.warn("Could not draw proctor photo on certificate canvas:", e);
    }
  }

  return canvas.toDataURL("image/png");
};

export const downloadCertificatePdf = async (options) => {
  const dataUrl = await generateCertificateCanvasDataUrl(options);
  if (!dataUrl) return false;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210);

  const safeName = (options.userName || "Examinee").trim().replace(/[^a-zA-Z0-9_]/g, "_");
  const codeSuffix = options.activeTab === "show" ? `${options.certCode || "CERT"}-SHOW` : (options.certCode || "CERT");
  pdf.save(`Built_to_Break_Certificate_${safeName}_${codeSuffix}.pdf`);
  return true;
};

export const downloadCertificatePng = async (options) => {
  const dataUrl = await generateCertificateCanvasDataUrl(options);
  if (!dataUrl) return false;

  const safeName = (options.userName || "Examinee").trim().replace(/[^a-zA-Z0-9_]/g, "_");
  const codeSuffix = options.activeTab === "show" ? `${options.certCode || "CERT"}-SHOW` : (options.certCode || "CERT");
  const link = document.createElement("a");
  link.download = `Built_to_Break_Certificate_${safeName}_${codeSuffix}.png`;
  link.href = dataUrl;
  link.click();
  return true;
};

export const printCertificateImage = async (options) => {
  const dataUrl = await generateCertificateCanvasDataUrl(options);
  if (!dataUrl) {
    window.print();
    return;
  }

  const safeName = (options.userName || "Examinee").trim().replace(/[^a-zA-Z0-9_]/g, "_");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    downloadCertificatePdf(options);
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Built to Break Certificate - ${safeName}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          img {
            width: 100vw;
            height: 100vh;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" id="certImg" />
        <script>
          const img = document.getElementById('certImg');
          img.onload = () => {
            setTimeout(() => {
              window.print();
            }, 300);
          };
          if (img.complete) {
            setTimeout(() => {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
