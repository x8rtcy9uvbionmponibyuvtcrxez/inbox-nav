"use client";

import { useIntercom } from "react-use-intercom";

export default function IntercomLauncher() {
  const { show } = useIntercom();

  const handleClick = () => {
    try {
      show();
    } catch (error) {
      console.error("Failed to open Intercom widget", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1c5cff] via-[#306bff] to-[#6a8eff] text-white shadow-[0_15px_40px_-20px_rgba(27,85,255,0.8)] transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#1c5cff]/40"
      aria-label="Chat with support"
    >
      {/* Simple chat bubble icon */}
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 3C6.486 3 2 6.943 2 11.5c0 2.446 1.177 4.655 3.111 6.201-.112.9-.53 2.428-1.557 3.728a.75.75 0 0 0 .794 1.18c2.57-.58 4.504-1.7 5.58-2.443A11.52 11.52 0 0 0 12 20c5.514 0 10-3.943 10-8.5S17.514 3 12 3Z" />
      </svg>
    </button>
  );
}
