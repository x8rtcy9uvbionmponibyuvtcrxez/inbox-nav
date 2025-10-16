"use client";

import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

type ProductType = "RESELLER" | "EDU" | "LEGACY" | "PREWARMED" | "AWS" | "MICROSOFT";

type TabId = "google" | "microsoft" | "prewarmed" | "smtp";

interface Product {
  id: ProductType;
  name: string;
  price: number;
  description: string;
  features: string[];
  badge?: string;
  color: string;
  priceId: string;
  tab: TabId;
}

interface Tab {
  id: TabId;
  label: string;
  emoji: string;
  productIds: ProductType[];
}

const tabs: Tab[] = [
  {
    id: "google",
    label: "Google",
    emoji: "",
    productIds: ["EDU", "LEGACY", "RESELLER"]
  },
  {
    id: "microsoft",
    label: "Microsoft",
    emoji: "",
    productIds: ["MICROSOFT"]
  },
  {
    id: "prewarmed",
    label: "Prewarmed",
    emoji: "",
    productIds: ["PREWARMED"]
  },
  {
    id: "smtp",
    label: "SMTP",
    emoji: "",
    productIds: ["AWS"]
  }
];

const products: Product[] = [
  {
    id: "EDU",
    name: "Edu Inboxes",
    price: 1.5,
    description: "Cost-efficient Google inboxes designed for high-volume sending at the best price.",
    features: ["Lowest cost per inbox", "Built for large outbound volume", "Managed Google risk (isolation & spread)"],
    color: "green",
    priceId: "price_1SIqy8BRlmSshMl59Rsd7YT9", // TODO: Get actual EDU price ID
    tab: "google",
  },
  {
    id: "LEGACY",
    name: "Legacy Inboxes",
    price: 2.5,
    description: "Balanced Google setup for teams that want reliability and predictable spend.",
    features: ["Best balance of cost + risk", "Very low chance of Google deactivations", "Ideal for steady, long-term outreach"],
    color: "orange",
    priceId: "price_1SIqy8BRlmSshMl59Rsd7YT9", // TODO: Get actual LEGACY price ID
    tab: "google",
  },
  {
    id: "RESELLER",
    name: "Reseller Inboxes",
    price: 3,
    description: "Higher-trust Google inboxes for programs that need extra stability.",
    features: ["Safer Google setup (more isolation)", "Great for high-stakes/managed accounts", "Full IMAP/SMTP access"],
    color: "blue",
    priceId: "price_1SCFcnBTWWHTKTJvdwKiINPy",
    tab: "google",
  },
  {
    id: "PREWARMED",
    name: "Prewarmed Inboxes",
    price: 7,
    description: "Ready-to-send inboxes with proven sender history.",
    features: ["Instant activation", "Strong reputation floor", "Zero ramp-up time"],
    badge: "Popular",
    color: "green",
    priceId: "price_1SHmyyBTWWHTKTJvK6ohM58w",
    tab: "prewarmed",
  },
  {
    id: "AWS",
    name: "AWS Inboxes",
    price: 1.25,
    description: "AWS-backed inboxes for scalable, flexible infrastructure.",
    features: ["Built on AWS for scale", "Flexible integration options", "Stable, cloud-native setup"],
    color: "yellow",
    priceId: "price_1SIqy8BRlmSshMl59Rsd7YT9", // TODO: Get actual AWS price ID
    tab: "smtp",
  },
  {
    id: "MICROSOFT",
    name: "Microsoft Inboxes",
    price: 60,
    description: "Microsoft 365 enterprise inboxes with security and compliance built-in.",
    features: ["Enterprise-grade security & controls", "Dedicated SPF/DKIM setup per domain", "Priority support & SLAs"],
    badge: "Premium",
    color: "purple",
    priceId: "price_1SIqy8BRlmSshMl59Rsd7YT9",
    tab: "microsoft",
  },
];

