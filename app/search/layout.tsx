import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Search Calculators",
  description: "Search across our 100+ professional online calculators.",
  url: "/search",
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
