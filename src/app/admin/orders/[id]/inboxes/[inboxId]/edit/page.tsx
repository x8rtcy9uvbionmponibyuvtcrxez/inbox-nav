"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

type EditInboxPageProps = {
  params: { id: string; inboxId: string };
};

export default function EditInboxPage({ params }: EditInboxPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [availablePersonas, setAvailablePersonas] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    personaName: "",
    firstName: "",
    lastName: "",
    espPlatform: "",
    tags: [] as string[],
    businessName: "",
    forwardingDomain: "",
    status: "LIVE",
  });

  const [originalEmail, setOriginalEmail] = useState("");

  useEffect(() => {
    fetchInboxData();
  }, [params.id, params.inboxId]);

  async function fetchInboxData() {
    try {
      // Fetch order data to get personas
      const orderResponse = await fetch(`/api/admin/orders/${params.id}`);
      if (!orderResponse.ok) {
        throw new Error("Failed to fetch order");
      }
      const orderData = await orderResponse.json();

      // Extract persona names from onboarding data
      const personas = orderData.onboarding?.personas || [];
      const personaNames = personas.map((p: { firstName?: string; lastName?: string }) =>
        `${p.firstName || ''} ${p.lastName || ''}`.trim()
      );
      setAvailablePersonas(personaNames);

      // Fetch inbox data
      const inboxResponse = await fetch(`/api/admin/orders/${params.id}`);
      const data = await inboxResponse.json();

      // Find the specific inbox
      const inbox = data.inboxes?.find((i: { id: string }) => i.id === params.inboxId);

      if (!inbox) {
        throw new Error("Inbox not found");
      }

      setFormData({
        email: inbox.email || "",
        password: "", // Never pre-fill passwords
        personaName: inbox.personaName || "",
        firstName: inbox.firstName || "",
        lastName: inbox.lastName || "",
        espPlatform: inbox.espPlatform || "",
        tags: inbox.tags || [],
        businessName: inbox.businessName || "",
        forwardingDomain: inbox.forwardingDomain || "",
        status: inbox.status || "LIVE",
      });

      setOriginalEmail(inbox.email || "");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inbox");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/admin/orders/${params.id}/inboxes/${params.inboxId}/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update inbox");
      }

      setSuccessMessage("Inbox updated successfully!");

      // Redirect back to order details after 1 second
      setTimeout(() => {
        router.push(`/admin/orders/${params.id}`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update inbox");
    } finally {
      setSaving(false);
    }
  }

  function generateRandomPassword() {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password });
  }

  function handleTagsChange(value: string) {
    const tags = value.split(",").map(t => t.trim()).filter(Boolean);
    setFormData({ ...formData, tags });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Loading inbox details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/orders/${params.id}`}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Order
          </Link>
          <h1 className="text-3xl font-bold text-white">Edit Inbox</h1>
          <p className="text-white/60 mt-2">Inbox ID: {params.inboxId}</p>
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
          {/* Inbox Details */}
          <section className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">📧 Inbox Details</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
                {formData.email !== originalEmail && (
                  <p className="text-yellow-400 text-xs mt-1">
                    ⚠️ Changing the email address may break existing ESP integrations
                  </p>
                )}
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank to keep existing"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm whitespace-nowrap"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-white/40 text-xs mt-1">ℹ️ Leave blank to keep existing password</p>
              </div>
            </div>
          </section>

          {/* Persona Assignment */}
          <section className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">👤 Persona Assignment</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Assigned Persona
                </label>
                {availablePersonas.length > 0 ? (
                  <select
                    value={formData.personaName}
                    onChange={(e) => setFormData({ ...formData, personaName: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select persona...</option>
                    {availablePersonas.map((persona) => (
                      <option key={persona} value={persona}>
                        {persona}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.personaName}
                    onChange={(e) => setFormData({ ...formData, personaName: e.target.value })}
                    placeholder="Enter persona name"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Tags & Metadata */}
          <section className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">🏷️ Tags & Metadata</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(", ")}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="warm, tier1, us-east"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Business Name Override (optional)
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
                  Forwarding Domain (optional)
                </label>
                <input
                  type="text"
                  value={formData.forwardingDomain}
                  onChange={(e) => setFormData({ ...formData, forwardingDomain: e.target.value })}
                  placeholder="domain1.com"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* ESP Configuration */}
          <section className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">🔧 ESP Configuration</h2>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                ESP Platform
              </label>
              <select
                value={formData.espPlatform}
                onChange={(e) => setFormData({ ...formData, espPlatform: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select platform...</option>
                <option value="Smartlead">Smartlead</option>
                <option value="Instantly">Instantly</option>
                <option value="Lemlist">Lemlist</option>
                <option value="Apollo">Apollo</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </section>

          {/* Status */}
          <section className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">📊 Status</h2>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Inbox Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="LIVE">LIVE</option>
                <option value="DELETED">DELETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              {formData.status === "DELETED" && (
                <p className="text-yellow-400 text-sm mt-2">
                  ⚠️ Setting status to DELETED will hide this inbox from the customer dashboard
                </p>
              )}
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
