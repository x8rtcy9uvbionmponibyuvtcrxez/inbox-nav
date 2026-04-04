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
        <Link href="/">Home</Link>
        <Link href="#pricing">Pricing</Link>
        <Link href="#demo">Contact</Link>
        <Link href="#faq">FAQ</Link>
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
