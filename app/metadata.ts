import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ThePreMax - Everything You Need, All in One Place",
  description:
    "Discover premium products across Health & Beauty, Sports & Recreation, Tools & Equipment, and Automotive. Quality products from trusted suppliers with fast USA shipping.",
  keywords:
    "online shopping, health beauty, sports equipment, tools, automotive parts, premium products, fast shipping",
  openGraph: {
    title: "ThePreMax - Everything You Need, All in One Place",
    description:
      "Discover premium products across Health & Beauty, Sports & Recreation, Tools & Equipment, and Automotive. Quality products from trusted suppliers with fast USA shipping.",
    type: "website",
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
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThePreMax - Everything You Need, All in One Place",
    description:
      "Discover premium products across Health & Beauty, Sports & Recreation, Tools & Equipment, and Automotive.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: "https://thepremax.com",
  },
};
