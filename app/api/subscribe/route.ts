import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import EmailSubscription from "@/lib/models/EmailSubscription";
import { headers } from "next/headers";
import { logError } from "@/lib/logger";
import { handleApiError } from "@/lib/error-handler";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, source = "other" } = body;

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address",
        },
        { status: 400 }
      );
    }

    // Get request metadata
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || undefined;
    const forwardedFor = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || undefined;
    const referrer = headersList.get("referer") || undefined;

    // Check if email already exists
    const existingSubscription = await EmailSubscription.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingSubscription) {
      // If already subscribed and active, return success
      if (existingSubscription.status === "active") {
        return NextResponse.json(
          {
            success: true,
            message: "You're already subscribed to our newsletter!",
            alreadySubscribed: true,
          },
          { status: 200 }
        );
      }

      // If unsubscribed, reactivate the subscription
      if (existingSubscription.status === "unsubscribed") {
        existingSubscription.status = "active";
        existingSubscription.subscribedAt = new Date();
        delete existingSubscription.unsubscribedAt;
        existingSubscription.metadata = {};
        if (userAgent) existingSubscription.metadata.userAgent = userAgent;
        if (ipAddress) existingSubscription.metadata.ipAddress = ipAddress;
        if (referrer) existingSubscription.metadata.referrer = referrer;
        await existingSubscription.save();

        return NextResponse.json(
          {
            success: true,
            message:
              "Welcome back! You've been resubscribed to our newsletter.",
            resubscribed: true,
          },
          { status: 200 }
        );
      }
    }

    // Create new subscription
    await EmailSubscription.create({
      email: email.toLowerCase().trim(),
      source,
      status: "active",
      metadata: {
        userAgent,
        ipAddress,
        referrer,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed to our newsletter!",
        subscribed: true,
      },
      { status: 201 }
    );
  } catch (error) {
    logError("Email subscription error", "API", error as Error);

    // Handle duplicate key error (MongoDB unique constraint)
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json(
        {
          success: true,
          message: "You're already subscribed to our newsletter!",
          alreadySubscribed: true,
        },
        { status: 200 }
      );
    }

    return handleApiError(
      error,
      "Failed to subscribe. Please try again later."
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email parameter is required" },
        { status: 400 }
      );
    }

    const subscription = await EmailSubscription.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!subscription) {
      return NextResponse.json(
        {
          success: true,
          subscribed: false,
          message: "Email not found in subscriptions",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      subscribed: subscription.status === "active",
      status: subscription.status,
      subscribedAt: subscription.subscribedAt,
      source: subscription.source,
    });
  } catch (error) {
    return handleApiError(error, "Failed to check subscription status");
  }
}
