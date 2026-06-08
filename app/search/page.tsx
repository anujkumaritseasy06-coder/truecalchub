"use client";

import React, { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Breadcrumbs items={[{ name: "Search", url: "/search" }]} />
      
      <h1 className="text-4xl font-bold mb-8 text-center">Search Platform</h1>
      
      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon className="h-6 w-6 text-secondary-400" />
        </div>
        <input
          type="search"
          className="block w-full pl-12 pr-4 py-4 text-lg border border-border rounded-xl bg-background focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
          placeholder="Search calculators..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-8 text-center text-secondary-500 bg-secondary-50 dark:bg-secondary-900 py-12 rounded-xl border border-border">
        {query ? (
          <p>Search indexing architecture is ready. Integration with a static search index (e.g. Lunr/FlexSearch) will connect here.</p>
        ) : (
          <p>Enter a term to search across our 100+ calculators and guides.</p>
        )}
      </div>
    </div>
  );
}
