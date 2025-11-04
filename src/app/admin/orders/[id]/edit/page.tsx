"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

type Persona = {
  firstName: string;
  lastName: string;
  profileImage?: string | null;
};

type EditOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default function EditOrderPage({ params }: EditOrderPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    website: "",
    specialRequirements: "",
    espProvider: "",
    espCredentials: {
      accountId: "",
      password: "",
      apiKey: "",
    },
    domainRegistrar: "",
    registrarUsername: "",
    registrarPassword: "",
    personas: [] as Persona[],
  });

  const [orderInfo, setOrderInfo] = useState({
    productType: "",
    quantity: 0,
    totalAmount: 0,
    status: "",
  });

  useEffect(() => {
    async function fetchOrderData() {
      try {
        const response = await fetch(`/api/admin/orders/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order");
        }

        const data = await response.json();

        // Handle onboardingData which could be an array or object
        const onboarding = Array.isArray(data.onboardingData) ? data.onboardingData[0] : data.onboardingData;

        // Populate form with existing data
        setFormData({
          businessName: onboarding?.businessType || "",
          website: onboarding?.website || "",
          specialRequirements: onboarding?.specialRequirements || "",
          espProvider: onboarding?.espProvider || "",
          espCredentials: {
            accountId: onboarding?.domainPreferences?.espCredentials?.accountId || "",
            password: "", // Never pre-fill passwords
            apiKey: "", // Never pre-fill API keys
          },
          domainRegistrar: onboarding?.domainRegistrar || "",
          registrarUsername: onboarding?.registrarUsername || "",
          registrarPassword: "", // Never pre-fill passwords
          personas: onboarding?.personas || [],
        });

        setOrderInfo({
          productType: data.productType || "",
          quantity: data.quantity || 0,
          totalAmount: data.totalAmount || 0,
          status: data.status || "",
        });

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
        setLoading(false);
      }
    }

    fetchOrderData();
  }, [resolvedParams.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${resolvedParams.id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update order");
      }

      setSuccessMessage("Order updated successfully!");

      // Redirect back to order details after 1 second
      setTimeout(() => {
        router.push(`/admin/orders/${resolvedParams.id}`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setSaving(false);
    }
  }

  function addPersona() {
    setFormData({
      ...formData,
      personas: [...formData.personas, { firstName: "", lastName: "", profileImage: null }],
    });
  }

  function removePersona(index: number) {
    setFormData({
      ...formData,
      personas: formData.personas.filter((_, i) => i !== index),
    });
  }

  function updatePersona(index: number, field: keyof Persona, value: string) {
    const updated = [...formData.personas];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, personas: updated });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/orders/${resolvedParams.id}`}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Order
          </Link>
          <h1 className="text-3xl font-bold text-white">Edit Order Details</h1>
          <p className="text-white/60 mt-2">Order ID: {resolvedParams.id}</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Information */}
          <section className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">📋 Business Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Website / Forwarding URL
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Special Requirements
                </label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* ESP Credentials */}
          <section className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">🔐 ESP Credentials</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  ESP Provider
                </label>
                <select
                  value={formData.espProvider}
                  onChange={(e) => setFormData({ ...formData, espProvider: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select provider...</option>
                  <option value="Smartlead">Smartlead</option>
                  <option value="Instantly">Instantly</option>
                  <option value="Lemlist">Lemlist</option>
                  <option value="Apollo">Apollo</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Account ID (optional)
                </label>
                <input
                  type="text"
                  value={formData.espCredentials.accountId}
                  onChange={(e) => setFormData({
                    ...formData,
                    espCredentials: { ...formData.espCredentials, accountId: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Password (optional)
                </label>
                <input
                  type="password"
                  value={formData.espCredentials.password}
                  onChange={(e) => setFormData({
                    ...formData,
                    espCredentials: { ...formData.espCredentials, password: e.target.value }
                  })}
                  placeholder="Leave blank to keep existing"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-white/40 text-xs mt-1">ℹ️ Leave blank to keep existing password</p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  API Key (optional)
                </label>
                <input
                  type="password"
                  value={formData.espCredentials.apiKey}
                  onChange={(e) => setFormData({
                    ...formData,
                    espCredentials: { ...formData.espCredentials, apiKey: e.target.value }
                  })}
                  placeholder="Leave blank to keep existing"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-white/40 text-xs mt-1">ℹ️ Leave blank to keep existing API key</p>
              </div>
            </div>
          </section>

          {/* Domain Registrar */}
          <section className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">🌐 Domain Registrar Access</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Registrar
                </label>
                <select
                  value={formData.domainRegistrar}
                  onChange={(e) => setFormData({ ...formData, domainRegistrar: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select registrar...</option>
                  <option value="GoDaddy">GoDaddy</option>
                  <option value="Namecheap">Namecheap</option>
                  <option value="Cloudflare">Cloudflare</option>
                  <option value="Google Domains">Google Domains</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Admin Email / Username
                </label>
                <input
                  type="text"
                  value={formData.registrarUsername}
                  onChange={(e) => setFormData({ ...formData, registrarUsername: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.registrarPassword}
                  onChange={(e) => setFormData({ ...formData, registrarPassword: e.target.value })}
                  placeholder="Leave blank to keep existing"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-white/40 text-xs mt-1">ℹ️ Leave blank to keep existing password</p>
              </div>
            </div>
          </section>

          {/* Personas */}
          <section className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">👥 Personas</h2>

            <div className="space-y-4">
              {formData.personas.map((persona, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-medium">Persona {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removePersona(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-1">First Name</label>
                      <input
                        type="text"
                        value={persona.firstName}
                        onChange={(e) => updatePersona(index, "firstName", e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/60 text-sm mb-1">Last Name</label>
                      <input
                        type="text"
                        value={persona.lastName}
                        onChange={(e) => updatePersona(index, "lastName", e.target.value)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addPersona}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                Add New Persona
              </button>
            </div>
          </section>

          {/* Read-Only Fields */}
          <section className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/30">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">⚠️ READ-ONLY (Contact support to change)</h2>

            <div className="space-y-2 text-white/60">
              <p>Product Type: <span className="text-white">{orderInfo.productType}</span></p>
              <p>Quantity: <span className="text-white">{orderInfo.quantity} inboxes</span></p>
              <p>Total Amount: <span className="text-white">${(orderInfo.totalAmount / 100).toFixed(2)}/month</span></p>
              <p>Order Status: <span className="text-white">{orderInfo.status}</span></p>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
