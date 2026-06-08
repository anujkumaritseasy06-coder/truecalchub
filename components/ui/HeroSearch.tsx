"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface SearchableCalculator {
  title: string;
  description: string;
  url: string;
}

interface HeroSearchProps {
  calculators: SearchableCalculator[];
}

export function HeroSearch({ calculators }: HeroSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchableCalculator[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter calculators when query changes
  useEffect(() => {
    if (query.trim().length > 0) {
      const lowerQuery = query.toLowerCase();
      const filtered = calculators.filter(
        (calc) =>
          calc.title.toLowerCase().includes(lowerQuery) ||
          calc.description.toLowerCase().includes(lowerQuery)
      ).slice(0, 5); // Show max 5 suggestions
      setSuggestions(filtered);
      setSelectedIndex(-1); // Reset selection on new query
    } else {
      setSuggestions([]);
    }
  }, [query, calculators]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isFocused || query.trim().length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        router.push(suggestions[selectedIndex].url);
        setIsFocused(false);
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setIsFocused(false);
      }
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const showDropdown = isFocused && query.trim().length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 transition-all duration-300" ref={dropdownRef}>
      <form onSubmit={handleSubmit} role="search">
        <div className="relative flex items-center w-full h-16 rounded-2xl focus-within:ring-2 focus-within:ring-primary-500 bg-background border border-border shadow-md overflow-hidden transition-all">
          <div className="grid place-items-center h-full w-14 text-secondary-400">
            <Search className="h-6 w-6" />
          </div>
          <input
            ref={inputRef}
            className="peer h-full w-full outline-none text-base md:text-lg text-foreground pr-4 bg-transparent"
            type="text"
            id="q"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search calculators (e.g., Mortgage, Concrete)..."
            required
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="search-suggestions"
            aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
          />
          <button 
            type="submit" 
            className="h-full px-8 bg-primary-600 text-white font-bold text-lg hover:bg-primary-700 transition-colors"
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </form>

      {/* Normal Flow Dropdown - Pushes content down */}
      {showDropdown && (
        <div 
          id="search-suggestions"
          role="listbox"
          className="mt-4 bg-background border border-border rounded-xl shadow-lg overflow-y-auto max-h-[60vh] text-left z-20 relative"
        >
          {suggestions.length > 0 ? (
            <ul className="py-2">
              {suggestions.map((calc, index) => (
                <li 
                  key={index} 
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={selectedIndex === index}
                  className={`border-b border-border/50 last:border-0 ${selectedIndex === index ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}
                >
                  <Link 
                    href={calc.url}
                    className="block px-6 py-4 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors"
                    onClick={() => setIsFocused(false)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="font-bold text-foreground text-base mb-1">{calc.title}</div>
                    <div className="text-sm text-secondary-500 line-clamp-1">{calc.description}</div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-6 text-center text-secondary-500">
              No calculators found matching "{query}". <br/>
              <span className="text-sm mt-2 inline-block">Press enter to search the full site.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
