'use client';

import React from 'react';

interface MarkdownViewProps {
  content?: string;
  className?: string;
}

export function MarkdownView({ content, className = '' }: MarkdownViewProps) {
  if (!content) return null;

  // Split lines and parse blocks cleanly
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="space-y-1.5 my-2.5 pl-2">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-2 text-xs text-gray-700 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3E2D68] mt-1.5 shrink-0" />
              <span>{formatInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const formatInline = (text: string): React.ReactNode[] => {
    // Parse **bold**, `code`, and $math$
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|`[^`]+`|\$[^$]+\$)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const val = match[0];
      if (val.startsWith('**') && val.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-gray-900">
            {val.slice(2, -2)}
          </strong>
        );
      } else if (val.startsWith('`') && val.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded-md bg-purple-100/70 text-[#3E2D68] font-mono text-[11px]"
          >
            {val.slice(1, -1)}
          </code>
        );
      } else if (val.startsWith('$') && val.endsWith('$')) {
        parts.push(
          <span
            key={match.index}
            className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 font-mono text-[11px] font-semibold border border-amber-200/60"
          >
            {val.slice(1, -1)}
          </span>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(index);
      return;
    }

    // Heading 1
    if (trimmed.startsWith('# ')) {
      flushList(index);
      elements.push(
        <h2
          key={index}
          className="text-base font-black text-gray-900 mt-4 mb-2 pb-1 border-b border-gray-100 flex items-center space-x-2"
        >
          <span className="w-2 h-2 rounded-full bg-[#3E2D68]" />
          <span>{trimmed.substring(2)}</span>
        </h2>
      );
      return;
    }

    // Heading 2
    if (trimmed.startsWith('## ')) {
      flushList(index);
      elements.push(
        <h3
          key={index}
          className="text-sm font-bold text-[#3E2D68] mt-3.5 mb-1.5 flex items-center space-x-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" />
          <span>{trimmed.substring(3)}</span>
        </h3>
      );
      return;
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      flushList(index);
      elements.push(
        <h4 key={index} className="text-xs font-bold text-gray-800 mt-2.5 mb-1">
          {trimmed.substring(4)}
        </h4>
      );
      return;
    }

    // Unordered List item
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.substring(2));
      return;
    }

    // Ordered list item (e.g. "1. ")
    if (/^\d+\.\s/.test(trimmed)) {
      flushList(index);
      const contentText = trimmed.replace(/^\d+\.\s/, '');
      elements.push(
        <div key={index} className="flex items-start space-x-2 my-1 text-xs text-gray-700">
          <span className="w-5 h-5 rounded-full bg-purple-100 text-[#3E2D68] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
            {trimmed.match(/^\d+/)?.[0]}
          </span>
          <span className="leading-relaxed">{formatInline(contentText)}</span>
        </div>
      );
      return;
    }

    // Regular paragraph
    flushList(index);
    elements.push(
      <p key={index} className="text-xs text-gray-700 leading-relaxed my-1.5">
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList(lines.length);

  return (
    <div className={`space-y-1 p-5 bg-gradient-to-b from-gray-50/80 to-purple-50/20 rounded-2xl border border-gray-100 ${className}`}>
      {elements}
    </div>
  );
}

