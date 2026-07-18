"use client";

import { useState } from "react";
import { Tournament, apiService } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Calendar, AlertCircle } from "lucide-react";

interface ActivationModalProps {
    tournament: Tournament;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ActivationModal({
    tournament,
    isOpen,
    onClose,
    onSuccess,
}: ActivationModalProps) {
    const [startAt, setStartAt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!startAt) {
            setError("Please select a start time");
            return;
        }

        const startDate = new Date(startAt);
        const now = new Date();
        // Add 5 minutes buffer check
        if (startDate.getTime() < now.getTime() + 5 * 60 * 1000) {
            setError("Start time must be at least 5 minutes in the future");
            return;
        }

        try {
            setLoading(true);
            await apiService.activateTournament(tournament.id, {
                startAt: startDate.toISOString(),
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(
                err.response?.data?.error || err.message || "Failed to activate tournament"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        Activate Tournament Game
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        This will create a new game instance from the template.
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Game Summary</h4>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p>Type: <span className="font-medium">Full House</span></p>
                            <p>Buy-in: <span className="font-medium">{formatCurrency(tournament.betAmount)}</span></p>
                            <p>Prize Pool: <span className="font-medium">{formatCurrency(tournament.prizePool)}</span></p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="datetime-local"
                                    required
                                    value={startAt}
                                    onChange={(e) => setStartAt(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Must be at least 5 minutes in the future
                            </p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                <AlertCircle className="w-4 h-4" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Create Instance"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
