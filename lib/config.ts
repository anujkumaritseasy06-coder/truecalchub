export const siteConfig = {
  name: "TrueCalcHub",
  description: "Accurate Online Calculators for Everyday Decisions",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.truecalchub.com",
  ogImage: "https://www.truecalchub.com/logo.png",
  links: {
    twitter: "https://twitter.com/truecalchub",
  },
  authors: [
    {
      name: "Calculator Experts",
      url: "https://truecalchub.com",
    }
  ],
  creator: "TrueCalcHub",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export type SiteConfig = typeof siteConfig;
