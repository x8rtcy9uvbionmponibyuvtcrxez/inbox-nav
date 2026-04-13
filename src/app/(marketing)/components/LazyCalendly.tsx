"use client";

import { useEffect, useRef, useState } from "react";

export default function LazyCalendly({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    const existing = document.querySelector(
      'script[src*="assets.calendly.com"]'
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }, [visible]);

  return (
    <div ref={ref}>
      {visible ? (
        <div
          className="calendly-inline-widget"
          data-url={url}
          style={{ minWidth: 320, height: 700 }}
        />
      ) : (
        <div style={{ minWidth: 320, height: 700 }} />
      )}
    </div>
  );
}
