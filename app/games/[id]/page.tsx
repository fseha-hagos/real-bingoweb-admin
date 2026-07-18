"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { apiService, GameSession } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;
  const [game, setGame] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (gameId) {
      loadGame();
    }
  }, [gameId]);

  const loadGame = async () => {
    try {
      const data = await apiService.getGameSession(gameId);
      setGame(data);
    } catch (err: any) {
      console.error("Failed to load game:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading game...</div>
        </div>
      </Layout>
    );
  }

  if (!game) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Game not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Link
          href="/games"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Games
        </Link>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h1 className="text-3xl font-bold mb-6">Game Details</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Game Name
              </label>
              <p className="text-gray-900">{game.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span
                className={`px-3 py-1 rounded-full text-sm ${game.status === "active"
                    ? "bg-green-100 text-green-800"
                    : game.status === "completed"
                      ? "bg-blue-100 text-blue-800"
                      : game.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
              >
                {game.status}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Players
              </label>
              <p className="text-gray-900">
                {game.currentPlayers} / {game.maxPlayers}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry Fee
              </label>
              <p className="text-gray-900 text-lg font-semibold">
                {formatCurrency(game.entryFee)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Win Condition
              </label>
              <p className="text-gray-900 uppercase font-semibold">
                {game.winType || "standard"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prize Pool
              </label>
              <p className="text-gray-900 text-lg font-semibold">
                {formatCurrency(game.prizePool)}
              </p>
            </div>

            {game.winnerId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Winner ID
                </label>
                <p className="text-gray-900">{game.winnerId}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created At
              </label>
              <p className="text-gray-900">{formatDate(game.createdAt)}</p>
            </div>

            {game.startedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Started At
                </label>
                <p className="text-gray-900">{formatDate(game.startedAt)}</p>
              </div>
            )}

            {game.completedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Completed At
                </label>
                <p className="text-gray-900">{formatDate(game.completedAt)}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href={`/games/${game.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Game
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

