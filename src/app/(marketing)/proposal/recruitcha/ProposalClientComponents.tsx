"use client";

import { useEffect, useRef, useState } from "react";

/* ════════════════════════════════════════════════════
   ScrollReveal — triggers .visible on .reveal elements
   ════════════════════════════════════════════════════ */

export function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal, .reveal-scale").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}

/* ════════════════════════════════════════════════════
   SmoothScroll — smooth anchor link scrolling
   ════════════════════════════════════════════════════ */

export function SmoothScroll() {
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute("href")!.slice(1);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);
  return null;
}

/* ════════════════════════════════════════════════════
   AnimatedCounter — counts up when scrolled into view
   ════════════════════════════════════════════════════ */

export function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(decimals > 0 ? "0." + "0".repeat(decimals) : "0");
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    if (!ref.current || done.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || done.current) return;
        done.current = true;
        const start = performance.now();

        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = eased * target;

          setDisplay(
            decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString()
          );

          if (t < 1) requestAnimationFrame(tick);
          else setDisplay(decimals > 0 ? target.toFixed(decimals) : target.toLocaleString());
        };

        requestAnimationFrame(tick);
        observer.unobserve(entries[0].target);
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return (
    <span ref={ref} className="animated-counter">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/* ════════════════════════════════════════════════════
   DonutChart — animated SVG donut with segments
   ════════════════════════════════════════════════════ */

export function DonutChart({
  segments,
  size = 260,
  strokeWidth = 28,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setAnimated(true), 300);
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  let cumulative = 0;

  return (
    <div ref={ref} className="donut-chart-wrapper" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(236,232,240,0.3)"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          const segLen = (seg.value / total) * circumference;
          const gap = 6;
          const dash = `${Math.max(segLen - gap, 0)} ${circumference - segLen + gap}`;
          const offset = -cumulative;
          cumulative += segLen;

          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={animated ? dash : `0 ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{
                transition: `stroke-dasharray 1.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.4}s`,
                filter: `drop-shadow(0 0 8px ${seg.color}40)`,
              }}
            />
          );
        })}
      </svg>
      <div className="donut-center">
        <div className="donut-center-value">70/30</div>
        <div className="donut-center-label">Split</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   InboxGrid — visual grid of dots representing inboxes
   ════════════════════════════════════════════════════ */

export function InboxGrid({
  google = 140,
  outlook = 5,
}: {
  google?: number;
  outlook?: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="inbox-grid">
      <div className="inbox-grid-section">
        <span className="inbox-grid-label">
          Google Workspace — {google} inboxes
        </span>
        <div className="inbox-dots">
          {Array.from({ length: google }).map((_, i) => (
            <div
              key={`g-${i}`}
              className={`inbox-dot google ${visible ? "pop" : ""}`}
              style={{ animationDelay: `${i * 12}ms` }}
            />
          ))}
        </div>
      </div>
      <div className="inbox-grid-section">
        <span className="inbox-grid-label">
          Outlook — {outlook} domains
        </span>
        <div className="inbox-dots outlook-dots">
          {Array.from({ length: outlook }).map((_, i) => (
            <div
              key={`o-${i}`}
              className={`inbox-dot outlook ${visible ? "pop" : ""}`}
              style={{ animationDelay: `${google * 12 + i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   FloatingOrbs — decorative background orbs
   ════════════════════════════════════════════════════ */

export function FloatingOrbs() {
  return (
    <div className="floating-orbs" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

/* ════════════════════════════════════════════════════
   TimelineAnimator — draws the timeline line on scroll
   ════════════════════════════════════════════════════ */

export function TimelineAnimator() {
  useEffect(() => {
    const line = document.querySelector(".timeline-line-fill");
    const steps = document.querySelectorAll(".timeline-step");
    if (!line || !steps.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            line.classList.add("visible");
            steps.forEach((step, i) => {
              setTimeout(() => step.classList.add("active"), i * 400);
            });
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(line.parentElement!);
    return () => observer.disconnect();
  }, []);

  return null;
}

/* ════════════════════════════════════════════════════
   AnimatedBar — horizontal bar that fills on scroll
   ════════════════════════════════════════════════════ */

export function AnimatedBar({
  value,
  max,
  color,
  label,
  valueLabel,
}: {
  value: number;
  max: number;
  color: "google" | "outlook";
  label: string;
  valueLabel: string;
}) {
  const [filled, setFilled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTimeout(() => setFilled(true), 200);
          observer.unobserve(entries[0].target);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const pct = (value / max) * 100;

  return (
    <div ref={ref} className="volume-bar-wrapper">
      <div className="volume-bar-header">
        <span className="volume-bar-label">{label}</span>
        <span className="volume-bar-value">{valueLabel}</span>
      </div>
      <div className="volume-bar-track">
        <div
          className={`volume-bar-fill ${color}`}
          style={{ width: filled ? `${pct}%` : "0%" }}
        />
      </div>
    </div>
  );
}
