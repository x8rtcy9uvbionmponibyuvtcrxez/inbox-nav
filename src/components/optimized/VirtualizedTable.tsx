"use client";

import { memo, useMemo, useCallback, useState, useEffect } from 'react';

interface VirtualizedTableProps<T> {
  items: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  rowHeight?: number;
  containerHeight?: number;
  className?: string;
  header?: React.ReactNode;
  emptyState?: React.ReactNode;
}

function VirtualizedTable<T>({
  items,
  renderRow,
  rowHeight = 60,
  containerHeight = 400,
  className = "",
  header,
  emptyState,
}: VirtualizedTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / rowHeight) + 1,
      items.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, rowHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * rowHeight;
  const offsetY = visibleRange.startIndex * rowHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  if (items.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {emptyState || <div className="text-gray-500">No items to display</div>}
      </div>
    );
  }

  return (
    <div className={`overflow-auto ${className}`} style={{ height: containerHeight }} ref={setContainerRef}>
      {header}
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.startIndex + index}
              style={{ height: rowHeight }}
            >
              {renderRow(item, visibleRange.startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(VirtualizedTable);
