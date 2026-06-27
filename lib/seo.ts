import { Metadata } from "next";
import { siteConfig } from "./config";
import { absoluteUrl } from "./utils";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  noindex?: boolean;
  publishedAt?: string;
  modifiedAt?: string;
  type?: "website" | "article";
}

export function constructMetadata({
  title,
  description,
  keywords,
  image,
  url,
  noindex = false,
  publishedAt,
  modifiedAt,
  type = "website",
}: SEOProps = {}): Metadata {
  const mergedTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const mergedDescription = description || siteConfig.description;
  const ogImage = image || siteConfig.ogImage;
  const canonicalUrl = url ? absoluteUrl(url) : absoluteUrl("");

  return {
    title: mergedTitle,
    description: mergedDescription,
    keywords: keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    verification: {
      // Bing Webmaster Tools verification (already verified per user)
      other: {
        'msvalidate.01': 'BING_VERIFICATION_TOKEN_PLACEHOLDER',
      },
    },
    openGraph: {
      title: mergedTitle,
      description: mergedDescription,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: mergedTitle,
        },
      ],
      type: type === "article" ? "article" : "website",
      ...(type === "article" && publishedAt && {
        publishedTime: publishedAt,
        modifiedTime: modifiedAt || publishedAt,
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: mergedTitle,
      description: mergedDescription,
      images: [ogImage],
      site: "@truecalchub",
      creator: "@truecalchub",
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

