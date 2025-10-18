import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order, { IOrder } from "@/lib/models/Order";
import { authMiddleware } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/error-handler";
import { generateInvoicePDF, InvoiceData } from "@/lib/simple-pdf-generator";
import mongoose from "mongoose";

interface PopulatedOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/orders/[id]/invoice - Download invoice for order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authMiddleware(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    // Find order (without populate to avoid schema issues)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = (await (Order as mongoose.Model<IOrder>)
      .findById(id)
      .lean()) as unknown as PopulatedOrder;

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    // Check if user is admin or order owner
    // Since we're not populating, userId will be a string
    const orderUserId = order.userId?.toString();

    if (user.role !== "admin" && orderUserId && orderUserId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied",
        },
        { status: 403 }
      );
    }

    const invoiceData: InvoiceData = {
      orderNumber: order.orderNumber,
      orderDate: new Date(order.createdAt).toLocaleDateString(),
      customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      customerEmail: order.shippingAddress.phone, // Using phone as contact
      shippingAddress: order.shippingAddress,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      paymentStatus: order.paymentStatus,
      status: order.status,
    };

    // Generate HTML invoice (temporary solution)
    const htmlContent = await generateInvoicePDF(invoiceData);
    const htmlString = new TextDecoder().decode(htmlContent);

    const response = new NextResponse(htmlString, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${order.orderNumber}.html"`,
      },
    });

    return response;
  } catch (error) {
    console.error("Invoice generation error:", error);
    return handleApiError(error, "Failed to generate invoice");
  }
}
