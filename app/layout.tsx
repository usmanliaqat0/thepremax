import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Fashion Misst - Premium Fashion & Style",
  description:
    "Discover our curated collection of premium fashion pieces designed to elevate your wardrobe.",
  keywords: [
    "fashion",
    "clothing",
    "shirts",
    "perfumes",
    "premium fashion",
    "online shopping",
  ],
  authors: [{ name: "Fashion Misst" }],
  robots: "index, follow",
  openGraph: {
    title: "Fashion Misst - Premium Fashion & Style",
    description:
      "Discover our curated collection of premium fashion pieces designed to elevate your wardrobe.",
    type: "website",
    locale: "en_US",
    siteName: "Fashion Misst",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fashion Misst - Premium Fashion & Style",
    description:
      "Discover our curated collection of premium fashion pieces designed to elevate your wardrobe.",
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
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
