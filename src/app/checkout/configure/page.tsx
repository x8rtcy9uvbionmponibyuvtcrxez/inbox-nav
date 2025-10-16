"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/Button";

type ProductType = "RESELLER" | "EDU" | "LEGACY" | "PREWARMED" | "AWS" | "MICROSOFT";
type DomainSource = "OWN" | "BUY_FOR_ME";
type TLD = ".com" | ".info";

function normalizeProductType(value: string | null): ProductType {
  const v = (value || "EDU").toUpperCase();
  return ["EDU", "LEGACY", "RESELLER", "PREWARMED", "AWS", "MICROSOFT"].includes(v) ? (v as ProductType) : "EDU";
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
  const params = useSearchParams();

  const product = normalizeProductType(params.get("product"));
  const quantity = Math.max(1, parseInt(params.get("qty") || "10", 10) || 10);

  // Check for missing required parameters
  const productParam = params.get("product");

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

  // Check for missing required parameters after hooks
  if (!productParam) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
          <div className="app-shell">
            <div className="flex flex-col items-center justify-center space-y-6 py-20">
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Configuration Error</h1>
              <p className="text-center text-[var(--text-secondary)]">
                Missing product parameter. Please select a product from the products page.
              </p>
              <Button asChild>
                <Link href="/dashboard/products">← Back to Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // PREWARMED products don't need domain configuration
  // They go directly to checkout, but we still show the form for consistency

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
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="app-shell">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Configuration
              </span>
              <h1>Configure your {product} order</h1>
              <p className="text-base text-[var(--text-secondary)]">
                {quantity} {product} inboxes @ {formatUsd(getPricePerInbox(product))} = {formatUsd(totalInboxPrice)}
                {domainSource === "BUY_FOR_ME" && (
                  <>
                    {" "}• Domains: {domainsNeeded} × {formatUsd(tldPrice)} = {formatUsd(totalDomainPrice)}
                  </>
                )}
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/products">← Back to products</Link>
            </Button>
          </div>

          {error && (
            <div className="mt-8 rounded-[16px] border border-[#ff8d8d]/40 bg-[#ff8d8d]/10 p-5 text-sm text-[#ffb0b0]">
              {error}
            </div>
          )}

          <div className="mt-16 space-y-12">
            <section className="surface-card space-y-6">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">Inboxes per domain</h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Balance ramp speed with inbox reputation by controlling how many senders share a domain.
                  </p>
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)]">≈ {domainsNeeded} domains needed</span>
              </div>

              {(product === "RESELLER" || product === "EDU" || product === "LEGACY" || product === "AWS") ? (
                <div className="flex flex-wrap items-center gap-3">
                  {[1, 2, 3].map((n) => {
                    const isActive = inboxesPerDomain === n;
                    return (
                      <button
                        key={n}
                        onClick={() => setInboxesPerDomain(n)}
                        className={`rounded-[12px] border px-4 py-2 text-sm font-semibold transition-colors ${
                          isActive
                            ? "border-[var(--border-strong)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                            : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-medium)]"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                  {product === "MICROSOFT" ? "50 inboxes per domain (fixed)" : "3 inboxes per domain (fixed)"}
                </div>
              )}
            </section>

            <section className="surface-card space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Domain options</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Decide if we should procure fresh domains or if you&apos;ll connect existing inventory during onboarding.
                </p>
              </div>

              {product !== "PREWARMED" ? (
                <div className="space-y-4">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-3 text-sm transition-colors ${
                      domainSource === "BUY_FOR_ME"
                        ? "border-[var(--border-strong)] bg-[rgba(254,254,254,0.12)] text-[var(--text-primary)]"
                        : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:bg-[rgba(254,254,254,0.06)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="domainSource"
                      className="h-4 w-4 accent-[var(--bg-white)]"
                      checked={domainSource === "BUY_FOR_ME"}
                      onChange={() => setDomainSource("BUY_FOR_ME")}
                    />
                    <span className="flex-1">Purchase domains for me</span>
                  </label>

                  {domainSource === "BUY_FOR_ME" && (
                    <div className="space-y-4 rounded-[12px] border border-[var(--border-medium)] bg-[rgba(254,254,254,0.08)] p-4 text-sm text-[var(--text-primary)]">
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            className="h-4 w-4 accent-[var(--bg-white)]"
                            checked={domainTLD === ".com"}
                            onChange={() => setDomainTLD(".com")}
                          />
                          .com ({formatUsd(12)} each) = {formatUsd(domainsNeeded * 12)}
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            className="h-4 w-4 accent-[var(--bg-white)]"
                            checked={domainTLD === ".info"}
                            onChange={() => setDomainTLD(".info")}
                          />
                          .info ({formatUsd(4)} each) = {formatUsd(domainsNeeded * 4)}
                        </label>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        We&apos;ll purchase {domainsNeeded} {domainTLD} domains and stage them for DNS configuration. Forwarding destinations are collected during onboarding.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                  Prewarmed inboxes are ready to send immediately and don&apos;t require domain configuration.
                </div>
              )}

              {product !== "PREWARMED" && (
                <div className="space-y-4">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-3 text-sm transition-colors ${
                      domainSource === "OWN"
                        ? "border-[var(--border-strong)] bg-[rgba(254,254,254,0.12)] text-[var(--text-primary)]"
                        : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:bg-[rgba(254,254,254,0.06)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="domainSource"
                      className="h-4 w-4 accent-[var(--bg-white)]"
                      checked={domainSource === "OWN"}
                      onChange={() => setDomainSource("OWN")}
                    />
                    <span className="flex-1">I have my own domains (no additional cost)</span>
                  </label>
                  {domainSource === "OWN" && (
                    <div className="rounded-[12px] border border-[var(--border-medium)] bg-[rgba(254,254,254,0.08)] p-4 text-xs text-[var(--text-muted)]">
                      You&apos;ll provide your domain list, forwarding URL, and registrar access during onboarding so we can configure DNS and launch quickly.
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" asChild className="justify-center sm:w-auto">
              <Link href="/dashboard/products">← Back to products</Link>
            </Button>
            <Button
              variant="primary"
              onClick={onContinue}
              disabled={submitting}
              className="justify-center sm:w-auto"
            >
              {submitting ? "Processing…" : "Continue to checkout →"}
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default function ConfigurePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)]">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-medium)] border-t-transparent" />
            <p className="text-sm">Loading configuration…</p>
          </div>
        </div>
      }
    >
      <ConfigurePageContent />
    </Suspense>
  );
}
