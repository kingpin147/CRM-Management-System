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
