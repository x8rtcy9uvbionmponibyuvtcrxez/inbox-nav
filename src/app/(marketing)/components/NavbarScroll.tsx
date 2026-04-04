"use client";

import { useEffect } from "react";

export default function NavbarScroll() {
  useEffect(() => {
    const handler = () => {
      document
        .getElementById("navbar")
        ?.classList.toggle("scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return null;
}
