"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from "recharts";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Mock data for now - replace with actual API call
      const data = {
        dailyRevenue: [
          { date: "Mon", revenue: 450 },
          { date: "Tue", revenue: 520 },
          { date: "Wed", revenue: 480 },
          { date: "Thu", revenue: 610 },
          { date: "Fri", revenue: 550 },
          { date: "Sat", revenue: 720 },
          { date: "Sun", revenue: 680 },
        ],
        gameStatus: [
          { status: "Completed", count: 45 },
          { status: "Active", count: 12 },
          { status: "Pending", count: 8 },
          { status: "Cancelled", count: 3 },
        ],
        userGrowth: [
          { month: "Jan", users: 120 },
          { month: "Feb", users: 180 },
          { month: "Mar", users: 240 },
          { month: "Apr", users: 310 },
          { month: "May", users: 380 },
          { month: "Jun", users: 450 },
        ],
      };
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </Layout>
    );
  }

  if (!stats) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed analytics and insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-500">Daily Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-500">Game Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.gameStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-blue-500">User Growth</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}

