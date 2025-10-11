"use client";

import React from "react";
import { formatPrice } from "@/lib/currency";

interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
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
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentStatus: string;
  status: string;
}

interface InvoiceTemplateProps {
  data: InvoiceData;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ data }) => {
  return (
    <div id="invoice-template" className="bg-white p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">ThePremax</h1>
            <p className="text-gray-600">Your Premium Shopping Destination</p>
            <p className="text-sm text-gray-500 mt-2">
              Email: support@thepremax.com | Phone: +1 (555) 123-4567
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">INVOICE</h2>
            <p className="text-gray-600">#{data.orderNumber}</p>
            <p className="text-sm text-gray-500">Date: {data.orderDate}</p>
          </div>
        </div>
      </div>

      {/* Customer and Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bill To</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-900">
              {data.shippingAddress.firstName} {data.shippingAddress.lastName}
            </p>
            <p className="text-gray-700">{data.shippingAddress.address}</p>
            <p className="text-gray-700">
              {data.shippingAddress.city}, {data.shippingAddress.state}{" "}
              {data.shippingAddress.postalCode}
            </p>
            <p className="text-gray-700">{data.shippingAddress.country}</p>
            <p className="text-gray-700 mt-2">
              Phone: {data.shippingAddress.phone}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Order Details
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Status:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  data.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : data.status === "shipped"
                    ? "bg-blue-100 text-blue-800"
                    : data.status === "processing"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {data.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  data.paymentStatus === "paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {data.paymentStatus.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="text-gray-900">{data.orderDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Order Items
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                  Item
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                  Qty
                </th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                  Price
                </th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      {item.size && (
                        <p className="text-sm text-gray-600">
                          Size: {item.size}
                        </p>
                      )}
                      {item.color && (
                        <p className="text-sm text-gray-600">
                          Color: {item.color}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right text-gray-700">
                    {formatPrice(item.price)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>{formatPrice(data.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax:</span>
                <span>{formatPrice(data.tax)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Shipping:</span>
                <span>{formatPrice(data.shipping)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span>{formatPrice(data.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 text-center text-gray-600">
        <p className="mb-2">Thank you for your business!</p>
        <p className="text-sm">
          This is a computer-generated invoice. For any questions, please
          contact our support team.
        </p>
        <div className="mt-4 text-xs text-gray-500">
          <p>ThePremax - Premium Shopping Experience</p>
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
