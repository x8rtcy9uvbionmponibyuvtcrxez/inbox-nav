"use client";

import { useMemo, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import PageTransition from "@/components/animations/PageTransition";
import FadeIn from "@/components/animations/FadeIn";
import LoadingSpinner from "@/components/animations/LoadingSpinner";

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
    emoji: "📧",
    productIds: ["LEGACY", "RESELLER"]
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
    id: "EDU",
    name: "Edu Inboxes",
    price: 1.5,
    description: "Cost-efficient Google inboxes designed for high-volume sending at the best price.",
    features: ["Lowest cost per inbox", "Built for large outbound volume", "Managed Google risk (isolation & spread)"],
    color: "green",
    priceId: "price_1SIoynBRlmSshMl5kKycrio6",
    tab: "google",
  },
  {
    id: "LEGACY",
    name: "Legacy Inboxes",
    price: 2.5,
    description: "Low cost Google inboxes for teams that want cost-effective inboxes",
    features: ["Low risk of Google crackdown", "Send up to 15 emails/day/inbox", "US IP only"],
    color: "orange",
    priceId: "price_1RW8EkBRlmSshMl5LIGqjcHw",
    tab: "google",
  },
  {
    id: "RESELLER",
    name: "Reseller Inboxes",
    price: 3,
    description: "Safest Google inboxes — the recommended choice",
    features: ["Zero risk of Google crackdown", "Full admin access", "1 domain/workspace", "US IP only", "Send up to 15 emails/day/inbox"],
    color: "blue",
    priceId: "price_1SIoyCBRlmSshMl5OSvRIr36",
    tab: "google",
  },
         {
           id: "PREWARMED",
           name: "Prewarmed Inboxes",
           price: 7,
           description: "Prewarmed inboxes ready to send with FREE .COM domains",
           features: ["Generic business domains", "Configure your sending name, profile picture, and forwarding domain", "Warmed up for at least 1 month", "Send up to 15 emails/day/inbox"],
           color: "green",
           priceId: "price_1RSKvSBRlmSshMl5HORm2Mzs",
           tab: "prewarmed",
         },
  {
    id: "AWS",
    name: "AWS Inboxes",
    price: 1.25,
    description: "AWS-based SMTP inboxes with isolated tenants and dedicated IPs",
    features: ["Built on AWS — optimized for scale", "Dedicated IPs and isolated tenants", "Premium SMTP inboxes", "Send up to 15 emails/day/inbox"],
    color: "yellow",
    priceId: "price_1SIoxQBRlmSshMl5cPgeqUNj",
    tab: "smtp",
  },
         {
           id: "MICROSOFT",
           name: "Microsoft Inboxes",
           price: 60,
           description: "Microsoft 365 enterprise inboxes based on Azure",
           features: ["Isolated tenants", "50 users/domain", "Send up to 5 emails/day/inbox", "Same as Hypertide", "Performs better than regular Microsoft inboxes"],
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

  const handleCheckout = async (productId: ProductType) => {
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
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="app-shell">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-16">
              <FadeIn delay={0.1}>
                <div className="space-y-5">
                  <span className="inline-flex items-center gap-2 rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                    Products
                  </span>
                  <h1>
                    Your one-stop shop for all your sending needs
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
                    <span>⚡ Instant setup</span>
                    <span>• 🛡️ SPF/DKIM/DMARC included</span>
                    <span>• 🎯 Concierge support</span>
                  </div>
                </div>
              </FadeIn>

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

              <nav className="border-b border-[var(--border-subtle)] pb-6">
                <div className="flex flex-wrap gap-3">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex h-11 items-center gap-3 rounded-[12px] px-5 text-base font-medium transition-colors ${
                          isActive
                            ? 'border border-[var(--border-strong)] bg-[rgba(254,254,254,0.14)] text-[var(--text-primary)]'
                            : 'border border-transparent text-[var(--text-muted)] hover:border-[var(--border-subtle)] hover:bg-[rgba(254,254,254,0.08)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <span className="text-lg">{tab.emoji}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                     {filteredProducts.map((product) => {
                       const totalPrice = getTotalPrice(product.id);
                       const isStaticCard = false;

                       return (
                         <div key={product.id} className="surface-card flex h-full flex-col gap-8">
                           {(
                             <div className="flex items-center justify-center">
                               <div className="text-center">
                                 <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">Starting at</p>
                                 <p className="text-3xl font-semibold text-[var(--text-primary)]">
                                   ${product.price}
                                   <span className="ml-1 text-sm font-normal text-[var(--text-secondary)]">/ inbox</span>
                                 </p>
                               </div>
                             </div>
                           )}

                      <div className="space-y-3">
                        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{product.name}</h2>
                        <p className="text-base text-[var(--text-secondary)]">{product.description}</p>
                        {product.badge && (
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${product.badge === "Popular" ? "bg-green-500/20 text-green-300" : "bg-purple-500/20 text-purple-300"}`}>
                            {product.badge}
                          </span>
                        )}
                      </div>

                             <div className="flex-1 flex flex-col">
                               <div className="space-y-3 text-base text-[var(--text-secondary)]">
                                 {product.features.map((feature) => (
                                   <div key={feature} className="flex items-start gap-3">
                                     <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                                       <span className="text-green-400 text-sm">✓</span>
                                     </div>
                                     <span className="leading-relaxed">{feature}</span>
                                   </div>
                                 ))}
                               </div>

                               {(
                                 <div className="mt-auto space-y-3">
                                   <label className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                                     {product.id === "MICROSOFT" ? "Domain count" : "Inbox count"}
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
                                     className="w-full rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-3 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--border-medium)] focus:outline-none"
                                   />
                                   {quantities[product.id] < getMoq(product.id) && (
                                     <p className="text-sm text-[var(--text-muted)]">
                                       Minimum order: {getMoq(product.id)} inboxes for {product.name.toLowerCase()}.
                                     </p>
                                   )}
                                 </div>
                               )}
                             </div>

                      {(
                        <div className="mt-auto space-y-6">
                          <div className="flex items-center justify-between rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                            <span>Total monthly</span>
                            <span className="text-2xl font-semibold text-[var(--text-primary)]">
                              {formatCurrency(totalPrice)}
                            </span>
                          </div>

                          <Button
                            variant="primary"
                            size="lg"
                            onClick={() => handleCheckout(product.id)}
                            disabled={loading[product.id] || quantities[product.id] < getMoq(product.id)}
                            className="w-full"
                          >
                            {loading[product.id] ? (
                              <LoadingSpinner size="sm" color="white" />
                            ) : (
                              <>
                                Start setup
                                <ArrowRightIcon className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      )}
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

            {/* Right Column - Custom Fleet CTA + All plans include */}
            <div className="lg:col-span-1 space-y-6">
              <FadeIn delay={0.3}>
                <div className="lg:sticky lg:top-8">
                  <div className="surface-card space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      Talk to Sales
                    </p>
                    <p className="text-base text-[var(--text-secondary)]">
                      Scaling past 3,000 inboxes—or just want to chat?
                    </p>
                    <a
                      href="https://calendly.com/inboxnavigator/demo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--bg-white)]"
                    >
                      Book a call →
                    </a>
                  </div>
                </div>
              </FadeIn>

              {/* All plans include block on the right */}
              <FadeIn delay={0.4}>
                <div className="surface-card p-6 space-y-6">
                  <h3 className="text-xl font-semibold text-[var(--text-primary)]">All plans include:</h3>
                  <div className="space-y-4">
                    {[
                      "DNS setup (SDKIM, SPF, DMARC)",
                      "Complete DFY service",
                      "Integration with Instantly, Smartlead, Plusvibes and other platforms",
                      "Bring your domains for free",
                      "Profile picture setup",
                      "US IP Only",
                      "Priority Support",
                      "95% inbox delivery rate",
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                          <span className="text-green-400 text-sm">✓</span>
                        </div>
                        <span className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
