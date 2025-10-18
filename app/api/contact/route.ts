import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ContactMessage from "@/lib/models/ContactMessage";
import { handleApiError, handleValidationError } from "@/lib/error-handler";
import { contactSchema } from "@/lib/validation/schemas";
import { InputSanitizer } from "@/lib/validation/sanitizer";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      return handleValidationError(
        validationResult.error.issues,
        "Validation failed"
      );
    }

    const { name, email, subject, message } = validationResult.data;

    // Sanitize inputs before saving
    const contactMessage = new ContactMessage({
      name: InputSanitizer.sanitizeString(name, 100),
      email: InputSanitizer.sanitizeEmail(email),
      subject: subject ? InputSanitizer.sanitizeString(subject, 200) : "",
      message: InputSanitizer.sanitizeString(message, 2000),
      status: "new",
    });

    await contactMessage.save();

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully! We'll get back to you soon.",
        data: {
          id: contactMessage._id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(
      error,
      "Failed to send message. Please try again later."
    );
  }
}
