import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

export const generateInvoicePDF = async (data: InvoiceData): Promise<Blob> => {
  // Create a temporary container for the invoice
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.top = "0";
  tempContainer.style.width = "800px";
  tempContainer.style.backgroundColor = "white";
  tempContainer.style.padding = "20px";
  document.body.appendChild(tempContainer);

  try {
    // Generate the invoice HTML
    const invoiceHTML = generateInvoiceHTML(data);
    tempContainer.innerHTML = invoiceHTML;

    // Wait for any images to load
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Convert to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: 800,
      height: tempContainer.scrollHeight,
    });

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Convert to blob
    const pdfBlob = pdf.output("blob");
    return pdfBlob;
  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
  }
};

const generateInvoiceHTML = (data: InvoiceData): string => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 800px; margin: 0 auto; background: white;">
      <!-- Header -->
      <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 24px; margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="font-size: 28px; font-weight: bold; color: #2563eb; margin: 0 0 8px 0;">ThePremax</h1>
            <p style="color: #6b7280; margin: 0;">Your Premium Shopping Destination</p>
            <p style="font-size: 14px; color: #9ca3af; margin: 8px 0 0 0;">
              Email: support@thepremax.com | Phone: +1 (555) 123-4567
            </p>
          </div>
          <div style="text-align: right;">
            <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0;">INVOICE</h2>
            <p style="color: #6b7280; margin: 0;">#${data.orderNumber}</p>
            <p style="font-size: 14px; color: #9ca3af; margin: 0;">Date: ${
              data.orderDate
            }</p>
          </div>
        </div>
      </div>

      <!-- Customer and Order Info -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;">
        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Bill To</h3>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
            <p style="font-weight: 500; color: #111827; margin: 0 0 4px 0;">
              ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}
            </p>
            <p style="color: #374151; margin: 0 0 4px 0;">${
              data.shippingAddress.address
            }</p>
            <p style="color: #374151; margin: 0 0 4px 0;">
              ${data.shippingAddress.city}, ${data.shippingAddress.state} ${
    data.shippingAddress.postalCode
  }
            </p>
            <p style="color: #374151; margin: 0 0 8px 0;">${
              data.shippingAddress.country
            }</p>
            <p style="color: #374151; margin: 0;">Phone: ${
              data.shippingAddress.phone
            }</p>
          </div>
        </div>

        <div>
          <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Order Details</h3>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Order Status:</span>
              <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background: ${
                data.status === "delivered"
                  ? "#dcfce7"
                  : data.status === "shipped"
                  ? "#dbeafe"
                  : data.status === "processing"
                  ? "#fef3c7"
                  : "#f3f4f6"
              }; color: ${
    data.status === "delivered"
      ? "#166534"
      : data.status === "shipped"
      ? "#1e40af"
      : data.status === "processing"
      ? "#92400e"
      : "#374151"
  };">${data.status.toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Payment Status:</span>
              <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background: ${
                data.paymentStatus === "paid" ? "#dcfce7" : "#fee2e2"
              }; color: ${
    data.paymentStatus === "paid" ? "#166534" : "#dc2626"
  };">${data.paymentStatus.toUpperCase()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Order Date:</span>
              <span style="color: #111827;">${data.orderDate}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: left; font-weight: 600; color: #374151;">Item</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: center; font-weight: 600; color: #374151;">Qty</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right; font-weight: 600; color: #374151;">Price</th>
              <th style="border: 1px solid #d1d5db; padding: 12px; text-align: right; font-weight: 600; color: #374151;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items
              .map(
                (item) => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 12px;">
                  <div>
                    <p style="font-weight: 500; color: #111827; margin: 0 0 4px 0;">${
                      item.name
                    }</p>
                    ${
                      item.size
                        ? `<p style="font-size: 14px; color: #6b7280; margin: 0 0 2px 0;">Size: ${item.size}</p>`
                        : ""
                    }
                    ${
                      item.color
                        ? `<p style="font-size: 14px; color: #6b7280; margin: 0;">Color: ${item.color}</p>`
                        : ""
                    }
                  </div>
                </td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: center; color: #374151;">${
                  item.quantity
                }</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right; color: #374151;">$${item.price.toFixed(
                  2
                )}</td>
                <td style="border: 1px solid #d1d5db; padding: 12px; text-align: right; font-weight: 500; color: #111827;">$${(
                  item.price * item.quantity
                ).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
        <div style="width: 320px;">
          <div style="background: #f9fafb; padding: 24px; border-radius: 8px;">
            <div style="margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; color: #374151; margin-bottom: 8px;">
                <span>Subtotal:</span>
                <span>$${data.subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #374151; margin-bottom: 8px;">
                <span>Tax:</span>
                <span>$${data.tax.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #374151; margin-bottom: 12px;">
                <span>Shipping:</span>
                <span>$${data.shipping.toFixed(2)}</span>
              </div>
              <div style="border-top: 1px solid #d1d5db; padding-top: 12px;">
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #111827;">
                  <span>Total:</span>
                  <span>$${data.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center; color: #6b7280;">
        <p style="margin: 0 0 8px 0;">Thank you for your business!</p>
        <p style="font-size: 14px; margin: 0 0 16px 0;">
          This is a computer-generated invoice. For any questions, please contact our support team.
        </p>
        <div style="font-size: 12px; color: #9ca3af;">
          <p style="margin: 0 0 4px 0;">ThePremax - Premium Shopping Experience</p>
          <p style="margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  `;
};
