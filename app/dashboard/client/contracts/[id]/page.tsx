"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FaArrowLeft, FaCheckCircle, FaClock, FaDollarSign } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const MILESTONE_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-white/5 text-[#9090aa] border-white/10",
  "In Progress": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "Under Review": "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  "Revision Requested": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Completed: "bg-green-500/15 text-green-400 border-green-500/20",
  Cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

interface Milestone {
  _id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string | null;
  status: string;
  funded: boolean;
}

interface Contract {
  _id: string;
  status: string;
  amount: number;
  contractType: string;
  hourlyRate: number | null;
  terms: string;
  createdAt: string;
  startDate: string;
  milestones: Milestone[];
  project?: { _id: string; title: string; category: string; description: string };
  freelancer?: { _id: string; fullName: string; email: string };
}

function ContractDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/contracts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setContract(data.data);
      else { toast.error("Contract not found."); router.push("/dashboard/client/contracts"); }
    } catch { toast.error("Failed to load contract."); router.push("/dashboard/client/contracts"); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [params.id]);

  const doAction = async (milestoneId: string, action: "fund" | "approve" | "revision") => {
    if (action === "approve" && !confirm("Approve this milestone and release payment to the freelancer?")) return;
    setActionId(milestoneId + action);
    try {
      const token = localStorage.getItem("token");
      const body = action === "revision" ? JSON.stringify({ changes: prompt("Describe the required changes:") || "Please revise." }) : undefined;
      const res = await fetch(`${API}/api/contracts/${params.id}/milestones/${milestoneId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || `Failed to ${action}.`);
      toast.success(data.message);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#08080d] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" /></div>;
  if (!contract) return null;

  const totalFunded = contract.milestones?.filter((m) => m.funded).reduce((s, m) => s + m.amount, 0) ?? 0;
  const totalCompleted = contract.milestones?.filter((m) => m.status === "Completed").reduce((s, m) => s + m.amount, 0) ?? 0;

  return (
    <main className="min-h-screen bg-[#08080d] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard/client/contracts" className="inline-flex items-center gap-2 text-[#9090aa] text-sm hover:text-white transition-colors mb-6">
          <FaArrowLeft className="text-xs" /> My Contracts
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Header */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${contract.status === "Active" ? "bg-blue-500/15 text-blue-400 border-blue-500/20" : contract.status === "Completed" ? "bg-green-500/15 text-green-400 border-green-500/20" : "bg-white/5 text-[#9090aa] border-white/10"}`}>
                  {contract.status}
                </span>
                <span className="text-xs text-[#68687d]">Started {new Date(contract.startDate || contract.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-lg font-bold text-white mb-1">{contract.project?.title || "Contract"}</h1>
              {contract.project?.category && <p className="text-xs text-[#7c6aff]">{contract.project.category}</p>}
            </div>

            {/* Milestones */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4">Milestones</h2>
              {!contract.milestones || contract.milestones.length === 0 ? (
                <p className="text-sm text-[#9090aa]">No milestones defined yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {contract.milestones.map((m, i) => (
                    <div key={m._id} className="bg-white/3 border border-white/8 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs text-[#68687d]">#{i + 1}</span>
                            <h3 className="text-sm font-semibold text-white">{m.title}</h3>
                          </div>
                          {m.description && <p className="text-xs text-[#9090aa]">{m.description}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-white">${m.amount.toLocaleString()}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${MILESTONE_STATUS_STYLES[m.status] || "bg-white/5 text-white border-white/10"}`}>
                            {m.status}
                          </span>
                        </div>
                      </div>
                      {m.dueDate && (
                        <p className="text-xs text-[#68687d] flex items-center gap-1 mb-2">
                          <FaClock className="text-[9px]" /> Due {new Date(m.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {/* Actions */}
                      <div className="flex gap-2 mt-2">
                        {m.status === "Pending" && !m.funded && contract.status === "Active" && (
                          <button
                            onClick={() => doAction(m._id, "fund")}
                            disabled={actionId === m._id + "fund"}
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_10px_rgba(124,106,255,0.2)] disabled:opacity-50 transition-all flex items-center gap-1"
                          >
                            <FaDollarSign className="text-[9px]" /> Fund Milestone
                          </button>
                        )}
                        {m.status === "Under Review" && (
                          <>
                            <button
                              onClick={() => doAction(m._id, "approve")}
                              disabled={!!actionId}
                              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-green-500/20 text-green-400 hover:bg-green-500/10 disabled:opacity-50 transition-all flex items-center gap-1"
                            >
                              <FaCheckCircle className="text-[9px]" /> Approve & Pay
                            </button>
                            <button
                              onClick={() => doAction(m._id, "revision")}
                              disabled={!!actionId}
                              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-orange-500/20 text-orange-400 hover:bg-orange-500/10 disabled:opacity-50 transition-all"
                            >
                              Request Revision
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms */}
            {contract.terms && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white mb-3">Contract Terms</h2>
                <p className="text-sm text-[#9090aa] leading-relaxed">{contract.terms}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-[#9090aa] uppercase tracking-wider mb-3">Contract Summary</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9090aa]">Total Value</span>
                  <span className="font-bold text-white">${contract.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9090aa]">Type</span>
                  <span className="text-white capitalize">{contract.contractType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9090aa]">Funded</span>
                  <span className="text-white">${totalFunded.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9090aa]">Released</span>
                  <span className="text-green-400 font-medium">${totalCompleted.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {contract.freelancer && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-[#9090aa] uppercase tracking-wider mb-3">Freelancer</h3>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] flex items-center justify-center text-sm font-bold text-white">
                    {contract.freelancer.fullName.charAt(0)}
                  </div>
                  <div>
                    <Link href={`/freelancers/${contract.freelancer._id}`} className="text-sm font-semibold text-white hover:text-[#a99aff] transition-colors">
                      {contract.freelancer.fullName}
                    </Link>
                    <p className="text-xs text-[#68687d]">{contract.freelancer.email}</p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/client/messages`}
                  className="mt-3 w-full block py-2 text-xs font-semibold text-center text-[#9090aa] border border-white/10 rounded-xl hover:text-white hover:border-[#7c6aff]/40 transition-all"
                >
                  Message Freelancer
                </Link>
              </div>
            )}

            {contract.status === "Completed" && (
              <Link
                href={`/dashboard/client/reviews?contractId=${contract._id}`}
                className="block w-full py-3 text-sm font-semibold text-center text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_15px_rgba(124,106,255,0.3)] transition-all"
              >
                Leave a Review
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ClientContractDetailPage() {
  return <ProtectedRoute allowedRoles={["Client"]}><ContractDetailContent /></ProtectedRoute>;
}
