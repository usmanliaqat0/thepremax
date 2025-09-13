import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ThePreMax - Premium Fashion & Style",
  description:
    "Discover ThePreMax's curated collection of premium fashion pieces designed to elevate your wardrobe.",
  keywords: [
    "fashion",
    "clothing",
    "shirts",
    "perfumes",
    "premium fashion",
    "online shopping",
    "ThePreMax",
  ],
  authors: [{ name: "ThePreMax" }],
  robots: "index, follow",
  openGraph: {
    title: "ThePreMax - Premium Fashion & Style",
    description:
      "Discover ThePreMax's curated collection of premium fashion pieces designed to elevate your wardrobe.",
    type: "website",
    locale: "en_US",
    siteName: "ThePreMax",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThePreMax - Premium Fashion & Style",
    description:
      "Discover ThePreMax's curated collection of premium fashion pieces designed to elevate your wardrobe.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "white",
                  color: "black",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
