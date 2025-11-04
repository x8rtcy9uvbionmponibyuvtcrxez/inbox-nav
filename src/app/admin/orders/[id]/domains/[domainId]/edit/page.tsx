"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

type EditDomainPageProps = {
  params: Promise<{ id: string; domainId: string }>;
};

export default function EditDomainPage({ params }: EditDomainPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [liveInboxCount, setLiveInboxCount] = useState(0);

  const [formData, setFormData] = useState({
    domain: "",
    forwardingUrl: "",
    businessName: "",
    status: "LIVE",
    tags: [] as string[],
  });

  const [originalDomain, setOriginalDomain] = useState("");

  useEffect(() => {
    async function fetchDomainData() {
      try {
        // Fetch order data to get domain
        const orderResponse = await fetch(`/api/admin/orders/${resolvedParams.id}`);
        if (!orderResponse.ok) {
          throw new Error("Failed to fetch order");
        }
        const orderData = await orderResponse.json();

        // Find the specific domain
        const domain = orderData.domains?.find((d: { id: string }) => d.id === resolvedParams.domainId);

        if (!domain) {
          throw new Error("Domain not found");
        }

        // Count LIVE inboxes that reference this domain
        const liveInboxes = orderData.inboxes?.filter(
          (inbox: { forwardingDomain: string; status: string }) =>
            inbox.forwardingDomain === domain.domain && inbox.status === 'LIVE'
        ) || [];

        setLiveInboxCount(liveInboxes.length);

        setFormData({
          domain: domain.domain || "",
          forwardingUrl: domain.forwardingUrl || "",
          businessName: domain.businessName || "",
          status: domain.status || "LIVE",
          tags: domain.tags || [],
        });

        setOriginalDomain(domain.domain || "");
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load domain");
        setLoading(false);
      }
    }

    fetchDomainData();
  }, [resolvedParams.id, resolvedParams.domainId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/admin/orders/${resolvedParams.id}/domains/${resolvedParams.domainId}/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update domain");
      }

      setSuccessMessage(result.message || "Domain updated successfully!");

      // Redirect back to order details after 1 second
      setTimeout(() => {
        router.push(`/admin/orders/${resolvedParams.id}`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update domain");
    } finally {
      setSaving(false);
    }
  }

  function handleTagsChange(value: string) {
    const tags = value.split(",").map(t => t.trim()).filter(Boolean);
    setFormData({ ...formData, tags });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Loading domain details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/admin/orders/${resolvedParams.id}`}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Order
          </Link>
          <h1 className="text-3xl font-bold text-white">Edit Domain</h1>
          <p className="text-white/60 mt-2">Domain ID: {resolvedParams.domainId}</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Domain Name Section */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Domain Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Domain Name *
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example.com"
                  required
                />
                {formData.domain !== originalDomain && liveInboxCount > 0 && (
                  <p className="mt-2 text-sm text-yellow-400">
                    ⚠️ Warning: Changing domain name will update {liveInboxCount} LIVE inbox(es) that reference this domain
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Forwarding URL
                </label>
                <input
                  type="url"
                  value={formData.forwardingUrl}
                  onChange={(e) => setFormData({ ...formData, forwardingUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/webhook"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Where emails to this domain should be forwarded
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="LIVE">Live</option>
                  <option value="DELETED">Deleted</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                {formData.status === "DELETED" && (
                  <p className="mt-2 text-sm text-yellow-400">
                    ⚠️ Setting status to DELETED will hide this domain from customer view
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags.join(", ")}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comma-separated tags for organization
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href={`/admin/orders/${resolvedParams.id}`}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
