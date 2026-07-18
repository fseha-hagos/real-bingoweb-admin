"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { apiService, Tournament } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClientAuthGuard from "@/components/ClientAuthGuard";
import { PERMISSIONS } from "@/lib/rbac";

export default function EditTournamentPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const [tournament, setTournament] = useState<Partial<Tournament>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      loadTournament();
    }
  }, [tournamentId]);

  const loadTournament = async () => {
    try {
      const data = await apiService.getTournament(tournamentId);
      // We keep the full object in state, but won't display dates
      setTournament(data);
    } catch (err: any) {
      console.error("Failed to load tournament:", err);
      alert("Failed to load tournament: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiService.updateTournament(tournamentId, {
        title: tournament.title,
        subtitle: tournament.subtitle || undefined,
        description: tournament.description || undefined,
        bannerUrl: tournament.bannerUrl || undefined,
        betAmount: tournament.betAmount,
        prizePool: tournament.prizePool,
        // Keep existing dates/status to avoid breaking backend if it requires them
        startAt: tournament.startAt,
        endAt: tournament.endAt,
        status: tournament.status,
        winType: tournament.winType as any,
      });
      router.push(`/tournaments/${tournamentId}`);
    } catch (err: any) {
      alert("Failed to update tournament: " + (err.message || err.response?.data?.error || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading template...</div>
        </div>
      </Layout>
    );
  }

  return (
    <ClientAuthGuard permission={PERMISSIONS.MANAGE_TOURNAMENTS}>
      <Layout>
        <div className="space-y-6">
          <Link
            href={`/tournaments/${tournamentId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Template
          </Link>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h1 className="text-3xl font-bold mb-6">Edit Template</h1>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
              Editing tournament <strong>template</strong>. Changes will apply to future game instances created from this template.
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tournament.title || ""}
                    onChange={(e) => setTournament({ ...tournament, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={tournament.subtitle || ""}
                    onChange={(e) => setTournament({ ...tournament, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banner URL</label>
                  <input
                    type="url"
                    value={tournament.bannerUrl || ""}
                    onChange={(e) => setTournament({ ...tournament, bannerUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={tournament.description || ""}
                    onChange={(e) => setTournament({ ...tournament, description: e.target.value })}
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
                    min="0"
                    value={tournament.betAmount || ""}
                    onChange={(e) =>
                      setTournament({ ...tournament, betAmount: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prize Pool (ETB)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tournament.prizePool || ""}
                    onChange={(e) =>
                      setTournament({ ...tournament, prizePool: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Win Condition</label>
                  <select
                    value={tournament.winType || "standard"}
                    onChange={(e) => setTournament({ ...tournament, winType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">Standard (Row, Col, Diag, Full House)</option>
                    <option value="fullhouse">Full House (All numbers required)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <Link
                  href={`/tournaments/${tournamentId}`}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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

