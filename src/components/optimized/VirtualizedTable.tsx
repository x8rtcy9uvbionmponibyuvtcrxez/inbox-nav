"use client";

import { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';

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
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Observe container size changes to keep visible window accurate
  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof window === 'undefined') return;

    const element = containerRef.current;
    let rafId: number | null = null;

    const updateSize = () => {
      // Guard against fractional sizes causing churn
      const nextHeight = Math.round(element.clientHeight);
      setMeasuredHeight((prev) => (prev !== nextHeight ? nextHeight : prev));
    };

    // Initial measure
    updateSize();

    // Use ResizeObserver when available
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(updateSize);
        })
      : null;

    resizeObserver?.observe(element);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
    };
  }, []);

  const effectiveContainerHeight = measuredHeight ?? containerHeight;

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(effectiveContainerHeight / rowHeight) + 1,
      items.length
    );
    return { startIndex, endIndex };
  }, [scrollTop, rowHeight, effectiveContainerHeight, items.length]);

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
      <div ref={containerRef} className={`flex items-center justify-center ${className}`} style={{ height: containerHeight }}>
        {emptyState || <div className="text-gray-500">No items to display</div>}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`overflow-auto ${className}`} style={{ height: containerHeight }} onScroll={handleScroll}>
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
