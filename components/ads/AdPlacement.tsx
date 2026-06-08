import React from "react";

interface AdPlacementProps {
  slotId: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
}

/**
 * Placeholder component for Google AdSense or other ad networks.
 * Prepared for scalability: drops directly into the layout without shifting layout (prevents CLS).
 */
export function AdPlacement({
  slotId,
  format = "auto",
  responsive = true,
  className = "",
}: AdPlacementProps) {
  // In production, this would render the actual <ins> tag with Google AdSense client info
  // For development, we render a placeholder block to visualize placements and reserve space.
  
  return (
    <div 
      className={`bg-secondary-100 border border-secondary-200 text-secondary-500 flex items-center justify-center text-sm font-medium p-4 ${className}`}
      aria-hidden="true"
    >
      <div className="text-center">
        <span className="block">Advertisement</span>
        <span className="block text-xs font-normal opacity-70">Slot: {slotId}</span>
      </div>
    </div>
  );
}
