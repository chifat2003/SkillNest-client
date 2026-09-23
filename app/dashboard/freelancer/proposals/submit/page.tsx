"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function SubmitProposalForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";

  const [form, setForm] = useState({
    coverLetter: "",
    proposedPrice: "",
    deliveryDays: "",
    hourlyRate: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId) return toast.error("No project selected.");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          projectId,
          coverLetter: form.coverLetter,
          proposedPrice: Number(form.proposedPrice),
          deliveryDays: Number(form.deliveryDays),
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to submit proposal.");
      toast.success("Proposal submitted!");
      router.push("/dashboard/freelancer/proposals");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#08080d] px-4 py-10 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Submit Proposal</h1>
        <p className="text-[#9090aa] text-sm mb-8">Write a compelling proposal to win this project.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-[#13131a] border border-white/10 rounded-2xl p-6">
          {/* Cover Letter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Cover Letter</label>
            <textarea
              rows={6}
              required
              placeholder="Introduce yourself and explain why you're the best fit..."
              value={form.coverLetter}
              onChange={(e) => set("coverLetter", e.target.value)}
              className="w-full px-4 py-3 text-sm bg-[#101018] border border-white/10 rounded-xl outline-none placeholder-[#68687d] resize-none focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Proposed Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Proposed Price ($)</label>
              <input
                type="number"
                min={1}
                required
                placeholder="e.g. 500"
                value={form.proposedPrice}
                onChange={(e) => set("proposedPrice", e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[#101018] border border-white/10 rounded-xl outline-none placeholder-[#68687d] focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10 transition-all"
              />
            </div>

            {/* Delivery Days */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Delivery (days)</label>
              <input
                type="number"
                min={1}
                required
                placeholder="e.g. 14"
                value={form.deliveryDays}
                onChange={(e) => set("deliveryDays", e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[#101018] border border-white/10 rounded-xl outline-none placeholder-[#68687d] focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10 transition-all"
              />
            </div>
          </div>

          {/* Hourly Rate (optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">
              Hourly Rate ($) <span className="text-[#9090aa] font-normal">(optional)</span>
            </label>
            <input
              type="number"
              min={1}
              placeholder="e.g. 35"
              value={form.hourlyRate}
              onChange={(e) => set("hourlyRate", e.target.value)}
              className="w-full px-4 py-3 text-sm bg-[#101018] border border-white/10 rounded-xl outline-none placeholder-[#68687d] focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 text-sm font-semibold rounded-xl border border-white/10 text-[#9090aa] hover:border-white/20 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_8px_25px_rgba(124,106,255,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function SubmitProposalPage() {
  return (
    <ProtectedRoute allowedRoles={["Freelancer"]}>
      <Suspense fallback={<div className="min-h-screen bg-[#08080d] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" /></div>}>
        <SubmitProposalForm />
      </Suspense>
    </ProtectedRoute>
  );
}
