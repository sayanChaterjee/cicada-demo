"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Game {
  _id: string;
  totalPoints: number;
  gameStartTime: string;
  gameEndTime: string;
  stages: any[];
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/admin/games");
      const data = await res.json();
      if (data.success) {
        setGames(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch games", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;
    try {
      const res = await fetch(`/api/admin/games/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchGames();
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting game");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-white">Loading Games...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-4 mb-8">
          <Link href="/admin" className="text-zinc-400 hover:text-white pb-2 flex-1 text-center font-bold border-b border-zinc-800 hover:border-zinc-400 transition">
            Stages
          </Link>
          <div className="text-green-500 pb-2 flex-1 text-center font-bold border-b-2 border-green-500">
            Games
          </div>
        </div>

        <div className="flex justify-between items-center mb-8 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-green-500">Games Administration</h1>
          <Link
            href="/admin/games/create"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Create New Game
          </Link>
        </div>

        {games.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 bg-zinc-900/50 rounded-lg border border-zinc-800">
            No games found. Create your first game.
          </div>
        ) : (
          <div className="grid gap-4">
            {games.map((game, index) => (
              <div
                key={game._id}
                className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-green-500">
                    G{index + 1}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold w-[28rem] truncate text-white">
                      {new Date(game.gameStartTime).toLocaleString()} - {new Date(game.gameEndTime).toLocaleString()}
                    </h2>
                    <div className="flex gap-4 text-sm text-zinc-400 mt-1">
                      <span>Total Points: {game.totalPoints}</span>
                      <span>Stages: {game.stages?.length || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/games/${game._id}/edit`}
                    className="text-sm border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white px-4 py-2 rounded transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(game._id)}
                    className="text-sm bg-red-900/40 text-red-500 hover:bg-red-900 hover:text-white px-4 py-2 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
