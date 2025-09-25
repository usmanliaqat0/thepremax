import * as brevo from "@getbrevo/brevo";

// Initialize Brevo API client
let apiInstance: brevo.TransactionalEmailsApi;

if (typeof window === "undefined") {
  // Server-side only
  const apiKey = process.env.BREVO_API_KEY;
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
  // Send password reset email
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

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

      const emailData = {
        to: [{ email, name: firstName }],
        templateId: parseInt(
          process.env.BREVO_PASSWORD_RESET_TEMPLATE_ID || "0"
        ),
        params: {
          firstName,
          resetUrl,
          companyName: process.env.NEXT_PUBLIC_APP_NAME || "ThePreMax",
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

  // Send custom email using Brevo
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

      const emailData = {
        to,
        subject,
        htmlContent,
        textContent,
        sender: {
          name: process.env.BREVO_SENDER_NAME || "ThePreMax",
          email: process.env.BREVO_SENDER_EMAIL || "no-reply@usmanliaqat.com",
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

  // Send welcome email
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

      const welcomeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/profile`;

      const emailData = {
        to: [{ email, name: firstName }],
        templateId: parseInt(process.env.BREVO_WELCOME_TEMPLATE_ID || "0"),
        params: {
          firstName,
          welcomeUrl,
          companyName: process.env.NEXT_PUBLIC_APP_NAME || "ThePreMax",
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