const formatCurrency = (amountInDollars: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amountInDollars);

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("google");
  const [quantities, setQuantities] = useState<Record<ProductType, number>>({
    EDU: 10,
    LEGACY: 10,
    RESELLER: 10,
    PREWARMED: 10,
    AWS: 20,
    MICROSOFT: 1,
  });
  const [loading, setLoading] = useState<Record<ProductType, boolean>>({
    EDU: false,
    LEGACY: false,
    RESELLER: false,
    PREWARMED: false,
    AWS: false,
    MICROSOFT: false,
  });
  const [error, setError] = useState<string | null>(null);
  const hasLargeQuantity = useMemo(
    () => Math.max(...Object.values(quantities)) > 3000,
    [quantities],
  );

  // Filter products based on active tab
  const filteredProducts = useMemo(() => {
    const activeTabConfig = tabs.find(tab => tab.id === activeTab);
    if (!activeTabConfig) return products;
    return products.filter(product => activeTabConfig.productIds.includes(product.id));
  }, [activeTab]);

  const handleQuantityChange = (productId: ProductType, value: number) => {
    // Allow temporary values below MOQ while typing; enforce hard caps 0..2000
    const clampedValue = Math.max(0, Math.min(2000, value));
    setQuantities(prev => ({
      ...prev,
      [productId]: clampedValue,
    }));
  };

  const getMoq = (productId: ProductType) => {
    if (productId === 'AWS') return 20;
    if (productId === 'MICROSOFT') return 1;
    return 10;
  };

  const handleSelectPlan = async (productId: ProductType) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const quantity = quantities[productId];
    setError(null);
    setLoading(prev => ({ ...prev, [productId]: true }));

    try {
      if (productId === 'PREWARMED') {
        // Direct to simple checkout for prewarmed
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: product.priceId,
            quantity,
            productType: productId,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
        if (data.url) window.location.href = data.url; else throw new Error('No checkout URL received');
      } else {
        // Route to configuration for all other products (they need domains)
        const url = `/checkout/configure?product=${productId}&qty=${quantity}`;
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getTotalPrice = (productId: ProductType) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    return product.price * quantities[productId];
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 xl:px-12 space-y-20">
        {/* Hero Section */}
        <header className="rounded-[32px] border border-[var(--border-subtle)] bg-[rgba(35,35,35,0.78)] px-8 py-12 backdrop-blur">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] lg:items-start">
            <div className="space-y-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border-medium)] bg-[rgba(254,254,254,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Plans
              </span>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight text-[var(--text-primary)] lg:text-5xl">
                  Pick the inbox runway that matches your outreach ambitions.
                </h1>
                <p className="max-w-3xl text-lg text-[var(--text-secondary)]">
                  Every fleet ships with warming, deliverability monitoring, and human support. Scale campaigns with confidence—whether you need a handful of senders or an entire squadron.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[rgba(254,254,254,0.06)] px-3 py-1.5">
                  ⚡ Instant provisioning
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[rgba(254,254,254,0.06)] px-3 py-1.5">
                  • Reputation-safe warmup
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[rgba(254,254,254,0.06)] px-3 py-1.5">
                  • Concierge support included
                </span>
              </div>
            </div>
            <div className="rounded-[24px] border border-[var(--border-medium)] bg-[rgba(20,20,20,0.78)] p-6 text-sm text-[var(--text-secondary)] shadow-[0_30px_70px_-40px_rgba(0,0,0,0.85)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
                Need a custom fleet?
              </p>
              <p className="mt-3 text-base leading-relaxed">
                Talk to us about tiered enterprise pricing and dedicated deliverability ops.
              </p>
              <a
                href="https://calendly.com/inboxnavigator/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-[14px] border border-[var(--border-medium)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
              >
                Book a Call
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-[16px] border border-[#ff8d8d]/40 bg-[#ff8d8d]/10 p-6 text-sm text-[#ffb0b0]">
            <div className="flex items-center justify-between gap-4">
              <p>{error}</p>
              <button onClick={() => setError(null)} className="text-xs font-medium uppercase tracking-[0.08em] text-[#ffb0b0] hover:text-[#ffd1d1]">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="border-b border-[var(--border-subtle)] pb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex h-12 items-center gap-3 rounded-[12px] px-6 text-base font-semibold transition-all duration-200 ${
                    isActive
                      ? 'border border-[var(--border-strong)] bg-[rgba(254,254,254,0.14)] text-[var(--text-primary)] shadow-sm'
                      : 'border border-transparent text-[var(--text-muted)] hover:border-[var(--border-subtle)] hover:bg-[rgba(254,254,254,0.08)] hover:text-[var(--text-primary)] hover:shadow-sm'
                  }`}
                >
                  {tab.emoji && <span className="text-xl">{tab.emoji}</span>}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Product Cards */}
        <div
          className={`grid gap-8 ${
            filteredProducts.length === 1
              ? 'grid-cols-1 max-w-lg mx-auto'
              : filteredProducts.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto'
              : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
          }`}
        >
          {filteredProducts.map((product) => {
            const totalPrice = getTotalPrice(product.id);

            return (
              <div key={product.id} className="surface-card group flex h-full flex-col gap-8 p-8 transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-end gap-4">
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Starting at</p>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">
                      ${product.price}
                      <span className="ml-1 text-sm font-normal text-[var(--text-secondary)]">/ inbox</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">{product.name}</h2>
                    {product.badge ? (
                      <span className="inline-flex w-fit items-center rounded-[10px] border border-[var(--border-medium)] bg-[var(--bg-tertiary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                        {product.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{product.description}</p>
                </div>

                <ul className="min-h-[132px] space-y-2 rounded-[16px] border border-[var(--border-subtle)] bg-[rgba(254,254,254,0.05)] px-4 py-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {product.features.map((feature) => (
                    <li key={feature}>• {feature}</li>
                  ))}
                  {product.id === "MICROSOFT" && <li className="text-[var(--text-primary)]">• Elite reputation floor & dedicated SPF records</li>}
                </ul>

                <div className="space-y-4">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Inbox count
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={product.id === "AWS" ? "20" : product.id === "MICROSOFT" ? "1" : "10"}
                    value={quantities[product.id]}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      const num = parseInt(raw, 10);
                      handleQuantityChange(
                        product.id,
                        Number.isFinite(num)
                          ? num
                          : product.id === "AWS"
                          ? 20
                          : product.id === "MICROSOFT"
                          ? 1
                          : 10,
                      );
                    }}
                    className="w-full rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-3 text-base font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-medium)] focus:outline-none focus:ring-2 focus:ring-[var(--border-medium)]/20 transition-all duration-200"
                  />
                  {quantities[product.id] < getMoq(product.id) && (
                    <p className="rounded-lg bg-[rgba(254,254,254,0.06)] px-3 py-2 text-sm text-[var(--text-muted)]">
                      We have a minimum order of {getMoq(product.id)} inboxes for {product.name.toLowerCase()}.
                    </p>
                  )}
                </div>

                <div className="mt-auto space-y-6">
                  <div className="flex items-center justify-between rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-6 py-4">
                    <span className="text-sm font-semibold text-[var(--text-muted)]">Total monthly</span>
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center gap-3 font-semibold"
                    disabled={loading[product.id] || quantities[product.id] < getMoq(product.id)}
                    onClick={() => handleSelectPlan(product.id)}
                  >
                    {loading[product.id] ? (
                      <>
                        <svg className="h-5 w-5 animate-spin text-[var(--text-dark)]/70" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                        </svg>
                        Processing…
                      </>
                    ) : (
                      <>
                        Start setup
                        <ArrowRightIcon className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {hasLargeQuantity ? (
          <div className="surface-panel text-sm text-[var(--text-secondary)]">
            <span>
              Scaling beyond <strong>3,000 inboxes</strong>? Get bulk deals and priority support.
            </span>
            <a href="mailto:contact@inboxnavigator.com" className="ml-2 inline-flex items-center text-[var(--text-primary)] underline">
              Reach out for enterprise pricing →
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
