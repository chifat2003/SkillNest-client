"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaStar, FaArrowLeft, FaGlobe, FaEnvelope } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Review {
  _id: string;
  overallRating: number;
  comment: string;
  createdAt: string;
  reviewer?: { fullName: string };
}

interface Profile {
  title?: string;
  overview?: string;
  hourlyRate?: number;
  skills?: string[];
  availability?: string;
  languages?: string[];
  socialLinks?: Record<string, string>;
  experiences?: { _id: string; title: string; company: string; startDate: string; endDate?: string; current: boolean; description: string }[];
  educations?: { _id: string; school: string; degree: string; field: string; startDate: string; endDate?: string }[];
  portfolio?: { _id: string; title: string; description: string; technologies: string[]; projectUrl: string }[];
}

interface FreelancerData {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
  location?: string;
  bio?: string;
  profile: Profile | null;
  reviews: Review[];
  avgRating: string | null;
  reviewCount: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} className={`text-xs ${i < Math.round(rating) ? "text-[#fbbf24]" : "text-white/15"}`} />
      ))}
    </div>
  );
}

export default function FreelancerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<FreelancerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUserRole(u.role);
        setUserId(u.id);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/profiles/${params.id}`);
        const d = await res.json();
        if (d.success && d.data.role === "Freelancer") {
          setData(d.data);
        } else {
          toast.error("Freelancer not found.");
          router.push("/freelancers");
        }
      } catch {
        toast.error("Failed to load profile.");
        router.push("/freelancers");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.id, router]);

  const handleHire = async () => {
    if (!data) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipientId: data._id }),
      });
      const d = await res.json();
      if (d.success) {
        router.push(`/dashboard/client/messages?conversationId=${d.data._id}`);
      } else {
        throw new Error(d.error?.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start conversation.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" />
      </div>
    );
  }
  if (!data) return null;

  const p = data.profile;

  return (
    <main className="min-h-screen bg-[#08080d] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/freelancers" className="inline-flex items-center gap-2 text-[#9090aa] text-sm hover:text-white transition-colors mb-6">
          <FaArrowLeft className="text-xs" /> Back to Freelancers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Profile card */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3 shadow-[0_0_30px_rgba(124,106,255,0.3)]">
                {data.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <h1 className="text-base font-bold text-white">{data.fullName}</h1>
                <MdVerified className="text-[#4ecdc4] text-lg" />
              </div>
              <p className="text-xs text-[#9090aa] mb-2">{p?.title || "Freelancer"}</p>
              {data.avgRating && (
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <StarRating rating={Number(data.avgRating)} />
                  <span className="text-xs font-semibold text-[#fbbf24]">{data.avgRating}</span>
                  <span className="text-xs text-[#68687d]">({data.reviewCount})</span>
                </div>
              )}
              {p?.hourlyRate && (
                <p className="text-xl font-bold text-[#7c6aff] mb-3">${p.hourlyRate}/hr</p>
              )}
              {p?.availability && (
                <span className={`text-xs px-2.5 py-1 rounded-full border mb-3 inline-block ${p.availability === "Available" ? "bg-green-500/15 text-green-400 border-green-500/20" : "bg-[#9090aa]/10 text-[#9090aa] border-white/10"}`}>
                  {p.availability}
                </span>
              )}
              {userRole === "Client" && userId !== data._id && (
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={handleHire}
                    className="w-full py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_15px_rgba(124,106,255,0.3)] transition-all"
                  >
                    Message & Hire
                  </button>
                  <Link
                    href={`/dashboard/client/invitations?freelancerId=${data._id}`}
                    className="w-full py-2.5 text-sm font-semibold text-center text-white rounded-xl border border-white/15 hover:bg-white/5 transition-all block"
                  >
                    Send Invitation
                  </Link>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-white/8 flex flex-col gap-2 text-xs text-[#9090aa]">
                {data.location && <span>📍 {data.location}</span>}
                <span>🗓 Member since {new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                {p?.languages && p.languages.length > 0 && (
                  <span className="flex items-center gap-1"><FaGlobe className="text-[10px]" /> {p.languages.join(", ")}</span>
                )}
              </div>
            </div>

            {/* Skills */}
            {p?.skills && p.skills.length > 0 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <h2 className="text-xs font-semibold text-[#9090aa] uppercase tracking-wider mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {p.skills.map((s) => (
                    <span key={s} className="text-xs text-[#c0c0d0] bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Overview */}
            {(p?.overview || data.bio) && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white mb-3">About</h2>
                <p className="text-sm text-[#c0c0d0] leading-relaxed whitespace-pre-line">{p?.overview || data.bio}</p>
              </div>
            )}

            {/* Portfolio */}
            {p?.portfolio && p.portfolio.length > 0 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white mb-4">Portfolio</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {p.portfolio.map((item) => (
                    <div key={item._id} className="bg-white/3 border border-white/8 rounded-xl p-4 hover:border-white/15 transition-all">
                      <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-xs text-[#9090aa] line-clamp-2 mb-2">{item.description}</p>
                      {item.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.technologies.slice(0, 4).map((t) => (
                            <span key={t} className="text-xs text-[#7c6aff] bg-[#7c6aff]/10 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      )}
                      {item.projectUrl && (
                        <a href={item.projectUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#4ecdc4] mt-2 hover:underline">
                          <FaGlobe className="text-[10px]" /> View Project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {p?.experiences && p.experiences.length > 0 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white mb-4">Experience</h2>
                <div className="flex flex-col gap-4">
                  {p.experiences.map((exp) => (
                    <div key={exp._id} className="border-l-2 border-[#7c6aff]/30 pl-4">
                      <h3 className="text-sm font-semibold text-white">{exp.title}</h3>
                      <p className="text-xs text-[#9090aa] mb-1">{exp.company} · {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : ""}</p>
                      {exp.description && <p className="text-xs text-[#c0c0d0]">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {data.reviews.length > 0 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-white">Reviews</h2>
                  {data.avgRating && (
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={Number(data.avgRating)} />
                      <span className="text-sm font-bold text-[#fbbf24]">{data.avgRating}</span>
                      <span className="text-xs text-[#68687d]">({data.reviewCount})</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-4">
                  {data.reviews.map((r) => (
                    <div key={r._id} className="border-t border-white/8 pt-4 first:border-0 first:pt-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] flex items-center justify-center text-xs font-bold text-white">
                          {r.reviewer?.fullName?.charAt(0) || "?"}
                        </div>
                        <span className="text-xs font-medium text-white">{r.reviewer?.fullName || "Anonymous"}</span>
                        <StarRating rating={r.overallRating} />
                        <span className="ml-auto text-xs text-[#68687d]">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      {r.comment && <p className="text-xs text-[#9090aa] leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
