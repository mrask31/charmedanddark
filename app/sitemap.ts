import { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { getActivePromotions, PROMOTION_ENGINE_ENABLED } from "@/lib/promotions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.charmedanddark.com";
  const products = await getProducts();

  const productUrls = products
    .filter((p: any) => !p.hidden)
    .map((product: any) => ({
      url: `${baseUrl}/shop/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  // Conditionally include /sale only when active promotions exist
  let saleUrls: MetadataRoute.Sitemap = [];
  if (PROMOTION_ENGINE_ENABLED) {
    try {
      const promos = await getActivePromotions();
      if (promos.length > 0) {
        saleUrls = [{
          url: `${baseUrl}/sale`,
          lastModified: new Date(),
          changeFrequency: "daily" as const,
          priority: 0.9,
        }];
      }
    } catch {
      // Silently skip — don't break sitemap generation
    }
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...saleUrls,
    {
      url: `${baseUrl}/drops`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/join`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sanctuary`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sanctuary/grimoire`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...productUrls,
  ];
}
