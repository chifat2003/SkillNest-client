"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  FaClock, FaDollarSign, FaUsers, FaTag, FaStar,
  FaArrowLeft, FaCheckCircle, FaPaperPlane,
} from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  projectType: "fixed" | "hourly";
  budgetMin: number | null;
  budgetMax: number | null;
  deadline: string | null;
  duration: string;
  experienceLevel: string;
  status: string;
  proposalCount: number;
  createdAt: string;
  publishedAt: string;
  client?: { _id: string; fullName: string; email: string; createdAt: string };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUserRole(JSON.parse(stored).role); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API}/api/projects/${params.id}`, { headers });
        const data = await res.json();
        if (data.success) {
          setProject(data.data);
        } else {
          toast.error("Project not found.");
          router.push("/projects");
        }
      } catch {
        toast.error("Failed to load project.");
        router.push("/projects");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.id, router]);

  const formatBudget = (p: Project) => {
    if (p.projectType === "hourly") return p.budgetMin ? `$${p.budgetMin}/hr` : "Hourly Rate (Negotiable)";
    if (p.budgetMin && p.budgetMax) return `$${p.budgetMin.toLocaleString()} – $${p.budgetMax.toLocaleString()}`;
    if (p.budgetMin) return `From $${p.budgetMin.toLocaleString()}`;
    if (p.budgetMax) return `Up to $${p.budgetMax.toLocaleString()}`;
    return "Budget Not Specified";
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <main className="min-h-screen bg-[#08080d] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link href="/projects" className="inline-flex items-center gap-2 text-[#9090aa] text-sm hover:text-white transition-colors mb-6">
          <FaArrowLeft className="text-xs" /> Back to Projects
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Title card */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {project.category && (
                  <span className="text-xs font-medium text-[#7c6aff] bg-[#7c6aff]/10 px-3 py-1 rounded-full">
                    {project.category}
                  </span>
                )}
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${project.projectType === "hourly" ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" : "text-green-400 border-green-500/20 bg-green-500/10"}`}>
                  {project.projectType === "hourly" ? "Hourly" : "Fixed Price"}
                </span>
                <span className="text-xs text-[#9090aa] border border-white/10 px-3 py-1 rounded-full">
                  {project.status}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mb-3">{project.title}</h1>
              <p className="text-xs text-[#68687d]">Posted {timeAgo(project.createdAt)}</p>
            </div>

            {/* Description */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-white mb-3">Project Description</h2>
              <p className="text-sm text-[#c0c0d0] leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>

            {/* Skills */}
            {project.skills.length > 0 && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <FaTag className="text-[#7c6aff] text-xs" /> Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((s) => (
                    <span key={s} className="text-xs text-[#c0c0d0] bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Budget & stats */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/8">
                <FaDollarSign className="text-[#7c6aff]" />
                <div>
                  <p className="text-xs text-[#9090aa]">Budget</p>
                  <p className="text-lg font-bold text-white">{formatBudget(project)}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 text-sm">
                {project.experienceLevel && project.experienceLevel !== "Any" && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#9090aa] flex items-center gap-1.5"><FaStar className="text-[10px]" /> Level</span>
                    <span className="text-white font-medium">{project.experienceLevel}</span>
                  </div>
                )}
                {project.duration && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#9090aa] flex items-center gap-1.5"><FaClock className="text-[10px]" /> Duration</span>
                    <span className="text-white font-medium">{project.duration}</span>
                  </div>
                )}
                {project.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#9090aa]">Deadline</span>
                    <span className="text-white font-medium">{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#9090aa] flex items-center gap-1.5"><FaUsers className="text-[10px]" /> Proposals</span>
                  <span className="text-white font-medium">{project.proposalCount}</span>
                </div>
              </div>

              {/* CTA */}
              {userRole === "Freelancer" && ["Published", "Hiring"].includes(project.status) && (
                <Link
                  href={`/dashboard/freelancer/proposals/submit?projectId=${project._id}`}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_20px_rgba(124,106,255,0.3)] transition-all"
                >
                  <FaPaperPlane className="text-xs" /> Submit Proposal
                </Link>
              )}
              {!userRole && (
                <Link
                  href="/auth/login"
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_20px_rgba(124,106,255,0.3)] transition-all"
                >
                  Login to Apply
                </Link>
              )}
            </div>

            {/* Client info */}
            {project.client && (
              <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <h3 className="text-xs font-semibold text-[#9090aa] uppercase tracking-wider mb-3">About the Client</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] flex items-center justify-center text-sm font-bold text-white">
                    {project.client.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{project.client.fullName}</p>
                    <p className="text-xs text-[#68687d]">
                      Member since {new Date(project.client.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#4ecdc4]">
                  <FaCheckCircle className="text-[10px]" /> Verified Client
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
