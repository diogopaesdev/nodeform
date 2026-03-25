import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://surveyflow.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/terms", "/privacy", "/survey/", "/surveys/"],
        disallow: [
          "/dashboard/",
          "/editor/",
          "/api/",
          "/login",
          "/onboarding",
          "/upgrade",
        ],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
