"use client";

import { useState } from "react";

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
        <a href="/">Home</a>
        <a href="#pricing">Pricing</a>
        <a href="#demo">Contact</a>
        <a href="#faq">FAQ</a>
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
