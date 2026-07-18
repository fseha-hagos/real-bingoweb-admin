"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { apiService } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClientAuthGuard from "@/components/ClientAuthGuard";
import { PERMISSIONS } from "@/lib/rbac";

export default function NewTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    bannerUrl: "",
    betAmount: "",
    prizePool: "",
    winType: "fullhouse", // Default for templates
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const cleanPayload = {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        description: formData.description || undefined,
        bannerUrl: formData.bannerUrl || undefined,
        betAmount: parseFloat(formData.betAmount),
        prizePool: formData.prizePool ? parseFloat(formData.prizePool) : 0,
        winType: formData.winType as any,
        startAt: new Date().toISOString(), // Set to now as "creation time" effectively
        endAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        status: "active" as any, // Templates are active by default
      };

      console.log("Creating tournament template with payload:", cleanPayload);
      const data = await apiService.createTournament(cleanPayload);
      router.push(`/tournaments/${data.id || "success"}`);
    } catch (err: any) {
      console.error("Full error object:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error";
      alert("Failed to create tournament template: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ClientAuthGuard permission={PERMISSIONS.MANAGE_TOURNAMENTS}>
      <Layout>
        <div className="space-y-6">
          <Link
            href="/tournaments"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Link>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h1 className="text-3xl font-bold mb-6 text-blue-500">Create New Template</h1>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
              This creates a tournament <strong>template</strong>. You can activate specific game instances from this template later.
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Weekly High Roller"
                    minLength={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner URL</label>
                  <input
                    type="url"
                    value={formData.bannerUrl}
                    onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buy-in Amount (ETB) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.betAmount}
                    onChange={(e) => setFormData({ ...formData, betAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prize Pool (ETB) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Win Condition</label>
                  <select
                    value={formData.winType}
                    onChange={(e) => setFormData({ ...formData, winType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fullhouse">Full House (All numbers required)</option>
                    <option value="standard">Standard (Row, Col, Diag, Full House)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Template"}
                </button>
                <Link
                  href="/tournaments"
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ClientAuthGuard>
  );
}

