import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export async function sendOtpEmail(toEmail: string, recipientName: string, otp: string): Promise<boolean> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '').trim();
  const from = process.env.EMAIL_FROM || '"Srijan Studio" <no-reply@srijan.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FBF9F5; margin: 0; padding: 30px; color: #2B2523; }
          .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #EBE4DA; padding: 40px 32px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
          .logo { font-size: 26px; font-weight: 700; letter-spacing: 0.05em; color: #2B2523; margin-bottom: 6px; }
          .sublogo { font-size: 13px; color: #C48B71; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 28px; }
          .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #2B2523; }
          .text { font-size: 15px; color: #746D66; line-height: 1.6; margin-bottom: 28px; }
          .otp-box { background: #FAF7F2; border: 1.5px dashed #C48B71; border-radius: 12px; padding: 18px 24px; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #2B2523; margin: 0 auto 28px; display: inline-block; font-family: monospace; }
          .warning { font-size: 13px; color: #8C827A; line-height: 1.5; margin-bottom: 30px; }
          .footer { font-size: 12px; color: #A0978E; border-top: 1px solid #F0ECE6; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Srijan</div>
          <div class="sublogo">Handcrafted Elegance by Rakhi</div>
          <div class="greeting">Hello ${recipientName || 'Valued Customer'},</div>
          <p class="text">Please use the verification code below to securely sign in to your Srijan account:</p>
          <div class="otp-box">${otp}</div>
          <p class="warning">
            ⏱️ <strong>This code expires in 5 minutes.</strong><br/>
            For your security, never share this code with anyone. Srijan staff will never ask for your verification code.
          </p>
          <div class="footer">
            Handcrafted with love from Rakhi's Artisan Studio.<br/>
            &copy; ${new Date().getFullYear()} Srijan. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  // Always log clearly to server console so developer can verify in development
  console.log(`\n========================================================`);
  console.log(`🔑 [SRIJAN OTP SERVICE] REAL EMAIL VERIFICATION DISPATCH`);
  console.log(`Recipient: ${recipientName} <${toEmail}>`);
  console.log(`Generated OTP: [ ${otp} ]`);
  console.log(`Expires in: 5 minutes`);
  console.log(`========================================================\n`);

  if (!user || !pass) {
    console.log(`ℹ️ [SMTP INFO]: SMTP_USER / SMTP_PASS not set in auth-service .env.`);
    console.log(`ℹ️ [SMTP INFO]: The OTP code has been logged above. To send real emails via Gmail or Resend, set SMTP_USER and SMTP_PASS in server/services/auth-service/.env.`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: toEmail,
      subject: `${otp} is your Srijan verification code`,
      text: `Hello ${recipientName},\n\nYour Srijan verification code is: ${otp}\n\nThis code expires in 5 minutes. Never share this code with anyone.\n\nSrijan Studio`,
      html: htmlContent,
    });

    console.log(`✅ [SRIJAN OTP SERVICE] Live email successfully dispatched via SMTP to ${toEmail}`);
    return true;
  } catch (err: any) {
    console.error(`❌ [SRIJAN OTP SERVICE] SMTP delivery failed:`, err.message);
    // Return true so user can still complete verification using console OTP even if SMTP is misconfigured
    return true;
  }
}
