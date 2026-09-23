"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FaPlus, FaBolt, FaClock, FaUsers } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-white/5 text-[#9090aa] border-white/10",
  Published: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Hiring: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  "In Progress": "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Completed: "bg-green-500/15 text-green-400 border-green-500/20",
  Cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  Suspended: "bg-orange-500/15 text-orange-400 border-orange-500/20",
};

const TABS = ["All", "Draft", "Published", "Hiring", "In Progress", "Completed", "Cancelled"];

interface Project {
  _id: string;
  title: string;
  category: string;
  projectType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  status: string;
  proposalCount: number;
  createdAt: string;
  skills: string[];
}

function ClientProjectsContent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ myProjects: "true" });
      if (activeTab !== "All") params.set("status", activeTab);
      const res = await fetch(`${API}/api/projects?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch {
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { void fetchProjects(); }, [fetchProjects]);

  const doPublish = async (id: string) => {
    setActionId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/projects/${id}/publish`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to publish.");
      toast.success("Project published!");
      setProjects((prev) => prev.map((p) => p._id === id ? { ...p, status: "Published" } : p));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setActionId(null);
    }
  };

  const doCancel = async (id: string) => {
    if (!confirm("Cancel this project? This cannot be undone.")) return;
    setActionId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/projects/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to cancel.");
      toast.success("Project cancelled.");
      setProjects((prev) => prev.map((p) => p._id === id ? { ...p, status: "Cancelled" } : p));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setActionId(null);
    }
  };

  const formatBudget = (p: Project) => {
    if (p.projectType === "hourly") return p.budgetMin ? `$${p.budgetMin}/hr` : "Hourly";
    if (p.budgetMin && p.budgetMax) return `$${p.budgetMin.toLocaleString()} – $${p.budgetMax.toLocaleString()}`;
    return "Budget TBD";
  };

  return (
    <main className="min-h-screen bg-[#08080d] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">My Projects</h1>
            <p className="text-[#9090aa] text-sm">Manage all your posted projects.</p>
          </div>
          <Link
            href="/dashboard/client/projects/new"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_15px_rgba(124,106,255,0.3)] transition-all"
          >
            <FaPlus className="text-xs" /> Post Project
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${activeTab === tab ? "bg-[#7c6aff]/15 border-[#7c6aff] text-white" : "bg-[#13131a] border-white/10 text-[#9090aa] hover:border-white/20 hover:text-white"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-[#9090aa]">
            <p className="text-lg mb-2">No projects yet</p>
            <p className="text-sm mb-6">Post your first project to start receiving proposals.</p>
            <Link
              href="/dashboard/client/projects/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e]"
            >
              <FaPlus className="text-xs" /> Post a Project
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map((p) => (
              <div key={p._id} className="bg-[#13131a] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[p.status] || "bg-white/5 text-white border-white/10"}`}>
                        {p.status}
                      </span>
                      {p.category && (
                        <span className="text-xs text-[#7c6aff]">{p.category}</span>
                      )}
                      <span className="text-xs text-[#68687d]">
                        <FaClock className="inline text-[9px] mr-1" />
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Link
                      href={`/projects/${p._id}`}
                      className="text-base font-semibold text-white hover:text-[#a99aff] transition-colors block mb-2 line-clamp-1"
                    >
                      {p.title}
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-[#9090aa]">
                      <span className="font-medium text-white">{formatBudget(p)}</span>
                      <span className="flex items-center gap-1">
                        <FaUsers className="text-[9px]" /> {p.proposalCount} proposals
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {p.status === "Draft" && (
                      <button
                        onClick={() => doPublish(p._id)}
                        disabled={actionId === p._id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_10px_rgba(124,106,255,0.3)] disabled:opacity-50 transition-all flex items-center gap-1"
                      >
                        <FaBolt className="text-[9px]" /> Publish
                      </button>
                    )}
                    {["Published", "Hiring"].includes(p.status) && (
                      <>
                        <Link
                          href={`/dashboard/client/proposals?projectId=${p._id}`}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-[#7c6aff]/30 text-[#7c6aff] hover:bg-[#7c6aff]/10 transition-all"
                        >
                          Proposals
                        </Link>
                        <button
                          onClick={() => doCancel(p._id)}
                          disabled={actionId === p._id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {["In Progress", "Completed"].includes(p.status) && (
                      <Link
                        href="/dashboard/client/contracts"
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-white/15 text-[#9090aa] hover:text-white hover:border-white/25 transition-all"
                      >
                        Contracts
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ClientProjectsPage() {
  return (
    <ProtectedRoute allowedRoles={["Client"]}>
      <ClientProjectsContent />
    </ProtectedRoute>
  );
}
