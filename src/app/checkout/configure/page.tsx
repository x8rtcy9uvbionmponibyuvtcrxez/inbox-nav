"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ErrorBoundary from "@/components/ErrorBoundary";

type ProductType = "RESELLER" | "EDU" | "LEGACY" | "PREWARMED" | "AWS" | "MICROSOFT";
type DomainSource = "OWN" | "BUY_FOR_ME";
type TLD = ".com" | ".info";

function normalizeProductType(value: string | null): ProductType {
  const v = (value || "RESELLER").toUpperCase();
  return ["RESELLER", "EDU", "LEGACY", "PREWARMED", "AWS", "MICROSOFT"].includes(v) ? (v as ProductType) : "RESELLER";
}

function getDefaultInboxesPerDomain(product: ProductType): number {
  if (product === "RESELLER") return 3;
  if (product === "EDU") return 3;
  if (product === "LEGACY") return 3;
  if (product === "AWS") return 3;
  if (product === "MICROSOFT") return 50;
  return 3; // PREWARMED fixed
}

function getPricePerInbox(product: ProductType): number {
  if (product === "RESELLER") return 3;
  if (product === "EDU") return 1.5;
  if (product === "LEGACY") return 2.5;
  if (product === "PREWARMED") return 7;
  if (product === "AWS") return 1.25;
  if (product === "MICROSOFT") return 60; // Per domain, not per inbox
  return 3;
}

function ConfigurePageContent() {
  const router = useRouter();
  const params = useSearchParams();

  const product = normalizeProductType(params.get("product"));
  const quantity = Math.max(1, parseInt(params.get("qty") || "10", 10) || 10);

  // PREWARMED skips configuration entirely per requirements
  useEffect(() => {
    if (product === "PREWARMED") {
      router.replace("/dashboard/products");
    }
  }, [product, router]);

  const [inboxesPerDomain, setInboxesPerDomain] = useState<number>(getDefaultInboxesPerDomain(product));
  const [domainSource, setDomainSource] = useState<DomainSource>("OWN");
  const [domainTLD, setDomainTLD] = useState<TLD>(".com");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInboxesPerDomain(getDefaultInboxesPerDomain(product));
    setDomainSource("OWN");
    setDomainTLD(".com");
  }, [product]);

  const domainsNeeded = useMemo(() => {
    const perDomain = product === "RESELLER" ? Math.max(1, Math.min(3, inboxesPerDomain || 3)) : 
                     product === "EDU" ? Math.max(1, Math.min(3, inboxesPerDomain || 3)) :
                     product === "LEGACY" ? Math.max(1, Math.min(3, inboxesPerDomain || 3)) :
                     product === "AWS" ? Math.max(1, Math.min(3, inboxesPerDomain || 3)) :
                     product === "MICROSOFT" ? 50 : 3;
    return Math.max(1, Math.ceil(quantity / perDomain));
  }, [inboxesPerDomain, product, quantity]);

  const totalInboxPrice = useMemo(() => quantity * getPricePerInbox(product), [quantity, product]);
  const tldPrice = domainTLD === ".com" ? 12 : 4;
  const totalDomainPrice = useMemo(() => (domainSource === "BUY_FOR_ME" ? domainsNeeded * tldPrice : 0), [domainSource, domainsNeeded, tldPrice]);

  const formatUsd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const onContinue = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout-with-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: product,
          quantity,
          inboxesPerDomain: (product === "RESELLER" || product === "EDU" || product === "LEGACY" || product === "AWS") ? Math.max(1, Math.min(3, inboxesPerDomain || 3)) : getDefaultInboxesPerDomain(product),
          domainSource,
          domainTLD: domainSource === "BUY_FOR_ME" ? domainTLD : undefined,
          domainsNeeded,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to start checkout");
      if (data?.url) window.location.href = data.url;
      else throw new Error("No checkout URL received");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-950 text-gray-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Configure Your {product} Order</h1>
            <p className="text-sm text-gray-400 mt-1">
              {quantity} {product} Inboxes @ {formatUsd(getPricePerInbox(product))} = {formatUsd(totalInboxPrice)}
              {domainSource === "BUY_FOR_ME" && (
                <>
                  {" "}+ • Domains: {domainsNeeded} × {formatUsd(tldPrice)} = {formatUsd(totalDomainPrice)}
                </>
              )}
            </p>
          </div>
          <Link href="/dashboard/products" className="text-sm text-gray-300 hover:text-white">← Back to Products</Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>
        )}

        <div className="space-y-8">
          <div className="rounded-xl border border-white/10 bg-gray-900 p-6">
            <div className="mb-4 text-sm font-medium text-gray-300">Inboxes per Domain</div>
            {(product === "RESELLER" || product === "EDU" || product === "LEGACY" || product === "AWS") ? (
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => setInboxesPerDomain(n)}
                    className={`rounded-lg px-4 py-2 text-sm ${inboxesPerDomain === n ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"}`}
                  >
                    {n}
                  </button>
                ))}
                <div className="ml-auto text-sm text-gray-400">→ Requires ~{domainsNeeded} domains</div>
              </div>
            ) : (
              <div className="text-sm text-gray-300">
                {product === "MICROSOFT" ? "50 (fixed)" : "3 (fixed)"}
                <span className="ml-2 text-gray-400">→ Requires ~{domainsNeeded} domains</span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-gray-900 p-6">
            <div className="mb-4 text-sm font-medium text-gray-300">Domain Options</div>

            {product !== "PREWARMED" && (
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="domainSource"
                    checked={domainSource === "BUY_FOR_ME"}
                    onChange={() => setDomainSource("BUY_FOR_ME")}
                  />
                  Purchase domains for me
                </label>
                {domainSource === "BUY_FOR_ME" && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <label className="inline-flex items-center gap-2">
                        <input type="radio" checked={domainTLD === ".com"} onChange={() => setDomainTLD(".com")} />
                        .com (${12} each) = {formatUsd(domainsNeeded * 12)}
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input type="radio" checked={domainTLD === ".info"} onChange={() => setDomainTLD(".info")} />
                        .info (${4} each) = {formatUsd(domainsNeeded * 4)}
                      </label>
                    </div>
                    <div className="text-xs text-gray-400">We&apos;ll purchase {domainsNeeded} {domainTLD} domains. You&apos;ll provide the forwarding URL during onboarding.</div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 space-y-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="domainSource"
                  checked={domainSource === "OWN"}
                  onChange={() => setDomainSource("OWN")}
                />
                I have my own domains (free)
              </label>
              {domainSource === "OWN" && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-gray-400">You&apos;ll provide your domain list, forwarding URL, and registrar credentials during onboarding.</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link href="/dashboard/products" className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">← Back to Products</Link>
            <button onClick={onContinue} disabled={submitting} className="rounded-md bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/40">
              {submitting ? "Processing..." : "Continue to Checkout →"}
            </button>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}

export default function ConfigurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white/60">Loading configuration...</p>
        </div>
      </div>
    }>
      <ConfigurePageContent />
    </Suspense>
  );
}

