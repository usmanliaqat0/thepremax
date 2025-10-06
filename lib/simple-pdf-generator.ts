export interface InvoiceData {
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

export const generateInvoicePDF = async (
  data: InvoiceData
): Promise<Uint8Array> => {
  // For now, let's return a simple HTML response that the browser can print as PDF
  // This is a temporary solution until we can get a proper PDF library working
  const htmlContent = generateInvoiceHTML(data);

  // Convert HTML string to Uint8Array
  const encoder = new TextEncoder();
  return encoder.encode(htmlContent);
};

const generateInvoiceHTML = (data: InvoiceData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - ${data.orderNumber}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
            .print-button { display: none !important; }
        }
        * {
            box-sizing: border-box;
        }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0; 
            padding: 0; 
            color: #1a1a1a; 
            background: #f8f9fa;
            line-height: 1.5;
            font-size: 14px;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #635bff;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
            z-index: 1000;
        }
        .print-button:hover {
            background: #5a52e8;
            transform: translateY(-1px);
        }
        .header {
            padding: 40px 40px 30px;
            border-bottom: 1px solid #e5e7eb;
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
        }
        .company-info h1 {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 8px 0;
        }
        .company-info p {
            color: #6b7280;
            margin: 0;
            font-size: 14px;
        }
        .invoice-meta {
            text-align: right;
        }
        .invoice-title {
            font-size: 32px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 8px 0;
        }
        .invoice-number {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }
        .invoice-date {
            color: #6b7280;
            font-size: 14px;
            margin: 4px 0 0 0;
        }
        .content {
            padding: 40px;
        }
        .billing-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 16px 0;
        }
        .billing-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .billing-details p {
            margin: 0 0 8px 0;
            color: #374151;
            font-size: 14px;
        }
        .billing-details p:last-child {
            margin-bottom: 0;
        }
        .billing-details strong {
            color: #1a1a1a;
            font-weight: 600;
        }
        .status-section {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        .status-item {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .status-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-delivered { 
            background: #d1fae5;
            color: #065f46;
        }
        .status-shipped { 
            background: #dbeafe;
            color: #1e40af;
        }
        .status-processing { 
            background: #fef3c7;
            color: #92400e;
        }
        .status-pending { 
            background: #f3f4f6;
            color: #374151;
        }
        .status-paid { 
            background: #d1fae5;
            color: #065f46;
        }
        .status-unpaid { 
            background: #fee2e2;
            color: #dc2626;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        .items-table th {
            background: #f8f9fa;
            color: #374151;
            font-weight: 600;
            padding: 16px 20px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e5e7eb;
        }
        .items-table td {
            padding: 20px;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: top;
        }
        .items-table tr:last-child td {
            border-bottom: none;
        }
        .item-name {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 4px;
            font-size: 14px;
        }
        .item-details {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
        }
        .totals-table {
            width: 300px;
            border-collapse: collapse;
        }
        .totals-table td {
            padding: 8px 0;
            font-size: 14px;
        }
        .totals-table .total-label {
            color: #6b7280;
            text-align: left;
        }
        .totals-table .total-value {
            color: #1a1a1a;
            text-align: right;
            font-weight: 500;
        }
        .totals-table .total-row {
            border-top: 2px solid #e5e7eb;
            padding-top: 12px;
            margin-top: 8px;
        }
        .totals-table .total-row .total-label {
            font-weight: 700;
            font-size: 16px;
            color: #1a1a1a;
        }
        .totals-table .total-row .total-value {
            font-weight: 700;
            font-size: 16px;
            color: #1a1a1a;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
        }
        .footer h3 {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 8px 0;
        }
        .footer p {
            color: #6b7280;
            margin: 0 0 16px 0;
            font-size: 14px;
        }
        .footer p:last-child {
            margin-bottom: 0;
        }
        .company-footer {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 20px;
        }
        @media (max-width: 768px) {
            .billing-section {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            .content, .header {
                padding: 20px;
            }
            .status-section {
                flex-direction: column;
                gap: 16px;
            }
            .totals-section {
                justify-content: stretch;
            }
            .totals-table {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">
        Print Invoice
    </button>
    
    <div class="invoice-container">
        <div class="header">
            <div class="header-top">
                <div class="company-info">
                    <h1>ThePremax</h1>
                    <p>Premium Shopping Experience</p>
                </div>
                <div class="invoice-meta">
                    <h2 class="invoice-title">Invoice</h2>
                    <p class="invoice-number">#${data.orderNumber}</p>
                    <p class="invoice-date">${data.orderDate}</p>
                </div>
            </div>
        </div>

        <div class="content">
            <div class="billing-section">
                <div>
                    <h3 class="section-title">Bill to</h3>
                    <div class="billing-details">
                        <p><strong>${data.customerName}</strong></p>
                        <p>${data.shippingAddress.address}</p>
                        <p>${data.shippingAddress.city}, ${
    data.shippingAddress.state
  } ${data.shippingAddress.postalCode}</p>
                        <p>${data.shippingAddress.country}</p>
                        <p>${data.shippingAddress.phone}</p>
                    </div>
                </div>
                
                <div>
                    <h3 class="section-title">Status</h3>
                    <div class="status-section">
                        <div class="status-item">
                            <span class="status-label">Order Status</span>
                            <span class="status-badge status-${
                              data.status
                            }">${data.status.toUpperCase()}</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Payment Status</span>
                            <span class="status-badge status-${
                              data.paymentStatus
                            }">${data.paymentStatus.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-center">Qty</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items
                      .map(
                        (item) => `
                        <tr>
                            <td>
                                <div class="item-name">${item.name}</div>
                                ${
                                  item.size
                                    ? `<div class="item-details">Size: ${item.size}</div>`
                                    : ""
                                }
                                ${
                                  item.color
                                    ? `<div class="item-details">Color: ${item.color}</div>`
                                    : ""
                                }
                            </td>
                            <td class="text-center">${item.quantity}</td>
                            <td class="text-right">$${item.price.toFixed(
                              2
                            )}</td>
                            <td class="text-right">$${(
                              item.price * item.quantity
                            ).toFixed(2)}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>

            <div class="totals-section">
                <table class="totals-table">
                    <tr>
                        <td class="total-label">Subtotal</td>
                        <td class="total-value">$${data.subtotal.toFixed(
                          2
                        )}</td>
                    </tr>
                    <tr>
                        <td class="total-label">Tax</td>
                        <td class="total-value">$${data.tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="total-label">Shipping</td>
                        <td class="total-value">$${data.shipping.toFixed(
                          2
                        )}</td>
                    </tr>
                    <tr class="total-row">
                        <td class="total-label">Total</td>
                        <td class="total-value">$${data.total.toFixed(2)}</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="footer">
            <h3>Thank you for your business!</h3>
            <p>If you have any questions about this invoice, please contact our support team.</p>
            <div class="company-footer">
                <p><strong>ThePremax</strong> - Premium Shopping Experience</p>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};
