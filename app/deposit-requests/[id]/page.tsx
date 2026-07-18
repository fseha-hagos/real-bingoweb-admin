"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { apiService, DepositRequest } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, CheckCircle, XCircle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/rbac";

export default function DepositRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;
  const { can } = usePermissions();
  const [request, setRequest] = useState<DepositRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (requestId) {
      loadRequest();
    }
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const data = await apiService.getDepositRequest(requestId);
      setRequest(data);
    } catch (err: any) {
      console.error("Failed to load request:", err);
      alert("Failed to load request: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!request) return;
    try {
      setProcessing(true);
      await apiService.approveDepositRequest(request.id, notes);
      alert("Request approved successfully!");
      router.push("/deposit-requests");
    } catch (err: any) {
      alert("Failed to approve request: " + err.message);
    } finally {
      setProcessing(false);
      setShowApproveModal(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    if (!notes.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    try {
      setProcessing(true);
      await apiService.rejectDepositRequest(request.id, notes);
      alert("Request rejected successfully!");
      router.push("/deposit-requests");
    } catch (err: any) {
      alert("Failed to reject request: " + err.message);
    } finally {
      setProcessing(false);
      setShowRejectModal(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading request...</div>
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Request not found
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Link
          href="/deposit-requests"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Requests
        </Link>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {request.type === "deposit" ? (
                <ArrowDownCircle className="w-8 h-8 text-green-600" />
              ) : (
                <ArrowUpCircle className="w-8 h-8 text-blue-600" />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 capitalize">
                  {request.type} Request
                </h1>
                <p className="text-sm text-gray-500">Request ID: {request.id}</p>
              </div>
            </div>
            <span
              className={`px-4 py-2 text-sm rounded-full font-medium ${getStatusColor(
                request.status
              )}`}
            >
              {request.status.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <p
                className={`text-2xl font-bold ${request.type === "deposit" ? "text-green-600" : "text-blue-600"
                  }`}
              >
                {request.type === "deposit" ? "+" : "-"}
                {formatCurrency(request.amount)}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <p className="text-lg text-gray-900">{request.phoneNumber || "N/A"}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <p className="text-lg font-medium text-gray-900">
                {request.user?.username ||
                  `${request.user?.firstName || ""} ${request.user?.lastName || ""}`.trim() ||
                  "N/A"}
              </p>
              <p className="text-sm text-gray-500">Telegram ID: {request.user?.telegramId}</p>
              {request.user && (
                <p className="text-sm text-gray-500">
                  Balance: {formatCurrency(request.user.balance)}
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
              <p className="text-lg text-gray-900">{formatDate(request.createdAt)}</p>
            </div>

            {request.processedAt && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Processed At</label>
                <p className="text-lg text-gray-900">{formatDate(request.processedAt)}</p>
              </div>
            )}

            {request.processedBy && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Processed By</label>
                <p className="text-lg text-gray-900">{request.processedBy}</p>
              </div>
            )}

            {request.adminNotes && (
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes
                </label>
                <p className="text-gray-900">{request.adminNotes}</p>
              </div>
            )}
          </div>

          {request.status === "pending" && can(PERMISSIONS.APPROVE_DEPOSITS) && (
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowApproveModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Request
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                <XCircle className="w-5 h-5" />
                Reject Request
              </button>
            </div>
          )}
        </div>

        {/* Approve Modal */}
        {showApproveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Approve Request</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to approve this {request.type} request?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this approval..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Confirm Approve"}
                </button>
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setNotes("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Reject Request</h2>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting this {request.type} request.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleReject}
                  disabled={processing || !notes.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Confirm Reject"}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setNotes("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

