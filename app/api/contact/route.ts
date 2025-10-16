import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ContactMessage from "@/lib/models/ContactMessage";
import { z } from "zod";
import { handleApiError, handleValidationError } from "@/lib/error-handler";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  subject: z.string().max(200, "Subject is too long").optional(),
  message: z
    .string()
    .min(1, "Message is required")
    .max(2000, "Message is too long"),
});

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

    const contactMessage = new ContactMessage({
      name,
      email,
      subject: subject || "",
      message,
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
