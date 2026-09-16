import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === 'preview') {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/google-feed"],
      disallow: ["/api/"],
    },
    sitemap: "https://www.charmedanddark.com/sitemap.xml",
  };
}
