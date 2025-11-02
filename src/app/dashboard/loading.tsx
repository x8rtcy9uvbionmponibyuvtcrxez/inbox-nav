"use client";

import Image from "next/image";
import { useMemo } from "react";

const loadingMessages = [
  "Syncing your inbox fleet",
  "Calibrating domain warmup",
  "Queuing deliverability insights",
];

export default function DashboardLoading() {
  const message = useMemo(
    () => loadingMessages[Math.floor(Math.random() * loadingMessages.length)],
    []
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#06030F] via-[#0F1A32] to-[#1B0F26] px-6 text-white">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inline-flex h-24 w-24 rounded-full bg-gradient-to-tr from-[#2B0AFF] via-[#FF5B8A] to-[#FBA64B] opacity-40 blur-lg"></span>
        <span className="absolute inline-flex h-20 w-20 animate-spin rounded-full border-2 border-white/10 border-t-[#FF5B8A]/80 border-r-[#FBA64B]/70"></span>
        <span className="absolute inline-flex h-20 w-20 animate-[ping_2s_linear_infinite] rounded-full border border-white/10"></span>
        <Image
          src="/favicon.svg"
          alt="Inbox Navigator mark"
          width={64}
          height={64}
          className="relative drop-shadow-[0_8px_24px_rgba(255,91,138,0.35)]"
          priority
        />
      </div>

      <div className="mt-10 text-center">
        <p className="text-xl font-semibold leading-tight md:text-2xl">
          Setting up your workspace
        </p>
        <p className="mt-3 text-sm text-white/60 md:text-base">
          {message} so everything’s ready the moment you land.
        </p>
      </div>

      <div className="mt-10 flex w-full max-w-xs flex-col items-center space-y-3">
        <div className="flex w-full items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
          <span>Preparing</span>
          <span>Dashboard</span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div className="absolute inset-0 animate-[pulse_1.8s_ease-in-out_infinite] bg-gradient-to-r from-[#2B0AFF] via-[#FF5B8A] to-[#FBA64B]"></div>
        </div>
      </div>
    </div>
  );
}
