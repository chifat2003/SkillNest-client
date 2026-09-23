"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaStar, FaArrowLeft, FaGlobe, FaBriefcase,
  FaGraduationCap, FaEdit, FaPlus,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Review {
  _id: string;
  overallRating: number;
  communication: number;
  quality: number;
  professionalism: number;
  timeliness: number;
  comment: string;
  createdAt: string;
  reviewer?: { fullName: string };
}

interface Experience {
  _id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

interface Education {
  _id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

interface PortfolioItem {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  projectUrl: string;
  category: string;
}

interface Profile {
  title?: string;
  overview?: string;
  hourlyRate?: number;
  skills?: string[];
  availability?: string;
  languages?: string[];
  socialLinks?: Record<string, string>;
  experiences?: Experience[];
  educations?: Education[];
  portfolio?: PortfolioItem[];
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

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "text-sm" : "text-xs";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar key={i} className={`${cls} ${i <= Math.round(rating) ? "text-[#fbbf24]" : "text-white/15"}`} />
      ))}
    </div>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#9090aa] w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] rounded-full transition-all"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-xs font-medium text-white w-6 text-right">{value.toFixed(1)}</span>
    </div>
  );
}

export default function FreelancerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<FreelancerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setViewerRole(u.role);
        setViewerId(u.id);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!params.id) return;
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/api/profiles/${params.id}`, { headers });
        const d = await res.json();
        if (d.success && d.data.role === "Freelancer") {
          setData(d.data);
          const stored = localStorage.getItem("user");
          if (stored) {
            try {
              const u = JSON.parse(stored);
              setIsOwnProfile(u.id === d.data._id);
            } catch { /* ignore */ }
          }
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
    const token = localStorage.getItem("token");
    if (!token) { router.push("/auth/login"); return; }
    try {
      const res = await fetch(`${API}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipientId: data._id }),
      });
      const d = await res.json();
      if (d.success) {
        router.push(`/dashboard/client/messages?conversationId=${d.data._id}`);
      } else throw new Error(d.error?.message);
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
  const hasOverview = !!(p?.overview || data.bio);
  const hasSkills = (p?.skills?.length ?? 0) > 0;
  const hasPortfolio = (p?.portfolio?.length ?? 0) > 0;
  const hasExperience = (p?.experiences?.length ?? 0) > 0;
  const hasEducation = (p?.educations?.length ?? 0) > 0;
  const hasReviews = data.reviews.length > 0;

  // Avg category ratings across all reviews
  const avgCats = hasReviews
    ? {
        communication: data.reviews.reduce((s, r) => s + (r.communication || r.overallRating), 0) / data.reviews.length,
        quality: data.reviews.reduce((s, r) => s + (r.quality || r.overallRating), 0) / data.reviews.length,
        professionalism: data.reviews.reduce((s, r) => s + (r.professionalism || r.overallRating), 0) / data.reviews.length,
        timeliness: data.reviews.reduce((s, r) => s + (r.timeliness || r.overallRating), 0) / data.reviews.length,
      }
    : null;

  return (
    <main className="min-h-screen bg-[#08080d] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link href="/freelancers" className="inline-flex items-center gap-2 text-[#9090aa] text-sm hover:text-white transition-colors mb-6">
          <FaArrowLeft className="text-xs" /> Back to Freelancers
        </Link>

        {/* Own-profile banner */}
        {isOwnProfile && (
          <div className="mb-5 flex items-center justify-between gap-3 bg-[#7c6aff]/8 border border-[#7c6aff]/25 rounded-xl px-4 py-3">
            <p className="text-sm text-[#c0c0d0]">
              {!hasOverview && !hasSkills
                ? "Your profile is empty — add details so clients can find you."
                : "This is how clients see your profile."}
            </p>
            <Link
              href="/dashboard/freelancer/profile/edit"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_12px_rgba(124,106,255,0.3)] transition-all shrink-0"
            >
              <FaEdit className="text-[10px]" /> Edit Profile
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-4">

            {/* Identity card */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3 shadow-[0_0_30px_rgba(124,106,255,0.25)]">
                {data.fullName.charAt(0).toUpperCase()}
              </div>

              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <h1 className="text-base font-bold text-white">{data.fullName}</h1>
                <MdVerified className="text-[#4ecdc4] text-lg shrink-0" />
              </div>

              <p className="text-xs text-[#9090aa] mb-3">
                {p?.title || <span className="italic opacity-60">No title yet</span>}
              </p>

              {/* Rating */}
              {data.avgRating ? (
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <StarRating rating={Number(data.avgRating)} />
                  <span className="text-xs font-semibold text-[#fbbf24]">{data.avgRating}</span>
                  <span className="text-xs text-[#68687d]">({data.reviewCount} review{data.reviewCount !== 1 ? "s" : ""})</span>
                </div>
              ) : (
                <p className="text-xs text-[#68687d] mb-3">No reviews yet</p>
              )}

              {/* Rate */}
              {p?.hourlyRate ? (
                <p className="text-xl font-bold text-[#7c6aff] mb-3">${p.hourlyRate}<span className="text-xs font-normal text-[#9090aa]">/hr</span></p>
              ) : (
                <p className="text-sm text-[#68687d] mb-3 italic">Rate not set</p>
              )}

              {/* Availability */}
              {p?.availability && (
                <span className={`text-xs px-2.5 py-1 rounded-full border mb-3 inline-block ${
                  p.availability === "Available"
                    ? "bg-green-500/15 text-green-400 border-green-500/20"
                    : "bg-white/5 text-[#9090aa] border-white/10"
                }`}>
                  {p.availability}
                </span>
              )}

              {/* CTA buttons */}
              {!isOwnProfile && viewerRole === "Client" && (
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={handleHire}
                    className="w-full py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_15px_rgba(124,106,255,0.3)] transition-all"
                  >
                    Message &amp; Hire
                  </button>
                  <Link
                    href={`/dashboard/client/invitations?freelancerId=${data._id}`}
                    className="w-full py-2.5 text-sm font-semibold text-center text-white rounded-xl border border-white/15 hover:bg-white/5 transition-all block"
                  >
                    Send Invitation
                  </Link>
                </div>
              )}
              {!isOwnProfile && !viewerRole && (
                <Link
                  href="/auth/login"
                  className="mt-4 w-full py-2.5 text-sm font-semibold text-center text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] block"
                >
                  Login to Hire
                </Link>
              )}
              {isOwnProfile && (
                <Link
                  href="/dashboard/freelancer/profile/edit"
                  className="mt-4 w-full py-2.5 text-sm font-semibold text-center text-white rounded-xl border border-[#7c6aff]/40 hover:bg-[#7c6aff]/10 transition-all block flex items-center justify-center gap-2"
                >
                  <FaEdit className="text-xs" /> Edit Profile
                </Link>
              )}

              {/* Meta */}
              <div className="mt-4 pt-4 border-t border-white/8 flex flex-col gap-2 text-xs text-[#9090aa]">
                {data.location ? (
                  <span>📍 {data.location}</span>
                ) : (
                  <span className="opacity-50">📍 Location not set</span>
                )}
                <span>🗓 Member since {new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                {p?.languages && p.languages.length > 0
                  ? <span className="flex items-center gap-1"><FaGlobe className="text-[10px]" /> {p.languages.join(", ")}</span>
                  : <span className="opacity-50 flex items-center gap-1"><FaGlobe className="text-[10px]" /> Languages not set</span>
                }
              </div>
            </div>

            {/* Skills card — always shown */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-[#9090aa] uppercase tracking-wider">Skills</h2>
                {isOwnProfile && (
                  <Link href="/dashboard/freelancer/profile/edit" className="text-[10px] text-[#7c6aff] hover:text-white transition-colors flex items-center gap-1">
                    <FaPlus className="text-[9px]" /> Add
                  </Link>
                )}
              </div>
              {hasSkills ? (
                <div className="flex flex-wrap gap-2">
                  {p!.skills!.map((s) => (
                    <span key={s} className="text-xs text-[#c0c0d0] bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">{s}</span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#68687d] italic">
                  {isOwnProfile ? "Add your skills so clients know what you can do." : "No skills listed yet."}
                </p>
              )}
            </div>
          </div>

          {/* ── Main column ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* About */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-white">About</h2>
                {isOwnProfile && (
                  <Link href="/dashboard/freelancer/profile/edit" className="text-xs text-[#7c6aff] hover:text-white transition-colors flex items-center gap-1.5">
                    <FaEdit className="text-[10px]" /> Edit
                  </Link>
                )}
              </div>
              {hasOverview ? (
                <p className="text-sm text-[#c0c0d0] leading-relaxed whitespace-pre-line">{p?.overview || data.bio}</p>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-[#68687d] mb-3">
                    {isOwnProfile
                      ? "Add a professional overview to introduce yourself to clients."
                      : "This freelancer hasn't added a description yet."}
                  </p>
                  {isOwnProfile && (
                    <Link
                      href="/dashboard/freelancer/profile/edit"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7c6aff] border border-[#7c6aff]/30 px-3 py-1.5 rounded-xl hover:bg-[#7c6aff]/10 transition-all"
                    >
                      <FaEdit className="text-[10px]" /> Write your overview
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Portfolio */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Portfolio</h2>
                {isOwnProfile && (
                  <Link href="/dashboard/freelancer/profile/edit?tab=portfolio" className="text-xs text-[#7c6aff] hover:text-white transition-colors flex items-center gap-1.5">
                    <FaPlus className="text-[10px]" /> Add Project
                  </Link>
                )}
              </div>
              {hasPortfolio ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {p!.portfolio!.map((item) => (
                    <div key={item._id} className="bg-white/3 border border-white/8 rounded-xl p-4 hover:border-white/15 transition-all">
                      <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                      {item.category && (
                        <span className="text-[10px] text-[#7c6aff] bg-[#7c6aff]/10 px-2 py-0.5 rounded-full mr-2">{item.category}</span>
                      )}
                      <p className="text-xs text-[#9090aa] line-clamp-2 mb-2 mt-1.5">{item.description}</p>
                      {item.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.technologies.slice(0, 5).map((t) => (
                            <span key={t} className="text-xs text-[#7c6aff] bg-[#7c6aff]/10 px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      )}
                      {item.projectUrl && (
                        <a href={item.projectUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[#4ecdc4] hover:underline">
                          <FaGlobe className="text-[10px]" /> View Project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                  <p className="text-2xl mb-2">🗂</p>
                  <p className="text-sm text-[#68687d] mb-3">
                    {isOwnProfile ? "Showcase your best work to attract clients." : "No portfolio projects yet."}
                  </p>
                  {isOwnProfile && (
                    <Link href="/dashboard/freelancer/profile/edit?tab=portfolio"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7c6aff] border border-[#7c6aff]/30 px-3 py-1.5 rounded-xl hover:bg-[#7c6aff]/10 transition-all">
                      <FaPlus className="text-[10px]" /> Add Portfolio Project
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FaBriefcase className="text-[#7c6aff] text-xs" /> Work Experience
                </h2>
                {isOwnProfile && (
                  <Link href="/dashboard/freelancer/profile/edit?tab=experience"
                    className="text-xs text-[#7c6aff] hover:text-white transition-colors flex items-center gap-1.5">
                    <FaPlus className="text-[10px]" /> Add
                  </Link>
                )}
              </div>
              {hasExperience ? (
                <div className="flex flex-col gap-5">
                  {p!.experiences!.map((exp, idx) => (
                    <div key={exp._id} className={`flex gap-4 ${idx !== 0 ? "pt-5 border-t border-white/8" : ""}`}>
                      <div className="w-9 h-9 rounded-xl bg-[#7c6aff]/15 border border-[#7c6aff]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <FaBriefcase className="text-[#7c6aff] text-xs" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white">{exp.title}</h3>
                        <p className="text-xs text-[#9090aa] mb-1">
                          {exp.company}
                          {(exp.startDate || exp.endDate || exp.current) && (
                            <span className="ml-2 text-[#68687d]">
                              · {exp.startDate ? new Date(exp.startDate).getFullYear() : "?"} – {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : "?"}
                            </span>
                          )}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-[#c0c0d0] leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                  <p className="text-sm text-[#68687d] mb-3">
                    {isOwnProfile ? "Add your work history to build credibility." : "No experience listed yet."}
                  </p>
                  {isOwnProfile && (
                    <Link href="/dashboard/freelancer/profile/edit?tab=experience"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7c6aff] border border-[#7c6aff]/30 px-3 py-1.5 rounded-xl hover:bg-[#7c6aff]/10 transition-all">
                      <FaPlus className="text-[10px]" /> Add Experience
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FaGraduationCap className="text-[#7c6aff] text-xs" /> Education
                </h2>
                {isOwnProfile && (
                  <Link href="/dashboard/freelancer/profile/edit?tab=education"
                    className="text-xs text-[#7c6aff] hover:text-white transition-colors flex items-center gap-1.5">
                    <FaPlus className="text-[10px]" /> Add
                  </Link>
                )}
              </div>
              {hasEducation ? (
                <div className="flex flex-col gap-4">
                  {p!.educations!.map((edu, idx) => (
                    <div key={edu._id} className={`flex gap-4 ${idx !== 0 ? "pt-4 border-t border-white/8" : ""}`}>
                      <div className="w-9 h-9 rounded-xl bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <FaGraduationCap className="text-[#4ecdc4] text-xs" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{edu.school}</h3>
                        <p className="text-xs text-[#9090aa]">
                          {edu.degree}{edu.field ? `, ${edu.field}` : ""}
                          {(edu.startDate || edu.endDate) && (
                            <span className="ml-2 text-[#68687d]">
                              · {edu.startDate ? new Date(edu.startDate).getFullYear() : "?"} – {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                  <p className="text-sm text-[#68687d] mb-3">
                    {isOwnProfile ? "Add your educational background." : "No education listed yet."}
                  </p>
                  {isOwnProfile && (
                    <Link href="/dashboard/freelancer/profile/edit?tab=education"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7c6aff] border border-[#7c6aff]/30 px-3 py-1.5 rounded-xl hover:bg-[#7c6aff]/10 transition-all">
                      <FaPlus className="text-[10px]" /> Add Education
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Reviews */}
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

              {hasReviews ? (
                <>
                  {/* Category breakdown */}
                  {avgCats && (
                    <div className="flex flex-col gap-2 mb-5 p-4 bg-white/3 rounded-xl border border-white/8">
                      <RatingBar label="Communication" value={avgCats.communication} />
                      <RatingBar label="Quality of Work" value={avgCats.quality} />
                      <RatingBar label="Professionalism" value={avgCats.professionalism} />
                      <RatingBar label="Timeliness" value={avgCats.timeliness} />
                    </div>
                  )}
                  <div className="flex flex-col gap-4">
                    {data.reviews.map((r, idx) => (
                      <div key={r._id} className={`${idx !== 0 ? "pt-4 border-t border-white/8" : ""}`}>
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {r.reviewer?.fullName?.charAt(0) || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white">{r.reviewer?.fullName || "Anonymous"}</p>
                            <StarRating rating={r.overallRating} />
                          </div>
                          <span className="text-xs text-[#68687d] shrink-0">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        {r.comment && (
                          <p className="text-xs text-[#9090aa] leading-relaxed ml-10">{r.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                  <p className="text-2xl mb-2">⭐</p>
                  <p className="text-sm text-[#68687d]">
                    {isOwnProfile
                      ? "Complete a contract to receive your first review."
                      : "No reviews yet."}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
