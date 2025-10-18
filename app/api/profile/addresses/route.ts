import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import { authMiddleware } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/error-handler";
import { ApiResponseBuilder } from "@/lib/api-response";
import { InputSanitizer } from "@/lib/validation/sanitizer";

// GET /api/profile/addresses - Get user addresses
export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return ApiResponseBuilder.unauthorized("Authentication required");
    }

    await connectDB();

    const userDoc = await User.findById(user.id).select("addresses").lean();
    if (!userDoc) {
      return ApiResponseBuilder.notFound("User not found");
    }

    return ApiResponseBuilder.success(
      userDoc.addresses || [],
      "Addresses retrieved successfully"
    );
  } catch (error) {
    return handleApiError(error, "Failed to fetch addresses");
  }
}

// POST /api/profile/addresses - Add new address
export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return ApiResponseBuilder.unauthorized("Authentication required");
    }

    console.log("Address API - Authenticated user ID:", user.id);

    await connectDB();

    const body = await request.json();
    console.log("Address API - Received data:", body);

    const {
      type = "shipping",
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      postalCode,
      country = "United States",
      isDefault = false,
    } = body;

    // Validate required fields
    if (!firstName?.trim()) {
      return ApiResponseBuilder.error("First name is required", 400);
    }
    if (!lastName?.trim()) {
      return ApiResponseBuilder.error("Last name is required", 400);
    }
    if (!phone?.trim()) {
      return ApiResponseBuilder.error("Phone number is required", 400);
    }
    if (!address?.trim()) {
      return ApiResponseBuilder.error("Address is required", 400);
    }
    if (!city?.trim()) {
      return ApiResponseBuilder.error("City is required", 400);
    }
    if (!state?.trim()) {
      return ApiResponseBuilder.error("State is required", 400);
    }
    if (!postalCode?.trim()) {
      return ApiResponseBuilder.error("Postal code is required", 400);
    }

    // Sanitize inputs
    const sanitizedData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: (InputSanitizer.sanitizeString(type) === "billing"
        ? "billing"
        : "shipping") as "shipping" | "billing",
      firstName: InputSanitizer.sanitizeString(firstName),
      lastName: InputSanitizer.sanitizeString(lastName),
      phone: InputSanitizer.sanitizeString(phone),
      address: InputSanitizer.sanitizeString(address),
      city: InputSanitizer.sanitizeString(city),
      state: InputSanitizer.sanitizeString(state),
      postalCode: InputSanitizer.sanitizeString(postalCode),
      country: InputSanitizer.sanitizeString(country),
      isDefault: Boolean(isDefault),
    };

    const userDoc = await User.findById(user.id);
    if (!userDoc) {
      return ApiResponseBuilder.notFound("User not found");
    }

    console.log("Address API - Found user document:", userDoc._id);
    console.log(
      "Address API - Current addresses count:",
      userDoc.addresses?.length || 0
    );

    const currentAddresses = userDoc.addresses || [];

    // If setting as default, remove default from other addresses
    if (sanitizedData.isDefault) {
      currentAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // Add new address
    currentAddresses.push(sanitizedData);

    // Update user
    userDoc.addresses = currentAddresses;
    await userDoc.save();

    console.log("Address API - Successfully saved address:", sanitizedData);
    console.log(
      "Address API - User now has addresses:",
      userDoc.addresses.length
    );

    return ApiResponseBuilder.success(
      sanitizedData,
      "Address added successfully",
      201
    );
  } catch (error) {
    return handleApiError(error, "Failed to add address");
  }
}

// PUT /api/profile/addresses - Update address
export async function PUT(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return ApiResponseBuilder.unauthorized("Authentication required");
    }

    await connectDB();

    const body = await request.json();
    const {
      id,
      type,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      isDefault,
    } = body;

    if (!id) {
      return ApiResponseBuilder.error("Address ID is required", 400);
    }

    const userDoc = await User.findById(user.id);
    if (!userDoc) {
      return ApiResponseBuilder.notFound("User not found");
    }

    const currentAddresses = userDoc.addresses || [];
    const addressIndex = currentAddresses.findIndex((addr) => addr.id === id);

    if (addressIndex === -1) {
      return ApiResponseBuilder.notFound("Address not found");
    }

    // Update address fields
    const addressToUpdate = currentAddresses[addressIndex];
    if (!addressToUpdate) {
      return ApiResponseBuilder.notFound("Address not found");
    }

    if (type !== undefined)
      addressToUpdate.type = (
        InputSanitizer.sanitizeString(type) === "billing"
          ? "billing"
          : "shipping"
      ) as "shipping" | "billing";
    if (firstName !== undefined)
      addressToUpdate.firstName = InputSanitizer.sanitizeString(firstName);
    if (lastName !== undefined)
      addressToUpdate.lastName = InputSanitizer.sanitizeString(lastName);
    if (phone !== undefined)
      addressToUpdate.phone = InputSanitizer.sanitizeString(phone);
    if (address !== undefined)
      addressToUpdate.address = InputSanitizer.sanitizeString(address);
    if (city !== undefined)
      addressToUpdate.city = InputSanitizer.sanitizeString(city);
    if (state !== undefined)
      addressToUpdate.state = InputSanitizer.sanitizeString(state);
    if (postalCode !== undefined)
      addressToUpdate.postalCode = InputSanitizer.sanitizeString(postalCode);
    if (country !== undefined)
      addressToUpdate.country = InputSanitizer.sanitizeString(country);
    if (isDefault !== undefined) {
      addressToUpdate.isDefault = Boolean(isDefault);

      // If setting as default, remove default from other addresses
      if (Boolean(isDefault)) {
        currentAddresses.forEach((addr, index) => {
          if (index !== addressIndex) {
            addr.isDefault = false;
          }
        });
      }
    }

    // Update user
    userDoc.addresses = currentAddresses;
    await userDoc.save();

    return ApiResponseBuilder.success(
      addressToUpdate,
      "Address updated successfully"
    );
  } catch (error) {
    return handleApiError(error, "Failed to update address");
  }
}

// DELETE /api/profile/addresses - Delete address
export async function DELETE(request: NextRequest) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return ApiResponseBuilder.unauthorized("Authentication required");
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("id");

    if (!addressId) {
      return ApiResponseBuilder.error("Address ID is required", 400);
    }

    const userDoc = await User.findById(user.id);
    if (!userDoc) {
      return ApiResponseBuilder.notFound("User not found");
    }

    const currentAddresses = userDoc.addresses || [];
    const addressIndex = currentAddresses.findIndex(
      (addr) => addr.id === addressId
    );

    if (addressIndex === -1) {
      return ApiResponseBuilder.notFound("Address not found");
    }

    // Remove address
    currentAddresses.splice(addressIndex, 1);

    // Update user
    userDoc.addresses = currentAddresses;
    await userDoc.save();

    return ApiResponseBuilder.success(null, "Address deleted successfully");
  } catch (error) {
    return handleApiError(error, "Failed to delete address");
  }
}
