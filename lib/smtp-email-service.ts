import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter;

if (typeof window === "undefined") {

  const smtpConfig = {
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  transporter = nodemailer.createTransport(smtpConfig);
}

export class SMTPEmailService {

  static async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      if (typeof window !== "undefined") {
        return {
          success: false,
          message: "Email service can only be used on server-side",
        };
      }

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
      const companyName = process.env.NEXT_PUBLIC_APP_NAME || "ThePreMax";

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - ${companyName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #e9ecef; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2c3e50; }
            .content { padding: 20px 0; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background: #0056b3; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${companyName}</div>
            </div>
            
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello ${firstName},</p>
              
              <p>We received a request to reset your password for your ${companyName} account. If you made this request, click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>
              
              <div class="warning">
                <strong>Important:</strong> This link will expire in 15 minutes for security reasons.
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">${resetUrl}</p>
              
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <p>Best regards,<br>The ${companyName} Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent from ${companyName}. If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Password Reset Request - ${companyName}
        
        Hello ${firstName},
        
        We received a request to reset your password for your ${companyName} account. If you made this request, click the link below to reset your password:
        
        ${resetUrl}
        
        Important: This link will expire in 15 minutes for security reasons.
        
        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        
        Best regards,
        The ${companyName} Team
      `;

      const mailOptions = {
        from: `"${companyName}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Password Reset Request - ${companyName}`,
        text: textContent,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);

      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    } catch (error) {
      console.error("Send password reset email error:", error);
      return {
        success: false,
        message: "Failed to send password reset email",
      };
    }
  }

static async sendWelcomeEmail(
    email: string,
    firstName: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      if (typeof window !== "undefined") {
        return {
          success: false,
          message: "Email service can only be used on server-side",
        };
      }

      const welcomeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile`;
      const companyName = process.env.NEXT_PUBLIC_APP_NAME || "ThePreMax";

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${companyName}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #e9ecef; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2c3e50; }
            .content { padding: 20px 0; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background: #218838; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">${companyName}</div>
            </div>
            
            <div class="content">
              <h2>Welcome to ${companyName}!</h2>
              <p>Hello ${firstName},</p>
              
              <p>Thank you for joining ${companyName}! We're excited to have you as part of our community.</p>
              
              <p>Your account has been successfully created and you can now:</p>
              <ul>
                <li>Browse our products and services</li>
                <li>Make purchases with ease</li>
                <li>Track your orders</li>
                <li>Manage your profile and preferences</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${welcomeUrl}" class="button">Get Started</a>
              </div>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Welcome aboard!<br>The ${companyName} Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent from ${companyName}. If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        Welcome to ${companyName}!
        
        Hello ${firstName},
        
        Thank you for joining ${companyName}! We're excited to have you as part of our community.
        
        Your account has been successfully created and you can now:
        - Browse our products and services
        - Make purchases with ease
        - Track your orders
        - Manage your profile and preferences
        
        Get started: ${welcomeUrl}
        
        If you have any questions or need assistance, please don't hesitate to contact our support team.
        
        Welcome aboard!
        The ${companyName} Team
      `;

      const mailOptions = {
        from: `"${companyName}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Welcome to ${companyName}!`,
        text: textContent,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);

      return {
        success: true,
        message: "Welcome email sent successfully",
      };
    } catch (error) {
      console.error("Send welcome email error:", error);
      return {
        success: false,
        message: "Failed to send welcome email",
      };
    }
  }

static async sendEmail(
    to: string | string[],
    subject: string,
    htmlContent: string,
    textContent?: string
  ): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      if (typeof window !== "undefined") {
        return {
          success: false,
          message: "Email service can only be used on server-side",
        };
      }

      const companyName = process.env.NEXT_PUBLIC_APP_NAME || "ThePreMax";

      const mailOptions = {
        from: `"${companyName}" <${process.env.SMTP_USER}>`,
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        text: textContent,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);

      return {
        success: true,
        message: "Email sent successfully",
      };
    } catch (error) {
      console.error("Send email error:", error);
      return {
        success: false,
        message: "Failed to send email",
      };
    }
  }

static async testConnection(): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      if (typeof window !== "undefined") {
        return {
          success: false,
          message: "Email service can only be used on server-side",
        };
      }

      await transporter.verify();

      return {
        success: true,
        message: "SMTP connection successful",
      };
    } catch (error) {
      console.error("SMTP connection test error:", error);
      return {
        success: false,
        message: "SMTP connection failed",
      };
    }
  }
}
