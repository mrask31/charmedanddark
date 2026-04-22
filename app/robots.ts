import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/google-feed"],
      disallow: ["/api/", "/sanctuary/grimoire"],
    },
    sitemap: "https://charmedanddark.com/sitemap.xml",
  };
}
