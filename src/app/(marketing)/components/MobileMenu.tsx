"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu() {
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
      <div className={`mobile-menu${open ? " open" : ""}`} id="mobileMenu">
        <Link href="/" onClick={() => setOpen(false)}>Home</Link>
        <Link href="#pricing" onClick={() => setOpen(false)}>Pricing</Link>
        <Link href="#demo" onClick={() => setOpen(false)}>Contact</Link>
        <Link href="#faq" onClick={() => setOpen(false)}>FAQ</Link>
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
