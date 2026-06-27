"use client";
import React, { useEffect, useRef } from "react";

interface AdPlacementProps {
  slotId: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Set your Google AdSense Publisher ID here once your account is approved
// Example: "ca-pub-1234567890123456"
const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || "";

/**
 * AdPlacement — Google AdSense integration component.
 * 
 * Setup Instructions:
 * 1. Get approved for Google AdSense at https://adsense.google.com
 * 2. Add NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXX to your .env.local file
 * 3. Add the AdSense script to layout.tsx <head>:
 *    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossOrigin="anonymous"></script>
 * 4. Create ad units in your AdSense dashboard for each slotId used
 * 
 * Ad Slot IDs used across the site:
 * - "in-calc-top"     → Horizontal banner above calculator (leaderboard)  
 * - "in-calc-middle"  → Rectangle between calculator and content (300x250)
 * - "in-calc-bottom"  → Bottom of page banner
 * - "sidebar-sticky"  → Sidebar vertical ad (160x600 or 300x600)
 * - "homepage-banner" → Homepage top banner
 * - "blog-in-article" → In-article native ad for blog posts
 */
export function AdPlacement({
  slotId,
  format = "auto",
  responsive = true,
  className = "",
  style,
}: AdPlacementProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isProduction = !!ADSENSE_PUBLISHER_ID;

  useEffect(() => {
    if (!isProduction) return;
    try {
      // Push the ad to AdSense once the component mounts
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (err) {
      // Silent fail — ad blocker or AdSense not loaded yet
    }
  }, [isProduction]);

  // PRODUCTION: Render real AdSense ad unit
  if (isProduction) {
    return (
      <div className={`ad-container overflow-hidden ${className}`} style={style} aria-label="Advertisement">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", ...style }}
          data-ad-client={ADSENSE_PUBLISHER_ID}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    );
  }

  // DEVELOPMENT: Show placeholder to visualize ad space (does NOT affect CLS)
  return (
    <div
      className={`bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 flex items-center justify-center text-xs font-medium rounded ${className}`}
      style={{ minHeight: "90px", ...style }}
      aria-hidden="true"
      data-testid={`ad-placeholder-${slotId}`}
    >
      <div className="text-center py-2">
        <span className="block text-xs opacity-60">📢 Ad Space</span>
        <span className="block text-[10px] font-normal opacity-40 mt-0.5">Slot: {slotId}</span>
        <span className="block text-[10px] opacity-40">Set NEXT_PUBLIC_ADSENSE_ID to activate</span>
      </div>
    </div>
  );
}
