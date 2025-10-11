import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/shop", "/category/*", "/product/*", "/about", "/contact"],
      disallow: [
        "/api/",
        "/profile",
        "/cart",
        "/checkout",
        "/login",
        "/signup",
        "/order-success",
        "/_next/",
        "/uploads/",
        "/profile-images/",
      ],
    },
    sitemap: "https://thepremax.com/sitemap.xml",
  };
}
