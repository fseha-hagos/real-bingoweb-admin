"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { apiService, Tournament } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Edit, PlayCircle, Trophy, DollarSign } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/rbac";
import ActivationModal from "@/components/ActivationModal";

export default function TournamentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tournamentId = params.id as string;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);

  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.MANAGE_TOURNAMENTS);

  useEffect(() => {
    if (tournamentId) {
      loadTournament();
    }
  }, [tournamentId]);

  const loadTournament = async () => {
    try {
      const data = await apiService.getTournament(tournamentId);
      setTournament(data);
    } catch (err: any) {
      console.error("Failed to load tournament:", err);
      alert("Failed to load tournament: " + err.message);
    } finally {
      setLoading(false);
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

  if (!tournament) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Tournament template not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Link
          href="/tournaments"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Link>

        {tournament.bannerUrl && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-48 rounded-lg flex items-center justify-center">
            <Trophy className="w-24 h-24 text-white opacity-50" />
          </div>
        )}

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{tournament.title}</h1>
                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  TEMPLATE
                </span>
              </div>
              {tournament.subtitle && (
                <p className="text-lg text-gray-600 mb-2">{tournament.subtitle}</p>
              )}
            </div>

            {/* RBAC Protected Actions */}
            {canManage && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsActivateModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <PlayCircle className="w-5 h-5" />
                  Activate
                </button>
                <Link
                  href={`/tournaments/${tournament.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-5 h-5" />
                  Edit
                </Link>
              </div>
            )}
          </div>

          {tournament.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">{tournament.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Entry Fee</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(tournament.betAmount)}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-medium">Prize Pool</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(tournament.prizePool)}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="text-sm font-medium">Win Condition</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 uppercase">
                {tournament.winType || "standard"}
              </p>
            </div>

            {/* Removed Date Fields */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template ID
              </label>
              <p className="text-gray-900 font-mono text-sm">{tournament.id}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-gray-900">{formatDate(tournament.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activation Modal */}
      {isActivateModalOpen && (
        <ActivationModal
          isOpen={isActivateModalOpen}
          tournament={tournament}
          onClose={() => setIsActivateModalOpen(false)}
          onSuccess={() => {
            // Maybe redirect to games page or just show success message?
            // ActivationModal handle success by calling onClose usually, 
            // but we can add a refresh or redirect.
            // For now just close.
            setIsActivateModalOpen(false);
            alert("Tournament game scheduled successfully! Check the Games page.");
            router.push('/games');
          }}
        />
      )}
    </Layout>
  );
}

