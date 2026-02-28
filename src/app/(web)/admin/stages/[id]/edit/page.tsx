"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function EditStagePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    stageId: 1,
    question: "",
    answer: "",
    points: 10,
    hint: "",
    image: [] as string[],
  });

  useEffect(() => {
    const fetchStage = async () => {
      try {
        const res = await fetch(`/api/admin/stages/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setFormData({
            stageId: data.data.stageId || 1,
            question: data.data.question || "",
            answer: data.data.answer || "",
            points: data.data.points || 10,
            hint: data.data.hint || "",
            image: Array.isArray(data.data.image) ? data.data.image : (data.data.image ? [data.data.image] : []),
          });
        } else {
          alert("Stage not found");
          router.push("/admin");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchStage();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        [name]: value.split(",").map((s) => s.trim()).filter(Boolean),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "stageId" || name === "points" ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/stages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        alert(data.message || "Failed to update stage");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting form");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="min-h-screen bg-black text-white p-8 text-center pt-20">Loading Stage Data...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-zinc-400 hover:text-white transition flex items-center gap-2 mb-4">
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-green-500">Edit Stage #{formData.stageId}</h1>
          <p className="text-zinc-500 mt-2">Update challenge details.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Stage ID (Order)</label>
              <input
                type="number"
                name="stageId"
                value={formData.stageId}
                onChange={handleChange}
                required
                min={1}
                className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Points</label>
              <input
                type="number"
                name="points"
                value={formData.points}
                onChange={handleChange}
                required
                min={1}
                className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Question Text</label>
            <div className="bg-white text-black rounded overflow-hidden">
              <ReactQuill
                theme="snow"
                value={formData.question}
                onChange={(content: string) => setFormData(prev => ({ ...prev, question: content }))}
                className="h-48 mb-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Expected Answer</label>
            <input
              type="text"
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              required
              placeholder="Exact string or number"
              className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Hint (Optional)</label>
            <input
              type="text"
              name="hint"
              value={formData.hint}
              onChange={handleChange}
              placeholder="Clue to help solve"
              className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Image URLs (Optional) (Comma separated, e.g. Cloudinary URLs)
            </label>
            <input
              type="text"
              name="image"
              value={formData.image.join(", ")}
              onChange={handleChange}
              placeholder="e.g., https://res.cloudinary.com/.../image.png"
              className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-green-500 transition"
            />
            {formData.image.length > 0 && (
              <div className="mt-4 p-4 border border-zinc-800 rounded bg-black">
                <p className="text-xs text-zinc-500 mb-2">Image Previews:</p>
                <div className="flex gap-4 flex-wrap">
                  {formData.image.map((imgSrc, idx) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={idx} src={imgSrc} alt={`Preview ${idx + 1}`} className="max-w-full h-auto max-h-48 object-contain rounded border border-zinc-800" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end gap-4">
            <Link
              href="/admin"
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
