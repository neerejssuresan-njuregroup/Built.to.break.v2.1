import nodemailer from "nodemailer";

interface TicketData {
  id: number;
  ticketCode: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  assignedTo?: string | null;
  createdAt?: Date | string;
}

let transporter: nodemailer.Transporter | null = null;
let serverMailOAuthToken: string | null = null;

export function setServerMailOAuthToken(token: string | null): void {
  serverMailOAuthToken = token;
  if (token) {
    console.log("[MAIL SERVICE] System Admin Gmail OAuth token registered for backend email automation.");
  }
}

export function getServerMailOAuthToken(): string | null {
  return serverMailOAuthToken;
}

async function sendViaGmailApiServer(
  toEmail: string,
  subject: string,
  htmlContent: string,
  oauthToken: string
): Promise<boolean> {
  try {
    const rawEmail = [
      `To: ${toEmail}`,
      `Subject: ${subject}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      ``,
      htmlContent
    ].join("\r\n");

    const encodedEmail = Buffer.from(rawEmail).toString("base64")
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oauthToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ raw: encodedEmail })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("[MAIL SERVICE - GMAIL API] Dispatch warning:", errText);
      return false;
    }

    const data = await res.json();
    console.log("[MAIL SERVICE - GMAIL API SUCCESS] Email sent to", toEmail, "| ID:", data.id);
    return true;
  } catch (err) {
    console.error("[MAIL SERVICE - GMAIL API ERROR]", err);
    return false;
  }
}

export function getMailTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  const host = process.env.SMTP_HOST || (user && user.includes("@gmail.com") ? "smtp.gmail.com" : undefined);
  const port = parseInt(process.env.SMTP_PORT || "465", 10);

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log(`[MAIL SERVICE] Real SMTP Transporter active (${user} via ${host}:${port})`);
  } else {
    // Fallback JSON transport for development/preview environments
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
    console.log("[MAIL SERVICE NOTICE] Direct SMTP credentials not set in server env. Emails will be dispatched via active Gmail API OAuth session or stored in server logs.");
  }

  return transporter;
}

/**
 * Send Automated Email when a new support ticket is created
 */
export async function sendTicketConfirmationEmailServer(ticket: TicketData): Promise<boolean> {
  try {
    const ticketCode = ticket.ticketCode || "TKT-XXXXX";
    const customerName = ticket.name || "Customer";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px;">
        <p>Dear ${customerName},</p>
        <p>Thank you for reaching out to us.</p>
        <p>We have successfully received your support ticket (<strong>${ticketCode}</strong>) and our team is currently working on it.</p>
        <p>We appreciate your patience while we review the details. We will update you as soon as there is progress or if we require any additional information from you.</p>
        <p>If you need to add any details to this request, simply reply directly to this email.</p>
        <br />
        <p>Best regards,<br /><strong>Built to Break Support Team</strong></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 24px;" />
        <p style="font-size: 11px; color: #71717a;">Ticket Reference: ${ticketCode} | Subject: ${ticket.subject || "Support Request"}</p>
      </div>
    `;

    const subject = `Support Ticket Received [${ticketCode}]`;

    // 1. Try Gmail API if Admin/System OAuth token is registered on server
    if (serverMailOAuthToken) {
      const gSuccess = await sendViaGmailApiServer(ticket.email, subject, htmlContent, serverMailOAuthToken);
      if (gSuccess) return true;
    }

    // 2. Fallback to Nodemailer SMTP
    const transport = getMailTransporter();
    const fromAddress = process.env.SMTP_FROM || `"Built to Break Support Team" <support@builttobreak.delhi.gov.in>`;
    const textContent = `Dear ${customerName},\n\nThank you for reaching out to us.\nWe have successfully received your support ticket (${ticketCode}) and our team is currently working on it.\nWe appreciate your patience while we review the details. We will update you as soon as there is progress or if we require any additional information from you.\nIf you need to add any details to this request, simply reply directly to this email.\n\nBest regards,\nBuilt to Break Support Team`;

    const info = await transport.sendMail({
      from: fromAddress,
      to: ticket.email,
      subject,
      html: htmlContent,
      text: textContent
    });

    console.log(`[AUTOMATED MAIL SUCCESS] Confirmation email dispatched for ticket ${ticketCode} to ${ticket.email}. MessageID:`, info.messageId || "Dispatched");
    return true;
  } catch (error) {
    console.error("[AUTOMATED MAIL ERROR] Failed to send ticket confirmation email:", error);
    return false;
  }
}

/**
 * Send Automated Email when an admin updates a ticket status or posts a message/comment
 */
export async function sendTicketStatusUpdateEmailServer(
  ticket: TicketData,
  message: string,
  newStatus: string
): Promise<boolean> {
  try {
    const ticketCode = ticket.ticketCode || "TKT-XXXXX";
    const customerName = ticket.name || "Customer";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 8px;">
        <p>Dear ${customerName},</p>
        <p>Thank you for reaching out to us.</p>
        <p>We have an update regarding your support ticket (<strong>${ticketCode}</strong>):</p>
        <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0;"><strong>Status:</strong> ${newStatus || ticket.status}</p>
          <p style="margin: 0;"><strong>Comment / Update:</strong> ${message || "Your request is being processed."}</p>
        </div>
        <p>We appreciate your patience while we review the details. We will update you as soon as there is progress or if we require any additional information from you.</p>
        <p>If you need to add any details to this request, simply reply directly to this email.</p>
        <br />
        <p>Best regards,<br /><strong>Built to Break Support Team</strong></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 24px;" />
        <p style="font-size: 11px; color: #71717a;">Ticket Reference: ${ticketCode}</p>
      </div>
    `;

    const subject = `Support Ticket Update [${ticketCode}]`;

    // 1. Try Gmail API if Admin/System OAuth token is registered on server
    if (serverMailOAuthToken) {
      const gSuccess = await sendViaGmailApiServer(ticket.email, subject, htmlContent, serverMailOAuthToken);
      if (gSuccess) return true;
    }

    // 2. Fallback to Nodemailer SMTP
    const transport = getMailTransporter();
    const fromAddress = process.env.SMTP_FROM || `"Built to Break Support Team" <support@builttobreak.delhi.gov.in>`;
    const textContent = `Dear ${customerName},\n\nThank you for reaching out to us.\nWe have an update regarding your support ticket (${ticketCode}):\nStatus: ${newStatus}\nComment/Update: ${message}\n\nWe appreciate your patience while we review the details. We will update you as soon as there is progress or if we require any additional information from you.\nIf you need to add any details to this request, simply reply directly to this email.\n\nBest regards,\nBuilt to Break Support Team`;

    const info = await transport.sendMail({
      from: fromAddress,
      to: ticket.email,
      subject,
      html: htmlContent,
      text: textContent
    });

    console.log(`[AUTOMATED MAIL SUCCESS] Status update email dispatched for ticket ${ticketCode} to ${ticket.email}. MessageID:`, info.messageId || "Dispatched");
    return true;
  } catch (error) {
    console.error("[AUTOMATED MAIL ERROR] Failed to send ticket update email:", error);
    return false;
  }
}
