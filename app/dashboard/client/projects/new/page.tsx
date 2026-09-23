"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FaArrowLeft, FaPlus, FaTimes } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const CATEGORIES = [
  "Web Development", "Mobile App", "UI/UX Design", "AI & ML",
  "Content Writing", "Backend", "DevOps", "Data Science",
  "Video Editing", "Digital Marketing",
];

const EXPERIENCE_LEVELS = ["Any", "Entry", "Intermediate", "Expert"];
const DURATIONS = ["Less than 1 week", "1–2 weeks", "1 month", "1–3 months", "3–6 months", "More than 6 months"];

function PostProjectForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    skills: [] as string[],
    projectType: "fixed" as "fixed" | "hourly",
    budgetMin: "",
    budgetMax: "",
    deadline: "",
    duration: "",
    experienceLevel: "Any",
  });

  const set = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s) && form.skills.length < 15) {
      set("skills", [...form.skills, s]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => set("skills", form.skills.filter((x) => x !== s));

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
  };

  const handleSubmit = async (e: FormEvent, publish: boolean) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error("Title and description are required.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const body = {
        ...form,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : null,
        deadline: form.deadline || null,
      };

      const res = await fetch(`${API}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to create project.");

      const projectId = data.data._id;

      if (publish) {
        const pubRes = await fetch(`${API}/api/projects/${projectId}/publish`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const pubData = await pubRes.json();
        if (!pubRes.ok) throw new Error(pubData.error?.message || "Failed to publish.");
        toast.success("Project published successfully!");
      } else {
        toast.success("Project saved as draft.");
      }

      router.push("/dashboard/client/projects");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#08080d] text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard/client/projects" className="inline-flex items-center gap-2 text-[#9090aa] text-sm hover:text-white transition-colors mb-6">
          <FaArrowLeft className="text-xs" /> My Projects
        </Link>

        <h1 className="text-2xl font-bold mb-1">Post a New Project</h1>
        <p className="text-[#9090aa] text-sm mb-8">Describe your project to attract the right freelancers.</p>

        <form className="flex flex-col gap-5">
          {/* Title */}
          <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
            <label className="block text-sm font-semibold text-white mb-3">Project Title <span className="text-[#ff6a9e]">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Build a React dashboard with TypeScript"
              maxLength={120}
              className="w-full px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-sm text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 transition-colors"
            />
            <p className="text-xs text-[#68687d] mt-1.5">{form.title.length}/120</p>
          </div>

          {/* Description */}
          <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
            <label className="block text-sm font-semibold text-white mb-3">Description <span className="text-[#ff6a9e]">*</span></label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe your project in detail — what you need, the scope, deliverables, and any specific requirements..."
              rows={7}
              className="w-full px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-sm text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 transition-colors resize-none"
            />
          </div>

          {/* Category + Project Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <label className="block text-sm font-semibold text-white mb-3">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#7c6aff]/50"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <label className="block text-sm font-semibold text-white mb-3">Project Type</label>
              <div className="flex gap-2">
                {(["fixed", "hourly"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("projectType", t)}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all ${form.projectType === t ? "bg-[#7c6aff]/15 border-[#7c6aff] text-white" : "bg-[#0d0d14] border-white/10 text-[#9090aa] hover:border-white/20"}`}
                  >
                    {t === "fixed" ? "Fixed Price" : "Hourly Rate"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
            <label className="block text-sm font-semibold text-white mb-3">
              Budget {form.projectType === "hourly" ? "($/hr)" : "($)"}
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="number"
                value={form.budgetMin}
                onChange={(e) => set("budgetMin", e.target.value)}
                placeholder="Min"
                min={0}
                className="flex-1 px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-sm text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50"
              />
              <span className="text-[#68687d] text-sm">–</span>
              <input
                type="number"
                value={form.budgetMax}
                onChange={(e) => set("budgetMax", e.target.value)}
                placeholder="Max"
                min={0}
                className="flex-1 px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-sm text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50"
              />
            </div>
          </div>

          {/* Skills */}
          <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
            <label className="block text-sm font-semibold text-white mb-3">Required Skills</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Type a skill and press Enter"
                className="flex-1 px-4 py-2.5 bg-[#0d0d14] border border-white/10 rounded-xl text-sm text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2.5 text-xs font-semibold text-[#7c6aff] border border-[#7c6aff]/30 rounded-xl hover:bg-[#7c6aff]/10 transition-all flex items-center gap-1.5"
              >
                <FaPlus className="text-[10px]" /> Add
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.skills.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 text-xs bg-[#7c6aff]/10 border border-[#7c6aff]/20 text-[#a99aff] px-3 py-1 rounded-full">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="text-[#9090aa] hover:text-white transition-colors">
                      <FaTimes className="text-[9px]" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Experience + Duration + Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <label className="block text-sm font-semibold text-white mb-3">Experience Level</label>
              <select
                value={form.experienceLevel}
                onChange={(e) => set("experienceLevel", e.target.value)}
                className="w-full px-3 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#7c6aff]/50"
              >
                {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <label className="block text-sm font-semibold text-white mb-3">Duration</label>
              <select
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                className="w-full px-3 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#7c6aff]/50"
              >
                <option value="">Select duration</option>
                {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <label className="block text-sm font-semibold text-white mb-3">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-sm text-white outline-none focus:border-[#7c6aff]/50 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={loading}
              className="flex-1 py-3.5 text-sm font-semibold text-white border border-white/15 rounded-xl hover:bg-white/5 disabled:opacity-50 transition-all"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={loading}
              className="flex-1 py-3.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_20px_rgba(124,106,255,0.3)] disabled:opacity-50 transition-all"
            >
              {loading ? "Publishing..." : "Publish Project"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function PostProjectPage() {
  return (
    <ProtectedRoute allowedRoles={["Client"]}>
      <PostProjectForm />
    </ProtectedRoute>
  );
}
