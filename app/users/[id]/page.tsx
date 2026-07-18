"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { apiService, User } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, UserPlus, History, DollarSign } from "lucide-react";
import AdjustBalanceModal from "@/components/AdjustBalanceModal";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      const data = await apiService.getUser(userId);
      setUser(data);
    } catch (err: any) {
      console.error("Failed to load user:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading user...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          User not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Link
          href="/users"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Link>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h1 className="text-3xl font-bold mb-6">User Details</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <p className="text-gray-900">{user.username || "N/A"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <p className="text-gray-900">{user.firstName || "N/A"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <p className="text-gray-900">{user.lastName || "N/A"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telegram ID
              </label>
              <p className="text-gray-900">{user.telegramId}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Balance
              </label>
              <div className="flex items-center gap-4">
                <p className="text-gray-900 text-lg font-semibold">
                  {formatCurrency(user.balance)}
                </p>
                <button
                  onClick={() => setIsAdjustModalOpen(true)}
                  className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                >
                  Adjust Balance
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <span
                className={`px-3 py-1 rounded-full text-sm ${user.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
                  }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Games
              </label>
              <p className="text-gray-900">{user.stats?.totalGames || 0}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wins
              </label>
              <p className="text-gray-900">{user.stats?.totalWins || 0}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Win Rate
              </label>
              <p className="text-gray-900">
                {(user.stats?.totalGames || 0) > 0
                  ? (((user.stats?.totalWins || 0) / (user.stats?.totalGames || 1)) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joined At
              </label>
              <p className="text-gray-900">{formatDate(user.createdAt)}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href={`/users/${user.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit User
            </Link>
          </div>
        </div>

        {/* Referred Users Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold">Referred Users</h2>
          </div>

          {user.referredUsers && user.referredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                  <tr>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Telegram ID</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {user.referredUsers.map((referred) => (
                    <tr key={referred.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link href={`/users/${referred.id}`} className="text-blue-600 hover:underline">
                          {referred.username || "N/A"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{referred.telegramId}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {referred.createdAt ? formatDate(referred.createdAt) : "N/A"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(referred.balance || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">No users referred yet.</p>
          )}
        </div>

        {/* Recent Transactions Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold">Recent Transactions</h2>
          </div>

          {(user as any).recentTransactions && (user as any).recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700 font-medium border-b">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(user as any).recentTransactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 uppercase text-xs font-bold">
                        <span className={`px-2 py-0.5 rounded-full ${tx.type === 'deposit' ? 'bg-green-100 text-green-800' :
                          tx.type === 'withdrawal' ? 'bg-red-100 text-red-800' :
                            tx.type === 'admin_adjustment' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-medium ${tx.type === 'deposit' || (tx.type === 'admin_adjustment' && tx.amount > 0) ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{tx.status}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {tx.createdAt ? formatDate(tx.createdAt) : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">No transactions recorded yet.</p>
          )}
        </div>
      </div>

      <AdjustBalanceModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        userId={user.id}
        username={user.username || user.telegramId}
        onSuccess={(newBalance) => {
          setUser({ ...user, balance: newBalance });
          loadUser();
        }}
      />
    </Layout>
  );
}
