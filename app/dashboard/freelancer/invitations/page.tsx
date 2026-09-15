"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  Accepted: "bg-green-500/15 text-green-400 border-green-500/20",
  Declined: "bg-red-500/15 text-red-400 border-red-500/20",
  Withdrawn: "bg-[#9090aa]/15 text-[#9090aa] border-white/10",
};

interface Invitation {
  _id: string;
  projectId: string;
  clientId: string;
  message: string;
  status: string;
  createdAt: string;
}

function FreelancerInvitationsList() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/invitations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setInvitations(data.data);
      } catch {
        toast.error("Failed to load invitations.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvitations();
  }, []);

  const respond = async (id: string, status: "Accepted" | "Declined") => {
    setRespondingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/invitations/${id}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to respond.");
      toast.success(`Invitation ${status.toLowerCase()}.`);
      setInvitations((prev) => prev.map((inv) => inv._id === id ? { ...inv, status } : inv));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#08080d] px-4 py-10 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Invitations</h1>
        <p className="text-[#9090aa] text-sm mb-8">Clients who invited you to their projects.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-20 text-[#9090aa]">
            <p className="text-lg mb-2">No invitations yet</p>
            <p className="text-sm">Complete your profile to attract more clients.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {invitations.map((inv) => (
              <div key={inv._id} className="bg-[#13131a] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[inv.status] || "bg-white/5 text-white border-white/10"}`}>
                    {inv.status}
                  </span>
                  <span className="text-[#9090aa] text-xs">{new Date(inv.createdAt).toLocaleDateString()}</span>
                </div>

                <p className="text-sm text-white/80 leading-relaxed mb-4">{inv.message}</p>

                {inv.status === "Pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(inv._id, "Accepted")}
                      disabled={respondingId === inv._id}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_6px_20px_rgba(124,106,255,0.25)] disabled:opacity-50 transition-all"
                    >
                      {respondingId === inv._id ? "..." : "Accept"}
                    </button>
                    <button
                      onClick={() => respond(inv._id, "Declined")}
                      disabled={respondingId === inv._id}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function FreelancerInvitationsPage() {
  return (
    <ProtectedRoute allowedRoles={["Freelancer"]}>
      <FreelancerInvitationsList />
    </ProtectedRoute>
  );
}
