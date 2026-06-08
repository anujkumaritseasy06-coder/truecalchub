import { Metadata } from "next";
import { siteConfig } from "./config";
import { absoluteUrl } from "./utils";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  noindex?: boolean;
}

export function constructMetadata({
  title,
  description,
  image,
  url,
  noindex = false,
}: SEOProps = {}): Metadata {
  const mergedTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const mergedDescription = description || siteConfig.description;
  const ogImage = image || siteConfig.ogImage;
  const canonicalUrl = url ? absoluteUrl(url) : absoluteUrl("");

  return {
    title: mergedTitle,
    description: mergedDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: mergedTitle,
      description: mergedDescription,
      url: canonicalUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: mergedTitle,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: mergedTitle,
      description: mergedDescription,
      images: [ogImage],
      creator: siteConfig.links.twitter,
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
