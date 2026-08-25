export async function sendInvitationEmail(email: string, name: string, role: string) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY not found in environment variables.");
    return false;
  }

  // Format the role to be more readable (e.g. SUPER_ADMIN -> Super Admin)
  const formattedRole = role.replace('_', ' ').toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: 'Inter', Helvetica, Arial, sans-serif;
        background-color: #F5F6F3;
        margin: 0;
        padding: 40px 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      }
      .header {
        background-color: #12213A;
        padding: 30px;
        text-align: center;
      }
      .logo {
        font-size: 28px;
        font-weight: 800;
        color: #ffffff;
        text-decoration: none;
        letter-spacing: -0.5px;
      }
      .logo span {
        color: #E8A33D;
      }
      .content {
        padding: 40px 30px;
        color: #1B1F24;
        line-height: 1.6;
      }
      h1 {
        color: #12213A;
        font-size: 24px;
        margin-top: 0;
        margin-bottom: 20px;
      }
      .button {
        display: inline-block;
        background-color: #E8A33D;
        color: #12213A;
        font-weight: 600;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 8px;
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .footer {
        background-color: #F5F6F3;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #4A5A73;
        border-top: 1px solid rgba(18, 33, 58, 0.1);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">EnergyGurus<span>CRM</span></div>
      </div>
      <div class="content">
        <h1>Welcome to EnergyGurus CRM!</h1>
        <p>Hello ${name},</p>
        <p>You have been invited to join the EnergyGurus Solar CRM platform as a ${formattedRole}.</p>
        
        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">Access the Portal</a>
        </div>
        
        <p>If you don't have a password yet, simply click "Forgot Password" on the login screen using this email address to set it up securely.</p>
        
        <p>Best regards,<br>The EnergyGurus CRM</p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} EnergyGurus. All rights reserved.<br>
        This is an automated message generated via Brevo.
      </div>
    </div>
  </body>
  </html>
  `;

  const payload = {
    sender: {
      name: "EnergyGurus CRM",
      email: "energyguruscrm@gmail.com" 
    },
    to: [
      {
        email: email,
        name: name
      }
    ],
    subject: "Invitation to EnergyGurus CRM",
    htmlContent: emailHtml
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log(`Invitation email sent successfully to ${email}`);
      return true;
    } else {
      const data = await response.json();
      console.error("Failed to send invitation email:", data);
      return false;
    }
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return false;
  }
}

export interface SendInvoiceEmailParams {
  email: string
  name: string
  invoiceNumber: string
  amount: number
  month: string
  dueDate: string
  planName?: string
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("BREVO_API_KEY not found in environment variables.");
    return { success: false, error: "BREVO_API_KEY not configured" };
  }

  const { email, name, invoiceNumber, amount, month, dueDate, planName } = params

  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: 'Inter', Helvetica, Arial, sans-serif;
        background-color: #F5F6F3;
        margin: 0;
        padding: 30px 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      }
      .header {
        background-color: #002868;
        padding: 24px 30px;
        text-align: center;
      }
      .logo {
        font-size: 24px;
        font-weight: 800;
        color: #ffffff;
        text-decoration: none;
        letter-spacing: -0.5px;
      }
      .logo span {
        color: #f26522;
      }
      .content {
        padding: 32px 30px;
        color: #1B1F24;
        line-height: 1.6;
      }
      .invoice-box {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      .invoice-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 14px;
      }
      .invoice-row.total {
        font-weight: bold;
        font-size: 16px;
        border-top: 1px solid #cbd5e1;
        padding-top: 10px;
        margin-top: 10px;
        color: #002868;
      }
      .footer {
        background-color: #F5F6F3;
        padding: 16px;
        text-align: center;
        font-size: 12px;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">ENERGY GURUS<span> CRM</span></div>
      </div>
      <div class="content">
        <h2 style="color: #002868; margin-top: 0;">Monthly Solar O&M Invoice</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>Your solar system operation & maintenance bill has been generated for the month of <strong>${month}</strong>.</p>
        
        <div class="invoice-box">
          <div class="invoice-row">
            <span>Invoice Number:</span>
            <strong>${invoiceNumber}</strong>
          </div>
          ${planName ? `
          <div class="invoice-row">
            <span>Package Plan:</span>
            <strong>${planName}</strong>
          </div>` : ''}
          <div class="invoice-row">
            <span>Billing Month:</span>
            <strong>${month}</strong>
          </div>
          <div class="invoice-row">
            <span>Due Date:</span>
            <strong style="color: #c2410c;">${dueDate}</strong>
          </div>
          <div class="invoice-row total">
            <span>Amount Payable:</span>
            <span>PKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <p style="font-size: 13px; color: #475569;">Kindly pay your bill before the due date (<strong>${dueDate}</strong>) to avoid service disruption or late overdue notices.</p>
        
        <p style="margin-top: 24px;">Best Regards,<br><strong>Energy Gurus Operations & Billing Team</strong></p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} EnergyGurus. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `

  const payload = {
    sender: {
      name: "Energy Gurus Billing",
      email: process.env.BREVO_SENDER_EMAIL || "energyguruscrm@gmail.com"
    },
    to: [
      {
        email: email,
        name: name
      }
    ],
    subject: `Monthly Invoice (${month}) - PKR ${amount.toLocaleString()} - ${invoiceNumber}`,
    htmlContent: emailHtml
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    if (response.ok) {
      return { success: true, messageId: data.messageId }
    } else {
      return { success: false, error: data.message || 'Failed to send invoice email' }
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Network error sending email via Brevo' }
  }
}

