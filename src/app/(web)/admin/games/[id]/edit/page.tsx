"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Stage {
  _id: string;
  stageId: number;
  question: string;
  points: number;
}

export default function EditGamePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [availableStages, setAvailableStages] = useState<Stage[]>([]);
  
  const [formData, setFormData] = useState({
    totalPoints: 100,
    gameStartTime: "",
    gameEndTime: "",
    stages: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stagesRes, gameRes] = await Promise.all([
          fetch("/api/admin/stages"),
          fetch(`/api/admin/games/${id}`)
        ]);
        
        const stagesData = await stagesRes.json();
        const gameData = await gameRes.json();

        if (stagesData.success) {
          setAvailableStages(stagesData.data);
        }

        if (gameData.success && gameData.data) {
          const game = gameData.data;
          
          // Format dates to YYYY-MM-DDTHH:MM format required by datetime-local
          const formatDate = (dateString: string) => {
            if (!dateString) return "";
            const d = new Date(dateString);
            return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          };

          setFormData({
            totalPoints: game.totalPoints || 100,
            gameStartTime: formatDate(game.gameStartTime),
            gameEndTime: formatDate(game.gameEndTime),
            stages: game.stages ? game.stages.map((s: any) => s._id || s) : [],
          });
        } else {
          alert("Game not found");
          router.push("/admin/games");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    
    loadData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "totalPoints" ? Number(value) : value,
    }));
  };

  const handleStageToggle = (stageId: string) => {
    setFormData((prev) => {
      const stages = prev.stages.includes(stageId)
        ? prev.stages.filter((id) => id !== stageId)
        : [...prev.stages, stageId];
      return { ...prev, stages };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/games");
      } else {
        alert(data.message || "Failed to update game");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="min-h-screen bg-black text-white p-8 text-center pt-20">Loading Game Data...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/games" className="text-zinc-400 hover:text-white transition flex items-center gap-2 mb-4">
            ← Back to Games
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-green-500">Edit Game</h1>
          <p className="text-zinc-500 mt-2">Modify the game details and included stages.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Total Points</label>
            <input
              type="number"
              name="totalPoints"
              value={formData.totalPoints}
              onChange={handleChange}
              required
              min={1}
              className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Start Time</label>
              <input
                type="datetime-local"
                name="gameStartTime"
                value={formData.gameStartTime}
                onChange={handleChange}
                required
                className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 transition style-picker-dark"
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">End Time</label>
              <input
                type="datetime-local"
                name="gameEndTime"
                value={formData.gameEndTime}
                onChange={handleChange}
                required
                className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 transition style-picker-dark"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium text-zinc-300">Include Stages</label>
            {availableStages.length === 0 ? (
              <p className="text-sm text-zinc-500">No stages found. Create some stages first.</p>
            ) : (
              <div className="grid gap-2 max-h-64 overflow-y-auto border border-zinc-800 p-2 rounded bg-black">
                {availableStages.map((stage) => (
                  <label key={stage._id} className="flex items-center gap-3 p-2 hover:bg-zinc-900 rounded cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={formData.stages.includes(stage._id)}
                      onChange={() => handleStageToggle(stage._id)}
                      className="w-4 h-4 accent-green-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm text-zinc-300 font-medium">Stage #{stage.stageId}</div>
                      <div className="text-xs text-zinc-500 truncate">{stage.question || "No description"}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-4">
            <Link
              href="/admin/games"
              className="px-4 py-2 text-zinc-300 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
