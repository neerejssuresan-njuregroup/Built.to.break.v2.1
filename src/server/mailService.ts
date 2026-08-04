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

export function getMailTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    console.log(`[MAIL SERVICE] SMTP Transporter configured (${host}:${port})`);
  } else {
    // Fallback JSON transport for development/preview environments
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
    console.log("[MAIL SERVICE] Fallback Transporter initialized. Logs & JSON transport ready.");
  }

  return transporter;
}

/**
 * Send Automated Email when a new support ticket is created
 */
export async function sendTicketConfirmationEmailServer(ticket: TicketData): Promise<boolean> {
  try {
    const transport = getMailTransporter();
    const fromAddress = process.env.SMTP_FROM || `"Built to Break ITSM Support" <support@builttobreak.delhi.gov.in>`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #e4e4e7; padding: 32px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #27272a;">
        <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #ef4444; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">
            🚨 Built to Break — ITSM Support Ticket Registered
          </h2>
          <p style="color: #71717a; font-size: 11px; font-family: monospace; margin-top: 4px;">
            MUNICIPAL FIRE SAFETY COMPLIANCE SYSTEM • AUTOMATED DISPATCH
          </p>
        </div>

        <p>Dear <strong>${ticket.name}</strong>,</p>
        <p>Your support ticket has been logged into our ITSM Incident & Regulatory Assistance System. Our compliance technical team will inspect your inquiry.</p>

        <div style="background-color: #18181b; padding: 20px; border-left: 4px solid #38bdf8; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 6px 0; font-size: 14px;"><strong>Ticket Code:</strong> <span style="font-family: monospace; color: #fbbf24; font-weight: bold; font-size: 16px;">${ticket.ticketCode}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Subject:</strong> ${ticket.subject}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Category:</strong> ${ticket.category}</p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Priority Level:</strong> <span style="color: #ef4444; font-weight: bold;">${ticket.priority}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Initial Status:</strong> <span style="color: #4ade80; font-weight: bold;">${ticket.status}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Registered Phone:</strong> ${ticket.phone}</p>
        </div>

        <div style="margin: 20px 0;">
          <p style="margin-bottom: 8px; font-size: 13px; font-weight: bold; color: #a1a1aa;">INQUIRY DESCRIPTION:</p>
          <div style="background: #27272a; padding: 14px; border-radius: 6px; color: #d4d4d8; font-size: 13px; line-height: 1.5; border: 1px solid #3f3f46;">
            ${ticket.description}
          </div>
        </div>

        <div style="background-color: #172554; border: 1px solid #1e40af; padding: 14px; border-radius: 6px; margin-top: 24px;">
          <p style="margin: 0; font-size: 12px; color: #93c5fd;">
            🔍 <strong>Live Tracking:</strong> You can track this ticket anytime using code <strong>${ticket.ticketCode}</strong> in the Support Portal or under <strong>My Support Tickets</strong> in your profile.
          </p>
        </div>

        <hr style="border: 0; border-top: 1px solid #27272a; margin: 28px 0 16px 0;" />
        <p style="font-size: 11px; color: #71717a; text-align: center; margin: 0;">
          Delhi Municipal Fire Compliance System • Automated Notification System
        </p>
      </div>
    `;

    const info = await transport.sendMail({
      from: fromAddress,
      to: ticket.email,
      subject: `[ITSM Support] Ticket Logged: ${ticket.ticketCode} - ${ticket.subject}`,
      html: htmlContent,
      text: `Support Ticket Logged\nTicket Code: ${ticket.ticketCode}\nSubject: ${ticket.subject}\nStatus: ${ticket.status}\nDescription: ${ticket.description}`
    });

    console.log(`[AUTOMATED MAIL SUCCESS] Confirmation email dispatched for ticket ${ticket.ticketCode} to ${ticket.email}. MessageID:`, info.messageId || "Dispatched");
    return true;
  } catch (error) {
    console.error("[AUTOMATED MAIL ERROR] Failed to send ticket confirmation email:", error);
    return false;
  }
}

/**
 * Send Automated Email when an admin updates a ticket status or posts a message
 */
export async function sendTicketStatusUpdateEmailServer(
  ticket: TicketData,
  message: string,
  newStatus: string
): Promise<boolean> {
  try {
    const transport = getMailTransporter();
    const fromAddress = process.env.SMTP_FROM || `"Built to Break ITSM Support" <support@builttobreak.delhi.gov.in>`;

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #e4e4e7; padding: 32px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #27272a;">
        <div style="border-bottom: 2px solid #38bdf8; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #38bdf8; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px;">
            🔔 Support Ticket Status Update
          </h2>
          <p style="color: #71717a; font-size: 11px; font-family: monospace; margin-top: 4px;">
            ITSM INCIDENT RESOLUTION TERMINAL
          </p>
        </div>

        <p>Dear <strong>${ticket.name}</strong>,</p>
        <p>An official update has been recorded for your support ticket <strong style="color: #fbbf24;">${ticket.ticketCode}</strong>.</p>

        <div style="background-color: #18181b; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 6px 0; font-size: 14px;"><strong>Ticket Code:</strong> <span style="font-family: monospace; color: #fbbf24; font-weight: bold;">${ticket.ticketCode}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Subject:</strong> ${ticket.subject}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>New Ticket Status:</strong> <span style="color: #38bdf8; font-weight: bold; background: #0c4a6e; padding: 2px 8px; border-radius: 4px;">${newStatus}</span></p>
          <p style="margin: 6px 0; font-size: 13px;"><strong>Assigned Admin:</strong> ${ticket.assignedTo || "System Administrator"}</p>
        </div>

        <div style="margin: 20px 0;">
          <p style="margin-bottom: 8px; font-size: 13px; font-weight: bold; color: #a1a1aa;">OFFICIAL ADMIN RESPONSE / RESOLUTION:</p>
          <div style="background: #172554; padding: 14px; border-radius: 6px; color: #bfdbfe; font-size: 13px; line-height: 1.5; border: 1px solid #1d4ed8;">
            ${message || "Your ticket status has been updated."}
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid #27272a; margin: 28px 0 16px 0;" />
        <p style="font-size: 11px; color: #71717a; text-align: center; margin: 0;">
          Delhi Municipal Fire Safety Compliance System • Support Resolution Desk
        </p>
      </div>
    `;

    const info = await transport.sendMail({
      from: fromAddress,
      to: ticket.email,
      subject: `[ITSM Support] Status Update for Ticket ${ticket.ticketCode} (${newStatus})`,
      html: htmlContent,
      text: `Support Ticket Update\nTicket Code: ${ticket.ticketCode}\nNew Status: ${newStatus}\nMessage: ${message}`
    });

    console.log(`[AUTOMATED MAIL SUCCESS] Status update email dispatched for ticket ${ticket.ticketCode} to ${ticket.email}. MessageID:`, info.messageId || "Dispatched");
    return true;
  } catch (error) {
    console.error("[AUTOMATED MAIL ERROR] Failed to send ticket update email:", error);
    return false;
  }
}
