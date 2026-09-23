"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FaArrowLeft, FaUpload, FaLink } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const MILESTONE_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-white/5 text-[#9090aa] border-white/10",
  "In Progress": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "Under Review": "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  "Revision Requested": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Completed: "bg-green-500/15 text-green-400 border-green-500/20",
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
  terms: string;
  createdAt: string;
  startDate: string;
  milestones: Milestone[];
  project?: { _id: string; title: string; category: string };
  client?: { _id: string; fullName: string; email: string };
}

function FreelancerContractDetail() {
  const params = useParams();
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitForm, setSubmitForm] = useState<{ milestoneId: string; message: string; liveUrl: string } | null>(null);

  const load = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/contracts/${params.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setContract(data.data);
      else { toast.error("Contract not found."); router.push("/dashboard/freelancer/contracts"); }
    } catch { toast.error("Failed to load."); router.push("/dashboard/freelancer/contracts"); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [params.id]);

  const handleSubmitWork = async () => {
    if (!submitForm) return;
    setSubmitting(submitForm.milestoneId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/contracts/${params.id}/milestones/${submitForm.milestoneId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: submitForm.message, liveUrl: submitForm.liveUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to submit.");
      toast.success("Work submitted for review!");
      setSubmitForm(null);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#08080d] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" /></div>;
  if (!contract) return null;

  return (
    <main className="min-h-screen bg-[#08080d] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard/freelancer/contracts" className="inline-flex items-center gap-2 text-[#9090aa] text-sm hover:text-white transition-colors mb-6">
          <FaArrowLeft className="text-xs" /> My Contracts
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${contract.status === "Active" ? "bg-blue-500/15 text-blue-400 border-blue-500/20" : "bg-green-500/15 text-green-400 border-green-500/20"}`}>
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
                <p className="text-sm text-[#9090aa]">No milestones have been set yet. The client will add them.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {contract.milestones.map((m, i) => (
                    <div key={m._id}>
                      <div className="bg-white/3 border border-white/8 rounded-xl p-4">
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
                        {!m.funded && m.status === "Pending" && (
                          <p className="text-xs text-[#9090aa] mt-1">⏳ Waiting for client to fund this milestone.</p>
                        )}
                        {(m.status === "In Progress" || m.status === "Revision Requested") && m.funded && (
                          <button
                            onClick={() => setSubmitForm({ milestoneId: m._id, message: "", liveUrl: "" })}
                            className="mt-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_10px_rgba(124,106,255,0.2)] transition-all flex items-center gap-1.5"
                          >
                            <FaUpload className="text-[9px]" /> Submit Work
                          </button>
                        )}
                      </div>

                      {/* Submit work form */}
                      {submitForm?.milestoneId === m._id && (
                        <div className="mt-2 bg-[#7c6aff]/5 border border-[#7c6aff]/20 rounded-xl p-4">
                          <h4 className="text-xs font-semibold text-white mb-3">Submit Work for Review</h4>
                          <textarea
                            value={submitForm.message}
                            onChange={(e) => setSubmitForm({ ...submitForm, message: e.target.value })}
                            placeholder="Describe what you've completed..."
                            rows={3}
                            className="w-full px-3 py-2.5 text-xs bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 resize-none mb-2"
                          />
                          <div className="relative">
                            <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9090aa] text-xs" />
                            <input
                              type="url"
                              value={submitForm.liveUrl}
                              onChange={(e) => setSubmitForm({ ...submitForm, liveUrl: e.target.value })}
                              placeholder="Live URL (optional)"
                              className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 mb-3"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSubmitWork}
                              disabled={submitting === m._id}
                              className="px-4 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] disabled:opacity-50 transition-all"
                            >
                              {submitting === m._id ? "Submitting..." : "Submit for Review"}
                            </button>
                            <button
                              onClick={() => setSubmitForm(null)}
                              className="px-4 py-2 text-xs font-semibold text-[#9090aa] rounded-xl border border-white/10 hover:text-white transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <h3 className="text-xs font-semibold text-[#9090aa] uppercase tracking-wider mb-3">Summary</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#9090aa]">Contract Value</span>
                  <span className="font-bold text-white">${contract.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9090aa]">Type</span>
                  <span className="text-white capitalize">{contract.contractType}</span>
                </div>
              </div>
            </div>

            {contract.client && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-[#9090aa] uppercase tracking-wider mb-3">Client</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] flex items-center justify-center text-sm font-bold text-white">
                    {contract.client.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{contract.client.fullName}</p>
                    <p className="text-xs text-[#68687d]">{contract.client.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/freelancer/messages"
                  className="w-full block py-2 text-xs font-semibold text-center text-[#9090aa] border border-white/10 rounded-xl hover:text-white hover:border-[#7c6aff]/40 transition-all"
                >
                  Message Client
                </Link>
              </div>
            )}

            {contract.status === "Completed" && (
              <Link
                href={`/dashboard/freelancer/reviews?contractId=${contract._id}`}
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

export default function FreelancerContractDetailPage() {
  return <ProtectedRoute allowedRoles={["Freelancer"]}><FreelancerContractDetail /></ProtectedRoute>;
}
