"use client";

import { useMemo, useState } from "react";
import { CheckIcon, StarIcon, ShieldCheckIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

type ProductType = "RESELLER" | "EDU" | "LEGACY" | "PREWARMED" | "AWS" | "MICROSOFT";

type TabId = "google" | "microsoft" | "prewarmed" | "smtp";

interface Product {
  id: ProductType;
  name: string;
  price: number;
  description: string;
  features: string[];
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
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
    emoji: "📧",
    productIds: ["RESELLER", "EDU", "LEGACY"]
  },
  {
    id: "microsoft",
    label: "Microsoft",
    emoji: "💼",
    productIds: ["MICROSOFT"]
  },
  {
    id: "prewarmed",
    label: "Prewarmed",
    emoji: "🔥",
    productIds: ["PREWARMED"]
  },
  {
    id: "smtp",
    label: "SMTP",
    emoji: "📨",
    productIds: ["AWS"]
  }
];

const products: Product[] = [
  {
    id: "RESELLER",
    name: "Reseller Inboxes",
    price: 3,
    description: "Standard cold email inboxes with Google Workspace",
    features: ["Basic warmup", "Reliable delivery", "IMAP/SMTP access"],
    icon: CheckIcon,
    color: "blue",
    priceId: "price_1SCFcnBTWWHTKTJvdwKiINPy",
    tab: "google",
  },
  {
    id: "EDU",
    name: "Edu Inboxes",
    price: 1.5,
    description: "Educational institution inboxes with special pricing",
    features: ["Academic pricing", "Educational features", "Student support"],
    icon: CheckIcon,
    color: "green",
    priceId: "price_1SIqy8BRlmSshMl59Rsd7YT9", // TODO: Get actual EDU price ID
    tab: "google",
  },
  {
    id: "LEGACY",
    name: "Legacy Inboxes",
    price: 2.5,
    description: "Legacy inboxes with established reputation",
    features: ["Proven reputation", "Stable delivery", "Legacy support"],
    icon: CheckIcon,
    color: "orange",
    priceId: "price_1SIqy8BRlmSshMl59Rsd7YT9", // TODO: Get actual LEGACY price ID
    tab: "google",
  },
  {
    id: "PREWARMED",
    name: "Prewarmed Inboxes",
    price: 7,
    description: "Pre-warmed inboxes ready to send immediately",
    features: ["Already warmed", "Higher reputation", "Instant setup"],
    badge: "Popular",
    icon: StarIcon,
    color: "green",
    priceId: "price_1SHmyyBTWWHTKTJvK6ohM58w",
    tab: "prewarmed",
  },
  {
    id: "AWS",
    name: "AWS Inboxes",
    price: 1.25,
    description: "AWS-powered inboxes with cloud infrastructure",
    features: ["Cloud infrastructure", "Scalable", "AWS integration"],
    icon: CheckIcon,
    color: "yellow",
    priceId: "price_1SIqy8BRlmSshMl59Rsd7YT9", // TODO: Get actual AWS price ID
    tab: "smtp",
  },
  {
    id: "MICROSOFT",
    name: "Microsoft Inboxes",
    price: 60,
    description: "Premium Microsoft 365 enterprise inboxes (per domain)",
    features: ["Enterprise security", "Advanced features", "Priority support"],
    badge: "Premium",
    icon: ShieldCheckIcon,
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
    RESELLER: 10,
    EDU: 10,
    LEGACY: 10,
    PREWARMED: 10,
    AWS: 20,
    MICROSOFT: 1,
  });
  const [loading, setLoading] = useState<Record<ProductType, boolean>>({
    RESELLER: false,
    EDU: false,
    LEGACY: false,
    PREWARMED: false,
    AWS: false,
    MICROSOFT: false,
  });
  const [error, setError] = useState<string | null>(null);
  const hasLargeQuantity = useMemo(
    () => Math.max(...Object.values(quantities)) > 500,
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
    <div className="min-h-screen bg-gradient-to-br from-[#050505] via-[#090909] to-black px-6 pb-24 pt-16 text-white">
      <div className="mx-auto max-w-6xl space-y-20">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold tracking-[0.3em] text-white/60 uppercase">
              Plans
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Pick the inbox runway that matches your outreach ambitions.
            </h1>
            <p className="text-sm text-white/60 sm:text-base">
              Every fleet ships with warming, deliverability monitoring, and human support. Scale campaigns with confidence—whether you need a handful of senders or an entire squadron.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
              <span>⚡ Instant provisioning</span>
              <span>• Reputation-safe warmup</span>
              <span>• Concierge support included</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5/20 px-6 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">Need a custom fleet?</p>
            <p className="mt-2 text-sm text-white/70">Talk to us about tiered enterprise pricing and dedicated deliverability ops.</p>
            <a
              href="https://calendly.com/inboxnavigator/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-white/70"
            >
              Book a Call
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-200">
            <div className="flex items-center justify-between">
              <p>{error}</p>
              <button onClick={() => setError(null)} className="text-xs text-red-200 underline hover:text-red-100">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className={`grid gap-8 ${
          filteredProducts.length === 1 
            ? 'grid-cols-1 max-w-md mx-auto' 
            : filteredProducts.length === 2 
            ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
            : filteredProducts.length === 3
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
        }`}>
          {filteredProducts.map((product) => {
            const totalPrice = getTotalPrice(product.id);

            return (
              <div
                key={product.id}
                className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] px-8 pb-10 pt-12 shadow-[0_25px_60px_-40px_rgba(0,0,0,0.8)] transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="mb-8 flex items-start justify-between gap-3">
                  <div className="rounded-2xl bg-white/10 p-3 text-white/80">
                    <product.icon className="h-6 w-6" />
                  </div>
                  <div className="pt-1 text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Starting at</p>
                    <p className="text-3xl font-semibold text-white">
                      ${product.price}
                      <span className="text-sm text-white/40"> / inbox</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-white">{product.name}</h2>
                  <p className="text-sm text-white/55">{product.description}</p>
                </div>

                <div className="mt-6 space-y-3 text-sm text-white/70">
                  {product.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckIcon className="h-4 w-4 text-emerald-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {product.id === "MICROSOFT" && (
                    <div className="flex items-center gap-3 text-amber-300">
                      <StarIcon className="h-4 w-4" />
                      <span>Elite reputation floor & dedicated SPF records</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-3">
                  <label className="text-xs uppercase tracking-[0.25em] text-white/45">
                    Inbox volume
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
                          : (product.id === "AWS" ? 20 : product.id === "MICROSOFT" ? 1 : 10)
                      );
                    }}
                    className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-0"
                  />
                  {quantities[product.id] < getMoq(product.id) && (
                    <p className="mt-2 text-xs text-amber-300">
                      We have a minimum order of {getMoq(product.id)} inboxes for {product.name.toLowerCase()}.
                    </p>
                  )}
                </div>

                <div className="mt-auto space-y-6 pt-8">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/50">
                    <span>Total monthly</span>
                    <span className="text-xl font-semibold text-white">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(product.id)}
                    disabled={loading[product.id] || quantities[product.id] < getMoq(product.id)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-black/50"
                  >
                    {loading[product.id] ? (
                      <>
                        <svg className="h-4 w-4 animate-spin text-black/70" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                        </svg>
                        Processing
                      </>
                    ) : (
                      <>
                        Launch this fleet
                        <ArrowRightIcon className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {hasLargeQuantity ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-8 py-6 text-sm text-white/60 backdrop-blur">
            Scaling beyond 500 inboxes? We’ll layer in custom deliverability ops, pool management, and dedicated IP reputation monitoring.
            <a href="mailto:contact@inboxnavigator.com" className="ml-2 text-white underline">
              Reach out for enterprise pricing →
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
