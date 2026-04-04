"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

/* ──────────────────────────────────────────────
   Scroll Reveal
   Observes all .reveal elements and adds .visible
   ────────────────────────────────────────────── */
export function ScrollReveal() {
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}

/* ──────────────────────────────────────────────
   Navbar scroll shadow
   ────────────────────────────────────────────── */
export function NavbarScroll() {
  useEffect(() => {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    const handler = () => {
      navbar.classList.toggle("scrolled", window.scrollY > 10);
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return null;
}

/* ──────────────────────────────────────────────
   Mobile Menu (DFY-specific, links differ)
   ────────────────────────────────────────────── */
export function DfyMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle mobile menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={`mobile-menu${open ? " open" : ""}`}>
        <Link href="/" onClick={() => setOpen(false)}>Home</Link>
        <Link href="/#pricing" onClick={() => setOpen(false)}>Pricing</Link>
        <Link href="/#demo" onClick={() => setOpen(false)}>Contact</Link>
        <Link href="/#faq" onClick={() => setOpen(false)}>FAQ</Link>
        <a
          href="https://app.inboxnavigator.com/sign-up?redirect_url=/dashboard/products"
          className="btn btn-gradient"
          style={{ textAlign: "center" }}
        >
          Get Started
        </a>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────
   Stacking cards effect
   ────────────────────────────────────────────── */
export function StackingCards() {
  useEffect(() => {
    if (window.innerWidth <= 900) return;

    const cards = Array.from(document.querySelectorAll<HTMLElement>(".pcard"));
    if (!cards.length) return;

    const steps = 20;
    const thresholds: number[] = [];
    for (let s = 0; s <= steps; s++) thresholds.push(s / steps);

    const observers: IntersectionObserver[] = [];

    cards.forEach((card, i) => {
      if (i >= cards.length - 1) return;
      const nextCard = cards[i + 1];

      const observer = new IntersectionObserver(
        (entries) => {
          const ratio = entries[0].intersectionRatio;
          const scale = 1 - ratio * 0.03;
          card.style.transform = `scale(${Math.max(scale, 0.97)})`;
        },
        { threshold: thresholds }
      );

      observer.observe(nextCard);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return null;
}

/* ──────────────────────────────────────────────
   FAQ Accordion
   ────────────────────────────────────────────── */
export function FaqAccordion({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="faq-grid">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className={`faq-item reveal${isOpen ? " open" : ""}`}>
            <button
              className="faq-question"
              aria-expanded={isOpen}
              onClick={() => toggle(i)}
            >
              {item.question}
              <span className="faq-icon">
                <svg viewBox="0 0 24 24">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
            </button>
            <div
              className="faq-answer"
              style={{ maxHeight: isOpen ? "500px" : 0 }}
            >
              <div className="faq-answer-inner">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Smooth scroll for anchor links
   ────────────────────────────────────────────── */
export function SmoothScroll() {
  useEffect(() => {
    const handler = (e: Event) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return null;
}
