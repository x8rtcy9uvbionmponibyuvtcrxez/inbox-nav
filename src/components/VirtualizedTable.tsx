"use client";

import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedTableProps<T> {
  items: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  rowHeight?: number;
  containerHeight?: number;
  className?: string;
  header?: React.ReactNode;
  emptyState?: React.ReactNode;
}

export function VirtualizedTable<T>({
  items,
  renderRow,
  rowHeight = 60,
  containerHeight = 400,
  className = "",
  header,
  emptyState,
}: VirtualizedTableProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const totalSize = virtualizer.getTotalSize();

  if (items.length === 0) {
    return (
      <div className={`${className}`}>
        {header}
        <div className="flex items-center justify-center h-32 text-gray-400">
          {emptyState || <p>No items found</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {header}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: containerHeight }}
      >
        <div
          style={{
            height: `${totalSize}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderRow(items[virtualItem.index], virtualItem.index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
