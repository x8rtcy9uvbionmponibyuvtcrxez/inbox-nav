"use client";

import { useState } from "react";
import { CheckIcon, StarIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

type ProductType = "GOOGLE" | "PREWARMED" | "MICROSOFT";

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
}

const products: Product[] = [
  {
    id: "GOOGLE",
    name: "Google Inboxes",
    price: 3,
    description: "Standard cold email inboxes with Google Workspace",
    features: ["Basic warmup", "Reliable delivery", "IMAP/SMTP access"],
    icon: CheckIcon,
    color: "blue",
    priceId: "price_1SCFcnBTWWHTKTJvdwKiINPy",
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
  },
  {
    id: "MICROSOFT",
    name: "Microsoft Inboxes",
    price: 50,
    description: "Premium Microsoft 365 enterprise inboxes",
    features: ["Enterprise security", "Advanced features", "Priority support"],
    badge: "Premium",
    icon: ShieldCheckIcon,
    color: "purple",
    priceId: "price_1SHmzdBTWWHTKTJv14sbI1cf",
  },
];

export default function ProductsPage() {
  const [quantities, setQuantities] = useState<Record<ProductType, number>>({
    GOOGLE: 10,
    PREWARMED: 10,
    MICROSOFT: 50,
  });
  const [loading, setLoading] = useState<Record<ProductType, boolean>>({
    GOOGLE: false,
    PREWARMED: false,
    MICROSOFT: false,
  });
  const [error, setError] = useState<string | null>(null);
  // Removed unused router import

  const handleQuantityChange = (productId: ProductType, value: number) => {
    const clampedValue = Math.max(10, Math.min(2000, value));
    setQuantities(prev => ({
      ...prev,
      [productId]: clampedValue,
    }));
  };

  const handleSelectPlan = async (productId: ProductType) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const quantity = quantities[productId];
    setError(null);
    setLoading(prev => ({ ...prev, [productId]: true }));

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: product.priceId,
          quantity: quantity,
          productType: productId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
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

  const getColorClasses = (color: string) => {
    switch (color) {
      case "blue":
        return {
          border: "border-blue-500/30",
          bg: "bg-blue-500/10",
          text: "text-blue-400",
          button: "bg-blue-600 hover:bg-blue-700",
        };
      case "green":
        return {
          border: "border-green-500/30",
          bg: "bg-green-500/10",
          text: "text-green-400",
          button: "bg-green-600 hover:bg-green-700",
        };
      case "purple":
        return {
          border: "border-purple-500/30",
          bg: "bg-purple-500/10",
          text: "text-purple-400",
          button: "bg-purple-600 hover:bg-purple-700",
        };
      default:
        return {
          border: "border-gray-500/30",
          bg: "bg-gray-500/10",
          text: "text-gray-400",
          button: "bg-gray-600 hover:bg-gray-700",
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Select the inbox package that fits your needs
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <p className="text-red-400 font-medium">Error</p>
              </div>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 text-sm mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product) => {
            const colorClasses = getColorClasses(product.color);
            const totalPrice = getTotalPrice(product.id);
            
            return (
              <div
                key={product.id}
                className={`relative bg-gray-900 border ${colorClasses.border} rounded-xl p-8 hover:border-opacity-60 transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              >
                {/* Badge */}
                {product.badge && (
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium ${
                    product.badge === "Popular" 
                      ? "bg-green-600 text-white" 
                      : "bg-purple-600 text-white"
                  }`}>
                    {product.badge}
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center mb-6`}>
                  <product.icon className={`h-6 w-6 ${colorClasses.text}`} />
                </div>

                {/* Product Info */}
                <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
                <div className="text-3xl font-bold text-white mb-2">
                  ${product.price}
                  <span className="text-lg text-gray-400 font-normal">/inbox/month</span>
                </div>
                <p className="text-gray-400 mb-6">{product.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Quantity Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Inboxes
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={quantities[product.id]}
                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Total Price */}
                <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Total</div>
                    <div className="text-2xl font-bold text-white">
                      ${totalPrice.toLocaleString()}/month
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelectPlan(product.id)}
                  disabled={loading[product.id]}
                  className={`w-full py-3 px-6 ${colorClasses.button} text-white font-medium rounded-lg transition-colors duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {loading[product.id] && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading[product.id] ? 'Processing...' : 'Select This Plan'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            All plans include 24/7 support and 99.9% uptime guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
