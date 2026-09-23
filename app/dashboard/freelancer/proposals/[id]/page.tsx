"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  coverLetter: string;
  proposedPrice: number;
  deliveryDays: number;
  hourlyRate: number | null;
  status: string;
  milestones: unknown[];
  portfolioRefs: unknown[];
  createdAt: string;
  updatedAt: string;
}

function ProposalDetailView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/proposals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "Failed to load proposal.");
        setProposal(data.data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong.");
        router.push("/dashboard/freelancer/proposals");
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id, router]);

  const handleWithdraw = async () => {
    if (!confirm("Withdraw this proposal?")) return;
    setWithdrawing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/proposals/${id}/withdraw`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to withdraw.");
      toast.success("Proposal withdrawn.");
      setProposal((p) => p ? { ...p, status: "Withdrawn" } : p);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" />
      </div>
    );
  }

  if (!proposal) return null;

  return (
    <main className="min-h-screen bg-[#08080d] px-4 py-10 text-white">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="text-[#9090aa] text-sm hover:text-white mb-6 flex items-center gap-1.5 transition-colors">
          ← Back to proposals
        </button>

        <div className="bg-[#13131a] border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold mb-2">Proposal Details</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[proposal.status] || "bg-white/5 text-white border-white/10"}`}>
                {proposal.status}
              </span>
            </div>
            {!["Accepted", "Withdrawn", "Rejected", "Expired"].includes(proposal.status) && (
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all"
              >
                {withdrawing ? "Withdrawing..." : "Withdraw"}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Proposed Price", value: `$${proposal.proposedPrice}` },
              { label: "Delivery", value: `${proposal.deliveryDays} days` },
              ...(proposal.hourlyRate ? [{ label: "Hourly Rate", value: `$${proposal.hourlyRate}/hr` }] : []),
            ].map((item) => (
              <div key={item.label} className="bg-[#101018] border border-white/10 rounded-xl p-3">
                <p className="text-[#9090aa] text-xs mb-1">{item.label}</p>
                <p className="text-white font-semibold text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Cover Letter */}
          <div>
            <p className="text-[#9090aa] text-xs font-medium mb-2 uppercase tracking-wider">Cover Letter</p>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{proposal.coverLetter}</p>
          </div>

          {/* Dates */}
          <div className="flex gap-6 pt-2 border-t border-white/5 text-xs text-[#9090aa]">
            <span>Submitted: {new Date(proposal.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(proposal.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProposalDetailPage() {
  return (
    <ProtectedRoute allowedRoles={["Freelancer"]}>
      <ProposalDetailView />
    </ProtectedRoute>
  );
}
