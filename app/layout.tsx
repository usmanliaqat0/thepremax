import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Application initialization is now handled in next.config.ts
// This ensures proper initialization during the Next.js build process

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thepremax.com"),
  title: {
    default: "ThePreMax - Everything You Need, All in One Place",
    template: "%s | ThePreMax",
  },
  description:
    "Discover premium products across Health & Beauty, Sports & Recreation, Tools & Equipment, and Automotive. Quality products from trusted suppliers with fast USA shipping.",
  keywords: [
    "online shopping",
    "health and beauty",
    "sports equipment",
    "tools and equipment",
    "automotive parts",
    "premium products",
    "ThePreMax",
    "fast shipping",
    "quality assured",
    "multi-category marketplace",
  ],
  authors: [{ name: "ThePreMax", url: "https://thepremax.com" }],
  creator: "ThePreMax",
  publisher: "ThePreMax",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "ThePreMax - Everything You Need, All in One Place",
    description:
      "Discover premium products across Health & Beauty, Sports & Recreation, Tools & Equipment, and Automotive. Quality products from trusted suppliers with fast USA shipping.",
    type: "website",
    locale: "en_US",
    url: "https://thepremax.com",
    siteName: "ThePreMax",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ThePreMax - Premium Multi-Category Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ThePreMax - Everything You Need, All in One Place",
    description:
      "Discover premium products across Health & Beauty, Sports & Recreation, Tools & Equipment, and Automotive. Quality products from trusted suppliers with fast USA shipping.",
    images: ["/logo.png"],
    creator: "@ThePreMax",
  },
  alternates: {
    canonical: "https://thepremax.com",
  },
  category: "shopping",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ThePreMax" />
        <meta name="application-name" content="ThePreMax" />
        <meta name="msapplication-TileColor" content="#0F172A" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
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
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
