import * as brevo from "@getbrevo/brevo";
import { getEnvConfig } from "./env-validation";

let apiInstance: brevo.TransactionalEmailsApi;

if (typeof window === "undefined") {
  const env = getEnvConfig();
  const apiKey = env.BREVO_API_KEY;

  if (apiKey) {
    apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  } else {
    console.warn(
      "⚠️  BREVO_API_KEY environment variable not found. Email service will be disabled."
    );
  }
}

export class EmailService {
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

      if (!apiInstance) {
        return {
          success: false,
          message:
            "Email service is not configured. Please set BREVO_API_KEY environment variable.",
        };
      }

      const env = getEnvConfig();
      const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

      const emailData = {
        to: [{ email, name: firstName }],
        templateId: parseInt(env.BREVO_PASSWORD_RESET_TEMPLATE_ID || "0"),
        params: {
          firstName,
          resetUrl,
          companyName: env.NEXT_PUBLIC_APP_NAME,
        },
      };

      await apiInstance.sendTransacEmail(emailData);

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

  static async sendEmail(
    to: { email: string; name?: string }[],
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

      if (!apiInstance) {
        return {
          success: false,
          message:
            "Email service is not configured. Please set BREVO_API_KEY environment variable.",
        };
      }

      const env = getEnvConfig();
      const emailData = {
        to,
        subject,
        htmlContent,
        textContent,
        sender: {
          name: env.BREVO_SENDER_NAME || "ThePreMax",
          email: env.BREVO_SENDER_EMAIL || "no-reply@usmanliaqat.com",
        },
      };

      await apiInstance.sendTransacEmail(emailData);

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

  static async sendPasswordResetVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string
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

      if (!apiInstance) {
        return {
          success: false,
          message:
            "Email service is not configured. Please set BREVO_API_KEY environment variable.",
        };
      }

      const verificationCode = verificationToken.substring(0, 6).toUpperCase();
      console.log(
        "Generated password reset verification code:",
        verificationCode
      );
      console.log("Full token:", verificationToken);

      const env = getEnvConfig();
      const resetUrl = `${
        env.NEXT_PUBLIC_APP_URL
      }/reset-password-verify?email=${encodeURIComponent(
        email
      )}&code=${verificationCode}`;

      const emailData = {
        to: [{ email, name: firstName }],
        templateId: parseInt(env.BREVO_PASSWORD_RESET_TEMPLATE_ID || "0"),
        params: {
          firstName,
          verificationCode,
          resetUrl,
          companyName: env.NEXT_PUBLIC_APP_NAME,
        },
      };

      await apiInstance.sendTransacEmail(emailData);

      return {
        success: true,
        message: "Password reset verification email sent successfully",
      };
    } catch (error) {
      console.error("Send password reset verification email error:", error);

      // Fallback to direct email sending if template fails
      try {
        const env = getEnvConfig();
        const verificationCode = verificationToken
          .substring(0, 6)
          .toUpperCase();
        const resetUrl = `${
          env.NEXT_PUBLIC_APP_URL
        }/reset-password-verify?email=${encodeURIComponent(
          email
        )}&code=${verificationCode}`;

        const companyName = env.NEXT_PUBLIC_APP_NAME;

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - ${companyName}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
              <h2 style="color: #333; margin-top: 0;">Hello ${firstName},</h2>
              
              <p>We received a request to reset your password for your <strong>${companyName}</strong> account. To complete the password reset process, please use the verification code below:</p>
              
              <div style="background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <h3 style="color: #667eea; margin: 0; font-size: 24px; letter-spacing: 3px;">${verificationCode}</h3>
              </div>
              
              <p>Or click the button below to reset your password:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">Reset Password</a>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>Important:</strong> This verification code is unique to your account. Keep it secure and don't share it with anyone.</p>
              </div>
              
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
              
              <div style="text-align: center; color: #6c757d; font-size: 14px;">
                <p>Best regards,<br><strong>${companyName}</strong><br>
                If you have any questions, please contact our <a href="mailto:support@thepremax.com">support team</a></p>
              </div>
            </div>
          </body>
          </html>
        `;

        const textContent = `
          Reset Your Password - ${companyName}
          
          Hello ${firstName},
          
          We received a request to reset your password for your ${companyName} account. To complete the password reset process, please use the verification code below:
          
          Verification Code: ${verificationCode}
          
          Or visit this link: ${resetUrl}
          
          Important: This verification code is unique to your account. Keep it secure and don't share it with anyone.
          
          If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          
          Best regards,
          The ${companyName} Team
        `;

        const fallbackResult = await this.sendEmail(
          [{ email, name: firstName }],
          `Reset Your Password - ${companyName}`,
          htmlContent,
          textContent
        );

        if (fallbackResult.success) {
          return {
            success: true,
            message:
              "Password reset verification email sent successfully (fallback method)",
          };
        }
      } catch (fallbackError) {
        console.error(
          "Fallback password reset verification error:",
          fallbackError
        );
      }

      return {
        success: false,
        message: "Failed to send password reset verification email",
      };
    }
  }

  static async sendEmailVerificationEmail(
    email: string,
    firstName: string,
    verificationToken: string
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

      if (!apiInstance) {
        return {
          success: false,
          message:
            "Email service is not configured. Please set BREVO_API_KEY environment variable.",
        };
      }

      const verificationCode = verificationToken.substring(0, 6).toUpperCase();
      console.log("Generated verification code:", verificationCode);
      console.log("Full token:", verificationToken);

      const env = getEnvConfig();
      const verificationUrl = `${
        env.NEXT_PUBLIC_APP_URL
      }/verify-code?email=${encodeURIComponent(
        email
      )}&code=${verificationCode}`;

      const emailData = {
        to: [{ email, name: firstName }],
        templateId: parseInt(env.BREVO_EMAIL_VERIFICATION_TEMPLATE_ID || "0"),
        params: {
          firstName,
          verificationCode,
          verificationUrl,
          companyName: env.NEXT_PUBLIC_APP_NAME,
        },
      };

      await apiInstance.sendTransacEmail(emailData);

      return {
        success: true,
        message: "Email verification email sent successfully",
      };
    } catch (error) {
      console.error("Send email verification email error:", error);

      try {
        const verificationCode = verificationToken
          .substring(0, 6)
          .toUpperCase();
        console.log(
          "Fallback - Generated verification code:",
          verificationCode
        );
        console.log("Fallback - Full token:", verificationToken);

        const env = getEnvConfig();
        const verificationUrl = `${
          env.NEXT_PUBLIC_APP_URL
        }/verify-code?email=${encodeURIComponent(
          email
        )}&code=${verificationCode}`;
        const companyName = env.NEXT_PUBLIC_APP_NAME;

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email - ${companyName}</title>
            <style>
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
                line-height: 1.6; 
                color: #374151; 
                margin: 0; 
                padding: 0; 
                background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
              }
              .email-container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 16px; 
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                overflow: hidden;
              }
              .header { 
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                color: white;
                text-align: center; 
                padding: 40px 20px;
                position: relative;
              }
              .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
                opacity: 0.3;
              }
              .logo { 
                font-size: 28px; 
                font-weight: 800; 
                color: white;
                margin: 0;
                position: relative;
                z-index: 1;
              }
              .content { 
                padding: 40px 30px; 
              }
              .welcome-text {
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 16px 0;
                text-align: center;
              }
              .description {
                font-size: 16px;
                color: #6b7280;
                margin: 0 0 32px 0;
                text-align: center;
                line-height: 1.5;
              }
              .code-container {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                border: 2px solid #e2e8f0;
                border-radius: 12px;
                padding: 24px;
                margin: 32px 0;
                text-align: center;
              }
              .code-label {
                font-size: 14px;
                font-weight: 600;
                color: #64748b;
                margin: 0 0 12px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .code { 
                display: inline-block; 
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                color: white;
                padding: 20px 40px; 
                font-size: 32px; 
                font-weight: 800; 
                letter-spacing: 8px; 
                border-radius: 12px; 
                margin: 0;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border: 2px solid #374151;
              }
              .button-container {
                text-align: center;
                margin: 32px 0;
              }
              .button { 
                display: inline-block; 
                background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
                color: white; 
                padding: 16px 32px; 
                text-decoration: none; 
                border-radius: 12px; 
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
                border: none;
                cursor: pointer;
              }
              .button:hover { 
                background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
                transform: translateY(-1px);
                box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.15);
              }
              .warning { 
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                border: 1px solid #f59e0b;
                color: #92400e;
                padding: 20px;
                border-radius: 12px;
                margin: 32px 0;
                font-size: 14px;
                line-height: 1.5;
              }
              .warning strong {
                color: #78350f;
              }
              .footer { 
                background: #f8fafc;
                text-align: center; 
                padding: 30px 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280; 
                font-size: 14px;
                line-height: 1.5;
              }
              .footer a {
                color: #1f2937;
                text-decoration: none;
                font-weight: 600;
              }
              .footer a:hover {
                text-decoration: underline;
              }
              .divider {
                height: 1px;
                background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
                margin: 32px 0;
              }
              @media (max-width: 600px) {
                .email-container { margin: 0; border-radius: 0; }
                .content { padding: 30px 20px; }
                .code { font-size: 24px; letter-spacing: 4px; padding: 16px 24px; }
                .welcome-text { font-size: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <div class="logo">${companyName}</div>
              </div>
              
              <div class="content">
                <h1 class="welcome-text">Welcome to ${companyName}!</h1>
                <p class="description">Hello ${firstName}, thank you for joining us. Please verify your email address to complete your registration and start shopping.</p>
                
                <div class="code-container">
                  <p class="code-label">Your Verification Code</p>
                  <div class="code">${verificationCode}</div>
                </div>
                
                <div class="button-container">
                  <a href="${verificationUrl}" class="button">Verify My Email Address</a>
                </div>
                
                <div class="warning">
                  <strong>🔐 Security:</strong> This verification code is unique to your account. Keep it secure and don't share it with anyone.
                </div>
                
                <div class="divider"></div>
                
                <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 0;">
                  If the button doesn't work, you can copy and paste this link into your browser:<br>
                  <a href="${verificationUrl}" style="color: #1f2937; word-break: break-all;">${verificationUrl}</a>
                </p>
                
                <p style="font-size: 14px; color: #6b7280; text-align: center; margin: 24px 0 0 0;">
                  If you didn't create an account with ${companyName}, please ignore this email.
                </p>
              </div>
              
              <div class="footer">
                <p>This email was sent from <strong>${companyName}</strong><br>
                If you have any questions, please contact our <a href="mailto:support@thepremax.com">support team</a></p>
              </div>
            </div>
          </body>
          </html>
        `;

        const textContent = `
          Verify Your Email Address - ${companyName}
          
          Hello ${firstName},
          
          Thank you for signing up with ${companyName}! To complete your registration and access your account, please use the verification code below:
          
          Verification Code: ${verificationCode}
          
          Or visit this link: ${verificationUrl}
          
          Important: This verification code is unique to your account. Keep it secure and don't share it with anyone.
          
          If you didn't create an account with ${companyName}, please ignore this email.
          
          Best regards,
          The ${companyName} Team
        `;

        const fallbackResult = await this.sendEmail(
          [{ email, name: firstName }],
          `Verify Your Email - ${companyName}`,
          htmlContent,
          textContent
        );

        if (fallbackResult.success) {
          return {
            success: true,
            message:
              "Email verification email sent successfully (fallback method)",
          };
        }
      } catch (fallbackError) {
        console.error("Fallback email verification error:", fallbackError);
      }

      return {
        success: false,
        message: "Failed to send email verification email",
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

      if (!apiInstance) {
        return {
          success: false,
          message:
            "Email service is not configured. Please set BREVO_API_KEY environment variable.",
        };
      }

      const env = getEnvConfig();
      const welcomeUrl = `${env.NEXT_PUBLIC_APP_URL}/profile`;

      const emailData = {
        to: [{ email, name: firstName }],
        templateId: parseInt(env.BREVO_WELCOME_TEMPLATE_ID || "0"),
        params: {
          firstName,
          welcomeUrl,
          companyName: env.NEXT_PUBLIC_APP_NAME,
        },
      };

      await apiInstance.sendTransacEmail(emailData);

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
}
