"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { apiService, BingoCard } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Search } from "lucide-react";

export default function BingoCardsPage() {
  const [cards, setCards] = useState<BingoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameFilter, setGameFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadCards();
  }, [page, gameFilter, userFilter]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBingoCards({
        page,
        limit: 20,
        gameSessionId: gameFilter || undefined,
        userId: userFilter || undefined,
      });
      setCards(data.cards || data);
    } catch (err: any) {
      console.error("Failed to load bingo cards:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (card: BingoCard) => {
    return (
      <div className="grid grid-cols-5 gap-1 p-2 border-2 border-gray-300">
        {card.numbers.map((row, rowIdx) =>
          row.map((num, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              className="aspect-square flex items-center justify-center text-xs font-medium border border-gray-200"
            >
              {num}
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bingo Cards</h1>
          <p className="text-gray-600 mt-1">View all bingo cards</p>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Game Session ID..."
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <input
              type="text"
              placeholder="User ID..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading cards...</div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.length > 0 ? (
                  cards.map((card) => (
                    <div
                      key={card.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">Card ID: {card.id}</p>
                        <p className="text-sm text-gray-600">
                          Game: {card.gameSessionId}
                        </p>
                        <p className="text-sm text-gray-600">User: {card.userId}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(card.createdAt)}
                        </p>
                        {card.isWinner && (
                          <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            Winner
                          </span>
                        )}
                      </div>
                      {renderCard(card)}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    No bingo cards found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

