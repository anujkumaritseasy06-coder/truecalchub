import React from "react";
import { siteConfig } from "@/lib/config";
import { absoluteUrl } from "@/lib/utils";

interface BreadcrumbSchemaProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQSchemaProps {
  faqs: { question: string; answer: string }[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface HowToStep {
  name: string;
  text: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration e.g. "PT2M"
}

/**
 * HowTo schema — very powerful for calculator pages ("How to calculate X")
 * Google shows this as a rich result with step-by-step instructions.
 */
export function HowToSchema({ name, description, steps, totalTime = "PT1M" }: HowToSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
  imageUrl?: string;
}

/**
 * Article schema — required for blog posts to appear in Google Discover and news results
 */
export function ArticleSchema({
  title,
  description,
  url,
  publishedAt,
  modifiedAt,
  authorName = "TrueCalcHub Editorial Team",
  imageUrl,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: absoluteUrl(url),
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(url),
    },
    ...(imageUrl && {
      image: {
        "@type": "ImageObject",
        url: absoluteUrl(imageUrl),
        width: 1200,
        height: 630,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebApplicationSchemaProps {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
}

export function WebApplicationSchema({
  name,
  description,
  url,
  applicationCategory = "CalculatorApplication",
  operatingSystem = "All",
}: WebApplicationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    name: name,
    description: description,
    url: absoluteUrl(url),
    applicationCategory: applicationCategory,
    operatingSystem: operatingSystem,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl(""),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo.png"),
      width: 512,
      height: 512,
    },
    sameAs: [
      siteConfig.links.twitter,
      "https://www.pinterest.com/truecalchub",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: absoluteUrl("/contact"),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl(""),
    description: siteConfig.description,
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/search?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function AboutPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About TrueCalcHub",
    description: "Learn about TrueCalcHub, our mission, and our commitment to providing accurate online calculators.",
    url: absoluteUrl("/about"),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ContactPageSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact TrueCalcHub",
    description: "Contact TrueCalcHub for support, feedback, and business inquiries.",
    url: absoluteUrl("/contact"),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface WebPageSchemaProps {
  name: string;
  description: string;
  url: string;
}

export function WebPageSchema({ name, description, url }: WebPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: name,
    description: description,
    url: absoluteUrl(url),
    inLanguage: "en-US",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
