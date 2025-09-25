import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Send test email using Brevo
    const testResult = await EmailService.sendEmail(
      [{ email, name: "Test User" }],
      "Test Email from ThePreMax",
      `
        <h2>Test Email</h2>
        <p>This is a test email to verify that your Brevo API configuration is working correctly.</p>
        <p>If you received this email, your email setup is successful!</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
      `Test Email\n\nThis is a test email to verify that your Brevo API configuration is working correctly.\n\nIf you received this email, your email setup is successful!\n\nTime: ${new Date().toLocaleString()}`
    );

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully! Check your inbox.",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Failed to send test email: ${testResult.message}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
