"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_STYLES: Record<string, string> = {
  Submitted: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Viewed: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  Shortlisted: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Interview: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  Accepted: "bg-green-500/15 text-green-400 border-green-500/20",
  Rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  Withdrawn: "bg-[#9090aa]/15 text-[#9090aa] border-white/10",
  Expired: "bg-[#9090aa]/15 text-[#9090aa] border-white/10",
};

const TABS = ["All", "Submitted", "Viewed", "Shortlisted", "Interview", "Accepted", "Rejected"];

interface Proposal {
  _id: string;
  freelancerId: string;
  projectId: string;
  coverLetter: string;
  proposedPrice: number;
  deliveryDays: number;
  status: string;
  createdAt: string;
}

function ClientProposalDashboard() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchProposals = async (status?: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const query = status && status !== "All" ? `?status=${status}` : "";
      const res = await fetch(`${API}/api/proposals${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProposals(data.data);
    } catch {
      toast.error("Failed to load proposals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(() => fetchProposals(activeTab));
  }, [activeTab]);

  const doAction = async (id: string, action: string) => {
    if (action === "accept" && !confirm("Accept this proposal? A contract will be created automatically.")) return;
    setActionId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/proposals/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Failed to ${action} proposal.`);

      const newStatus = action === "shortlist" ? "Shortlisted"
        : action === "interview" ? "Interview"
        : action === "reject" ? "Rejected"
        : "Accepted";

      toast.success(data.message);
      setProposals((prev) => prev.map((p) => p._id === id ? { ...p, status: newStatus } : p));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setActionId(null);
    }
  };

  const filtered = activeTab === "All" ? proposals : proposals.filter((p) => p.status === activeTab);

  return (
    <main className="min-h-screen bg-[#08080d] px-4 py-10 text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Proposals</h1>
        <p className="text-[#9090aa] text-sm mb-6">Review and manage proposals from freelancers.</p>

        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                activeTab === tab
                  ? "bg-[#7c6aff]/15 border-[#7c6aff] text-white"
                  : "bg-[#13131a] border-white/10 text-[#9090aa] hover:border-white/20 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-[#9090aa]">
            <p className="text-lg mb-2">No proposals found</p>
            <p className="text-sm">Proposals will appear here once freelancers apply.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((p) => (
              <div key={p._id} className="bg-[#13131a] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[p.status] || "bg-white/5 text-white border-white/10"}`}>
                        {p.status}
                      </span>
                      <span className="text-[#9090aa] text-xs">{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">{p.coverLetter}</p>
                    <p className="text-xs text-[#9090aa]">
                      <span className="text-white font-medium">${p.proposedPrice}</span> · {p.deliveryDays} days
                    </p>
                  </div>

                  {/* Actions */}
                  {!["Accepted", "Rejected", "Withdrawn", "Expired"].includes(p.status) && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {p.status !== "Shortlisted" && (
                        <button
                          onClick={() => doAction(p._id, "shortlist")}
                          disabled={actionId === p._id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 disabled:opacity-50 transition-all"
                        >
                          Shortlist
                        </button>
                      )}
                      {p.status !== "Interview" && (
                        <button
                          onClick={() => doAction(p._id, "interview")}
                          disabled={actionId === p._id}
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 disabled:opacity-50 transition-all"
                        >
                          Interview
                        </button>
                      )}
                      <button
                        onClick={() => doAction(p._id, "accept")}
                        disabled={actionId === p._id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_6px_20px_rgba(124,106,255,0.25)] disabled:opacity-50 transition-all"
                      >
                        {actionId === p._id ? "..." : "Hire"}
                      </button>
                      <button
                        onClick={() => doAction(p._id, "reject")}
                        disabled={actionId === p._id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ClientProposalsPage() {
  return (
    <ProtectedRoute allowedRoles={["Client"]}>
      <ClientProposalDashboard />
    </ProtectedRoute>
  );
}
