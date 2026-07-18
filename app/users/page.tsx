"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { apiService, User } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Edit, Trash2, Eye, ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import Link from "next/link";
import * as XLSX from 'xlsx';

type SortField = 'username' | 'telegramId' | 'balance' | 'totalGames' | 'totalWins' | 'isActive' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    loadUsers();
  }, [page, search, sortBy, sortOrder]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsers({
        page,
        limit: 20,
        search,
        sortBy,
        sortOrder
      });

      // Handle nested structure: data.users and data.pagination
      if (data && data.users) {
        setUsers(data.users);
        setTotalPages(data.pagination?.totalPages || data.totalPages || 1);
      } else if (Array.isArray(data)) {
        // Fallback if data is directly an array
        setUsers(data);
        setTotalPages(1);
      } else {
        setUsers([]);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default descending order
      setSortBy(field);
      setSortOrder('desc');
    }
    // Reset to first page when sorting changes
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-40" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="w-4 h-4 ml-1" />
      : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const exportToCSV = async () => {
    try {
      // Fetch all users with current filters (no pagination limit)
      const data = await apiService.getUsers({
        limit: 10000, // Get all users
        search,
        sortBy,
        sortOrder
      });

      const usersToExport = data?.users || data || [];

      // Format data for CSV
      const csvData = usersToExport.map((user: User) => ({
        'Username': user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        'Telegram ID': user.telegramId,
        'Balance': user.balance,
        'Total Games': user.stats?.totalGames || 0,
        'Total Wins': user.stats?.totalWins || 0,
        'Total Earnings': user.stats?.totalEarnings || 0,
        'Referral Count': user.stats?.referralCount || 0,
        'Status': user.isActive ? 'Active' : 'Inactive',
        'Role': user.role,
        'Email': user.email || 'N/A',
        'Phone Number': user.phoneNumber || 'N/A',
        'Created At': formatDate(user.createdAt),
        'Updated At': formatDate(user.updatedAt),
      }));

      // Convert to CSV
      const worksheet = XLSX.utils.json_to_sheet(csvData);
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const exportToExcel = async () => {
    try {
      // Fetch all users with current filters (no pagination limit)
      const data = await apiService.getUsers({
        limit: 10000, // Get all users
        search,
        sortBy,
        sortOrder
      });

      const usersToExport = data?.users || data || [];

      // Format data for Excel
      const excelData = usersToExport.map((user: User) => ({
        'Username': user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A',
        'Telegram ID': user.telegramId,
        'Balance': user.balance,
        'Total Games': user.stats?.totalGames || 0,
        'Total Wins': user.stats?.totalWins || 0,
        'Total Earnings': user.stats?.totalEarnings || 0,
        'Referral Count': user.stats?.referralCount || 0,
        'Status': user.isActive ? 'Active' : 'Inactive',
        'Role': user.role,
        'Email': user.email || 'N/A',
        'Phone Number': user.phoneNumber || 'N/A',
        'Created At': formatDate(user.createdAt),
        'Updated At': formatDate(user.updatedAt),
      }));

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

      // Auto-size columns
      const maxWidth = 50;
      const colWidths = Object.keys(excelData[0] || {}).map(key => ({
        wch: Math.min(Math.max(key.length, 10), maxWidth)
      }));
      worksheet['!cols'] = colWidths;

      // Download Excel
      XLSX.writeFile(workbook, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err: any) {
      alert('Failed to export Excel: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await apiService.deleteUser(id);
      loadUsers();
    } catch (err: any) {
      alert("Failed to delete user: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">Manage all users</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by username or telegram ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('username')}
                      >
                        <div className="flex items-center">
                          User
                          <SortIcon field="username" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('telegramId')}
                      >
                        <div className="flex items-center">
                          Telegram ID
                          <SortIcon field="telegramId" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('balance')}
                      >
                        <div className="flex items-center">
                          Balance
                          <SortIcon field="balance" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('totalGames')}
                      >
                        <div className="flex items-center">
                          Games
                          <SortIcon field="totalGames" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('totalWins')}
                      >
                        <div className="flex items-center">
                          Wins
                          <SortIcon field="totalWins" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort('isActive')}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIcon field="isActive" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.username || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(user.createdAt)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.telegramId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(user.balance)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.stats?.totalGames || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.stats?.totalWins || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/users/${user.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/users/${user.id}/edit`}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-gray-700 hover:bg-gray-50 bg-white"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-gray-700 hover:bg-gray-50 bg-white"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

