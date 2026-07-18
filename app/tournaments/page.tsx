"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { apiService, Tournament } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Edit, Eye, PlayCircle, Calendar, Trophy } from "lucide-react";
import Link from "next/link";
import ActivationModal from "@/components/ActivationModal";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/rbac";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);

  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.MANAGE_TOURNAMENTS);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTournaments();
      setTournaments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load tournaments:", err);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const openActivateModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsActivateModalOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tournament Templates</h1>
            <p className="text-gray-600 mt-1">Manage tournament configurations</p>
          </div>
          {canManage && (
            <Link
              href="/tournaments/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Template
            </Link>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading templates...</div>
        ) : tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {tournament.bannerUrl && (
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Trophy className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {tournament.title}
                      </h3>
                      {tournament.subtitle && (
                        <p className="text-sm text-gray-600">{tournament.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {tournament.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {tournament.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Entry Fee:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(tournament.betAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Prize Pool:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(tournament.prizePool)}
                      </span>
                    </div>
                    {/* Dates removed as these are templates */}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    {/* View Button - accessible to all with view permissions */}
                    <Link
                      href={`/tournaments/${tournament.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>

                    {/* Manage Actions - Admin Only */}
                    {canManage && (
                      <>
                        <Link
                          href={`/tournaments/${tournament.id}/edit`}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => openActivateModal(tournament)}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                        >
                          <PlayCircle className="w-4 h-4" />
                          Activate
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates</h3>
            <p className="text-gray-600 mb-4">Create a tournament template to get started</p>
            {canManage && (
              <Link
                href="/tournaments/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Create Template
              </Link>
            )}
          </div>
        )}

        {selectedTournament && (
          <ActivationModal
            tournament={selectedTournament}
            isOpen={isActivateModalOpen}
            onClose={() => {
              setIsActivateModalOpen(false);
              setSelectedTournament(null);
            }}
            onSuccess={() => {
              // Optionally redirect to games page or show success toast
              alert("Game instance created successfully!");
              setIsActivateModalOpen(false);
              setSelectedTournament(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
}

