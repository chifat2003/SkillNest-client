"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaStar, FaArrowLeft, FaCheckCircle } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface StarPickerProps {
  value: number;
  onChange: (v: number) => void;
  label: string;
}

function StarPicker({ value, onChange, label }: StarPickerProps) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-[#9090aa]">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            className="text-xl transition-transform hover:scale-110"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <FaStar
              className={
                n <= (hovered || value)
                  ? "text-[#fbbf24]"
                  : "text-white/15"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}

interface Contract {
  _id: string;
  status: string;
  project?: { title: string };
  client?: { fullName: string };
  freelancer?: { fullName: string };
}

export default function ReviewForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contractIdParam = searchParams.get("contractId");

  const [userRole, setUserRole] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    overallRating: 0,
    communication: 0,
    quality: 0,
    professionalism: 0,
    timeliness: 0,
    comment: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUserRole(JSON.parse(stored).role); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!contractIdParam) { setLoading(false); return; }
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/contracts/${contractIdParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setContract(data.data);
          if (data.data.status !== "Completed") {
            toast.error("Reviews can only be submitted for completed contracts.");
          }
        } else {
          toast.error("Contract not found.");
        }
      } catch {
        toast.error("Failed to load contract.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [contractIdParam]);

  const set = (field: string, value: number | string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractIdParam) { toast.error("No contract selected."); return; }
    if (form.overallRating === 0) { toast.error("Please select an overall rating."); return; }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          contractId: contractIdParam,
          overallRating: form.overallRating,
          communication: form.communication || form.overallRating,
          quality: form.quality || form.overallRating,
          professionalism: form.professionalism || form.overallRating,
          timeliness: form.timeliness || form.overallRating,
          comment: form.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to submit review.");
      setSubmitted(true);
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const backHref =
    userRole === "Client"
      ? `/dashboard/client/contracts/${contractIdParam}`
      : `/dashboard/freelancer/contracts/${contractIdParam}`;

  const dashHref =
    userRole === "Client" ? "/dashboard/client" : "/dashboard/freelancer";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" />
      </div>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#08080d] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-400 text-3xl" />
          </div>
          <h1 className="text-xl font-bold mb-2">Review Submitted!</h1>
          <p className="text-[#9090aa] text-sm mb-6">
            Thank you for your feedback. It helps build trust in the community.
          </p>
          <Link
            href={dashHref}
            className="inline-block px-6 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_20px_rgba(124,106,255,0.3)] transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!contractIdParam) {
    return (
      <main className="min-h-screen bg-[#08080d] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#9090aa] mb-4">No contract specified.</p>
          <Link href={dashHref} className="text-[#7c6aff] hover:underline text-sm">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (contract && contract.status !== "Completed") {
    return (
      <main className="min-h-screen bg-[#08080d] text-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#9090aa] mb-4">
            This contract is not yet completed. Reviews can only be submitted after completion.
          </p>
          <Link href={backHref} className="text-[#7c6aff] hover:underline text-sm">
            Back to Contract
          </Link>
        </div>
      </main>
    );
  }

  const reviewee =
    userRole === "Client"
      ? contract?.freelancer?.fullName
      : contract?.client?.fullName;

  return (
    <main className="min-h-screen bg-[#08080d] text-white px-4 py-8">
      <div className="max-w-xl mx-auto">
        {contractIdParam && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-[#9090aa] text-sm hover:text-white transition-colors mb-6"
          >
            <FaArrowLeft className="text-xs" /> Back to Contract
          </Link>
        )}

        <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
          <h1 className="text-xl font-bold mb-1">Leave a Review</h1>
          {reviewee && (
            <p className="text-[#9090aa] text-sm mb-1">
              Reviewing <span className="text-white font-medium">{reviewee}</span>
            </p>
          )}
          {contract?.project?.title && (
            <p className="text-xs text-[#7c6aff] mb-6">{contract.project.title}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Overall rating — large */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-white">
                Overall Rating <span className="text-[#ff6a9e]">*</span>
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set("overallRating", n)}
                    className="text-3xl transition-transform hover:scale-110"
                    aria-label={`${n} star`}
                  >
                    <FaStar
                      className={n <= form.overallRating ? "text-[#fbbf24]" : "text-white/15"}
                    />
                  </button>
                ))}
              </div>
              {form.overallRating > 0 && (
                <span className="text-xs text-[#9090aa]">
                  {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][form.overallRating]}
                </span>
              )}
            </div>

            {/* Category ratings */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-white/3 rounded-xl border border-white/8">
              <StarPicker
                label="Communication"
                value={form.communication}
                onChange={(v) => set("communication", v)}
              />
              <StarPicker
                label="Quality of Work"
                value={form.quality}
                onChange={(v) => set("quality", v)}
              />
              <StarPicker
                label="Professionalism"
                value={form.professionalism}
                onChange={(v) => set("professionalism", v)}
              />
              <StarPicker
                label="Timeliness"
                value={form.timeliness}
                onChange={(v) => set("timeliness", v)}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Written Review <span className="text-[#9090aa] font-normal">(optional)</span>
              </label>
              <textarea
                value={form.comment}
                onChange={(e) => set("comment", e.target.value)}
                placeholder="Share your experience working with this person..."
                rows={4}
                className="w-full px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-sm text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || form.overallRating === 0}
              className="w-full py-3.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_20px_rgba(124,106,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
