"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { apiService, DashboardStats } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  Gamepad2,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await apiService.getDashboardStats();
      console.log("Dashboard Stats Received in Component:", data);
      console.log("Transactions data sub-object:", data?.transactions);

      // Data is already mapped by the API service, just ensure arrays are defined
      if (data) {
        setStats({
          ...data,
          recentGames: data.recentGames || [],
        });
      }
    } catch (err: any) {
      console.error("Failed to load dashboard stats:", err);
      setError(err.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </Layout>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Users",
      value: stats.users?.total || 0,
      icon: Users,
      color: "bg-blue-500",
      change: `+${stats.users?.referrals || 0} referrals`,
    },
    {
      title: "Total Games",
      value: stats.games?.total || 0,
      icon: Gamepad2,
      color: "bg-green-500",
      change: `${stats.games?.active || 0} active`,
    },
    {
      title: "House Profit",
      value: formatCurrency(stats.transactions?.profit || 0),
      icon: TrendingUp,
      color: "bg-purple-500",
      change: `Bets: ${formatCurrency(stats.transactions?.bets || 0)}`,
    },
    {
      title: "Total Users Balance",
      value: formatCurrency(stats.users?.totalBalance || 0),
      icon: DollarSign,
      color: "bg-amber-500",
      change: "Held by players",
    },
  ];

  const financialCards = [
    {
      title: "Total Deposits",
      value: formatCurrency(stats.transactions?.deposits || 0),
      color: "text-green-600",
    },
    {
      title: "Total Withdrawals",
      value: formatCurrency(stats.transactions?.withdrawals || 0),
      color: "text-red-600",
    },
    {
      title: "Total Bets",
      value: formatCurrency(stats.transactions?.bets || 0),
      color: "text-blue-600",
    },
    {
      title: "Total Wins",
      value: formatCurrency(stats.transactions?.wins || 0),
      color: "text-amber-600",
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your bingo bot</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold mt-2 text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.change}</p>
                  </div>
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Overview Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Financial Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {financialCards.map((card, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Recent Games</h2>
            <div className="space-y-3">
              {stats.recentGames && stats.recentGames.length > 0 ? (
                stats.recentGames.slice(0, 5).map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{game.name || `Game ${game.id.substring(0, 5)}`}</p>
                      <p className="text-sm text-gray-600">
                        {game.playersCount || 0} players
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(game.prizePool || 0)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${game.status === "active"
                          ? "bg-green-100 text-green-800"
                          : game.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {game.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent games</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Latest Activity</h2>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">Total Games Played</span>
                  <span className="text-2xl font-bold text-blue-900">{stats.games?.finished || 0}</span>
                </div>
              </div>
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-green-700 font-medium">Total Referrals</span>
                  <span className="text-2xl font-bold text-green-900">{stats.users?.referrals || 0}</span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-purple-700 font-medium">Total Transactions</span>
                  <span className="text-2xl font-bold text-purple-900">{stats.transactions?.total || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

