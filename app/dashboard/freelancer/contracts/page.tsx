"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Completed: "bg-green-500/15 text-green-400 border-green-500/20",
  Cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

const TABS = ["All", "Active", "Completed", "Cancelled"];

interface Contract {
  _id: string;
  status: string;
  amount: number;
  contractType: string;
  createdAt: string;
  project?: { title: string; category: string };
  client?: { fullName: string };
  milestones?: { status: string; amount: number }[];
}

function FreelancerContractsContent() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (activeTab !== "All") params.set("status", activeTab);
      const res = await fetch(`${API}/api/contracts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setContracts(data.data);
    } catch {
      toast.error("Failed to load contracts.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { void fetchContracts(); }, [fetchContracts]);

  return (
    <main className="min-h-screen bg-[#08080d] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">My Contracts</h1>
        <p className="text-[#9090aa] text-sm mb-6">View and manage your active and completed contracts.</p>

        <div className="flex gap-1.5 flex-wrap mb-6">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${activeTab === tab ? "bg-[#7c6aff]/15 border-[#7c6aff] text-white" : "bg-[#13131a] border-white/10 text-[#9090aa] hover:border-white/20 hover:text-white"}`}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" /></div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-20 text-[#9090aa]">
            <p className="text-lg mb-2">No contracts yet</p>
            <p className="text-sm">Contracts appear here once a client accepts your proposal.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contracts.map((c) => {
              const pending = c.milestones?.filter((m) => m.status === "In Progress" || m.status === "Revision Requested").length ?? 0;
              return (
                <div key={c._id} className="bg-[#13131a] border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[c.status] || "bg-white/5 text-white border-white/10"}`}>
                          {c.status}
                        </span>
                        {pending > 0 && (
                          <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                            {pending} milestone{pending > 1 ? "s" : ""} pending
                          </span>
                        )}
                        <span className="text-xs text-[#68687d]">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h2 className="text-sm font-semibold text-white mb-1 line-clamp-1">{c.project?.title || "Contract"}</h2>
                      <p className="text-xs text-[#9090aa]">
                        Client: <span className="text-white">{c.client?.fullName || "—"}</span>
                        {" · "}
                        <span className="font-medium text-white">${c.amount?.toLocaleString()}</span>
                      </p>
                    </div>
                    <Link
                      href={`/dashboard/freelancer/contracts/${c._id}`}
                      className="px-4 py-2 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_10px_rgba(124,106,255,0.3)] transition-all shrink-0"
                    >
                      View Contract
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function FreelancerContractsPage() {
  return <ProtectedRoute allowedRoles={["Freelancer"]}><FreelancerContractsContent /></ProtectedRoute>;
}
