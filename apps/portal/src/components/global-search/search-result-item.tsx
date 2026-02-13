'use client';

import React from 'react';
import { SearchResult } from '@/types/search';
import { ENTITY_TYPE_CONFIG } from '@/types/search';

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  isActive: boolean;
  isTopResult?: boolean;
  onClick: () => void;
}

/**
 * Highlights matching query terms in text
 * Returns React nodes with <mark> tags around matches
 */
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) {
    return text;
  }

  // Case-insensitive search for query in text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return (
        <mark key={index} className="bg-warning/30 text-inherit font-semibold">
          {part}
        </mark>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function SearchResultItem({
  result,
  query,
  isActive,
  isTopResult,
  onClick,
}: SearchResultItemProps) {
  const config = ENTITY_TYPE_CONFIG[result.entity_type];

  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors
        hover:bg-base-200
        ${isActive ? 'bg-base-200' : ''}
      `}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking
    >
      {/* Entity type icon */}
      <div className="shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <i className={`fa-duotone fa-regular ${config.icon} text-sm text-primary`}></i>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title with highlighted matches */}
        <div className="text-sm font-medium truncate">
          {highlightMatch(result.title, query)}
        </div>
        {/* Subtitle */}
        {result.subtitle && (
          <div className="text-xs text-base-content/60 truncate">
            {result.subtitle}
          </div>
        )}
      </div>

      {/* Top result Enter hint */}
      {isTopResult && (
        <div className="shrink-0">
          <kbd className="kbd kbd-xs opacity-50">Enter</kbd>
        </div>
      )}
    </div>
  );
}
