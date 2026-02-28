"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stage {
  _id: string;
  stageId: number;
  question: string;
  points: number;
  image: string[];
}

export default function AdminStagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const res = await fetch("/api/admin/stages");
      const data = await res.json();
      if (data.success) {
        setStages(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stages", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stage?")) return;
    try {
      const res = await fetch(`/api/admin/stages/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchStages();
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting stage");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-white">Loading Stages...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-4 mb-8">
          <div className="text-green-500 pb-2 flex-1 text-center font-bold border-b-2 border-green-500">
            Stages
          </div>
          <Link href="/admin/games" className="text-zinc-400 hover:text-white pb-2 flex-1 text-center font-bold border-b border-zinc-800 hover:border-zinc-400 transition">
            Games
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8 pb-4">
          <h1 className="text-3xl font-bold tracking-tight text-green-500">Stages Administration</h1>
          <Link
            href="/admin/stages/create"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Create New Stage
          </Link>
        </div>

        {stages.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 bg-zinc-900/50 rounded-lg border border-zinc-800">
            No stages found. Create your first stage.
          </div>
        ) : (
          <div className="grid gap-4">
            {stages.map((stage) => (
              <div
                key={stage._id}
                className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-green-500">
                    #{stage.stageId}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold w-96 truncate" title={stage.question}>
                      {stage.question || "No specific text"}
                    </h2>
                    <div className="flex gap-4 text-sm text-zinc-400 mt-1">
                      <span>Points: {stage.points}</span>
                      <span className="truncate max-w-sm">Images: {Array.isArray(stage.image) ? stage.image.join(", ") : stage.image || "None"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/stages/${stage._id}/edit`}
                    className="text-sm border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white px-4 py-2 rounded transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(stage._id)}
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
