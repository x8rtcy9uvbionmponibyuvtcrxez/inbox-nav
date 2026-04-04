"use client";

import { useState } from "react";

export default function BannerBar() {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="banner" id="banner">
      <div className="banner-track">
        <span>One-stop shop for all your inbox needs, we have it all.</span>
        <span>One-stop shop for all your inbox needs, we have it all.</span>
        <span>One-stop shop for all your inbox needs, we have it all.</span>
        <span>One-stop shop for all your inbox needs, we have it all.</span>
      </div>
      <button className="banner-close" onClick={() => setHidden(true)}>
        &times;
      </button>
    </div>
  );
}
