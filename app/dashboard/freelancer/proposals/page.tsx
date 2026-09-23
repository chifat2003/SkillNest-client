"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

interface Proposal {
  _id: string;
  projectId: string;
  proposedPrice: number;
  deliveryDays: number;
  status: string;
  createdAt: string;
}

function MyProposalsList() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/proposals`, {
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
    void Promise.resolve().then(fetchProposals);
  }, []);

  const handleWithdraw = async (id: string) => {
    if (!confirm("Withdraw this proposal?")) return;
    setWithdrawingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/proposals/${id}/withdraw`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to withdraw.");
      toast.success("Proposal withdrawn.");
      setProposals((prev) => prev.map((p) => p._id === id ? { ...p, status: "Withdrawn" } : p));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#08080d] px-4 py-10 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Proposals</h1>
            <p className="text-[#9090aa] text-sm mt-1">{proposals.length} proposal{proposals.length !== 1 ? "s" : ""} submitted</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-20 text-[#9090aa]">
            <p className="text-lg mb-2">No proposals yet</p>
            <p className="text-sm">Browse projects and submit your first proposal.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {proposals.map((p) => (
              <div key={p._id} className="bg-[#13131a] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[p.status] || "bg-white/5 text-white border-white/10"}`}>
                      {p.status}
                    </span>
                    <span className="text-[#9090aa] text-xs">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-[#9090aa]">
                    <span className="text-white font-medium">${p.proposedPrice}</span> · {p.deliveryDays} days delivery
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/freelancer/proposals/${p._id}`}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-white/10 text-[#9090aa] hover:border-white/20 hover:text-white transition-all"
                  >
                    View Details
                  </Link>
                  {!["Accepted", "Withdrawn", "Rejected", "Expired"].includes(p.status) && (
                    <button
                      onClick={() => handleWithdraw(p._id)}
                      disabled={withdrawingId === p._id}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                    >
                      {withdrawingId === p._id ? "..." : "Withdraw"}
                    </button>
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

export default function MyProposalsPage() {
  return (
    <ProtectedRoute allowedRoles={["Freelancer"]}>
      <MyProposalsList />
    </ProtectedRoute>
  );
}
