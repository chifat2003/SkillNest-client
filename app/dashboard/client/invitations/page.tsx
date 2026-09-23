"use client";

import { FormEvent, useEffect, useState } from "react";
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
  freelancerId: string;
  projectId: string;
  message: string;
  status: string;
  createdAt: string;
}

function ClientInvitationsView() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ freelancerId: "", projectId: "", message: "" });
  const [sending, setSending] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

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

  useEffect(() => {
    void Promise.resolve().then(fetchInvitations);
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to send invitation.");
      toast.success("Invitation sent!");
      setInvitations((prev) => [data.data, ...prev]);
      setForm({ freelancerId: "", projectId: "", message: "" });
      setShowForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  const handleWithdraw = async (id: string) => {
    if (!confirm("Withdraw this invitation?")) return;
    setWithdrawingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/invitations/${id}/withdraw`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to withdraw.");
      toast.success("Invitation withdrawn.");
      setInvitations((prev) => prev.map((inv) => inv._id === id ? { ...inv, status: "Withdrawn" } : inv));
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
            <h1 className="text-2xl font-bold">Invitations</h1>
            <p className="text-[#9090aa] text-sm mt-1">Invite freelancers to your projects.</p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_8px_25px_rgba(124,106,255,0.3)] hover:-translate-y-0.5 transition-all"
          >
            + Send Invitation
          </button>
        </div>

        {/* Send Invitation Form */}
        {showForm && (
          <form onSubmit={handleSend} className="bg-[#13131a] border border-white/10 rounded-2xl p-6 mb-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold">New Invitation</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#9090aa]">Freelancer ID</label>
                <input
                  required
                  placeholder="Freelancer's user ID"
                  value={form.freelancerId}
                  onChange={(e) => setForm((p) => ({ ...p, freelancerId: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm bg-[#101018] border border-white/10 rounded-xl outline-none placeholder-[#68687d] focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#9090aa]">Project ID</label>
                <input
                  required
                  placeholder="Your project ID"
                  value={form.projectId}
                  onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm bg-[#101018] border border-white/10 rounded-xl outline-none placeholder-[#68687d] focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#9090aa]">Message</label>
              <textarea
                rows={3}
                required
                placeholder="Introduce your project and why you'd like to work with this freelancer..."
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className="w-full px-4 py-3 text-sm bg-[#101018] border border-white/10 rounded-xl outline-none placeholder-[#68687d] resize-none focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-white/10 text-[#9090aa] hover:border-white/20 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_8px_25px_rgba(124,106,255,0.3)] disabled:opacity-50 transition-all"
              >
                {sending ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </form>
        )}

        {/* Invitations List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" />
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-20 text-[#9090aa]">
            <p className="text-lg mb-2">No invitations sent yet</p>
            <p className="text-sm">Find a freelancer and send them an invitation.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {invitations.map((inv) => (
              <div key={inv._id} className="bg-[#13131a] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[inv.status] || "bg-white/5 text-white border-white/10"}`}>
                      {inv.status}
                    </span>
                    <span className="text-[#9090aa] text-xs">{new Date(inv.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">{inv.message}</p>
                </div>

                {inv.status === "Pending" && (
                  <button
                    onClick={() => handleWithdraw(inv._id)}
                    disabled={withdrawingId === inv._id}
                    className="shrink-0 px-4 py-2 text-xs font-semibold rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                  >
                    {withdrawingId === inv._id ? "..." : "Withdraw"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ClientInvitationsPage() {
  return (
    <ProtectedRoute allowedRoles={["Client"]}>
      <ClientInvitationsView />
    </ProtectedRoute>
  );
}
