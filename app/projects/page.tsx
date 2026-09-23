"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FaSearch, FaFilter, FaBolt, FaClock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const EXPERIENCE_LEVELS = ["Any", "Entry", "Intermediate", "Expert"];
const PROJECT_TYPES = ["all", "fixed", "hourly"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "budget_high", label: "Budget: High to Low" },
  { value: "budget_low", label: "Budget: Low to High" },
  { value: "proposals", label: "Most Proposals" },
];
const CATEGORIES = [
  "Web Development", "Mobile App", "UI/UX Design", "AI & ML",
  "Content Writing", "Backend", "DevOps", "Data Science",
  "Video Editing", "Digital Marketing",
];

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
  experienceLevel: string;
  status: string;
  proposalCount: number;
  createdAt: string;
  client?: { fullName: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [projectType, setProjectType] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const fetchProjects = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "12", sort });
      if (keyword) params.set("keyword", keyword);
      if (category) params.set("category", category);
      if (projectType !== "all") params.set("projectType", projectType);
      if (experienceLevel && experienceLevel !== "Any") params.set("experienceLevel", experienceLevel);

      const res = await fetch(`${API}/api/projects?${params}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
        setPagination(data.pagination);
      }
    } catch {
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [keyword, category, projectType, experienceLevel, sort]);

  useEffect(() => {
    setPage(1);
    void fetchProjects(1);
  }, [category, projectType, experienceLevel, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchProjects(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    void fetchProjects(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatBudget = (p: Project) => {
    if (p.projectType === "hourly") {
      return p.budgetMin ? `$${p.budgetMin}/hr` : "Hourly";
    }
    if (p.budgetMin && p.budgetMax) return `$${p.budgetMin.toLocaleString()} – $${p.budgetMax.toLocaleString()}`;
    if (p.budgetMin) return `From $${p.budgetMin.toLocaleString()}`;
    if (p.budgetMax) return `Up to $${p.budgetMax.toLocaleString()}`;
    return "Budget TBD";
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <main className="min-h-screen bg-[#08080d] text-white">
      {/* Header */}
      <div className="border-b border-white/8 bg-[#09090f]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-1">Find Projects</h1>
          <p className="text-[#9090aa] text-sm">Browse {pagination.total.toLocaleString()} open projects from clients worldwide.</p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9090aa] text-sm" />
              <input
                type="text"
                placeholder="Search by title, skill, or keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#13131a] border border-white/10 rounded-xl text-sm text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_20px_rgba(124,106,255,0.3)] transition-all"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`px-4 py-3 text-sm font-semibold rounded-xl border transition-all flex items-center gap-2 ${showFilters ? "bg-[#7c6aff]/10 border-[#7c6aff]/40 text-white" : "bg-[#13131a] border-white/10 text-[#9090aa] hover:border-white/20"}`}
            >
              <FaFilter className="text-xs" /> Filters
            </button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2.5 text-xs bg-[#13131a] border border-white/10 rounded-xl text-white outline-none focus:border-[#7c6aff]/50"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="px-3 py-2.5 text-xs bg-[#13131a] border border-white/10 rounded-xl text-white outline-none focus:border-[#7c6aff]/50"
              >
                {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="px-3 py-2.5 text-xs bg-[#13131a] border border-white/10 rounded-xl text-white outline-none focus:border-[#7c6aff]/50"
              >
                {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l === "Any" ? "" : l}>{l === "Any" ? "All Levels" : l}</option>)}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2.5 text-xs bg-[#13131a] border border-white/10 rounded-xl text-white outline-none focus:border-[#7c6aff]/50"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Project list */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 text-[#9090aa]">
            <p className="text-xl mb-2">No projects found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#9090aa] mb-5">{pagination.total} projects found</p>
            <div className="flex flex-col gap-3">
              {projects.map((p) => (
                <Link
                  key={p._id}
                  href={`/projects/${p._id}`}
                  className="group block bg-[#13131a] border border-white/8 rounded-2xl p-5 hover:border-[#7c6aff]/30 hover:bg-[#13131a]/80 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {p.category && (
                          <span className="text-xs font-medium text-[#7c6aff] bg-[#7c6aff]/10 px-2.5 py-0.5 rounded-full">
                            {p.category}
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${p.projectType === "hourly" ? "text-cyan-400 border-cyan-500/20 bg-cyan-500/10" : "text-green-400 border-green-500/20 bg-green-500/10"}`}>
                          {p.projectType === "hourly" ? "Hourly" : "Fixed Price"}
                        </span>
                        {p.experienceLevel && p.experienceLevel !== "Any" && (
                          <span className="text-xs text-[#9090aa] border border-white/10 px-2.5 py-0.5 rounded-full">
                            {p.experienceLevel}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-semibold text-white group-hover:text-[#a99aff] transition-colors line-clamp-1 mb-1.5">
                        {p.title}
                      </h2>
                      <p className="text-sm text-[#9090aa] line-clamp-2 leading-relaxed mb-3">{p.description}</p>
                      {p.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {p.skills.slice(0, 6).map((s) => (
                            <span key={s} className="text-xs text-[#9090aa] bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                          {p.skills.length > 6 && (
                            <span className="text-xs text-[#68687d]">+{p.skills.length - 6} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row sm:flex-col items-start sm:items-end gap-3 shrink-0">
                      <div className="text-base font-bold text-white">{formatBudget(p)}</div>
                      <div className="flex items-center gap-3 text-xs text-[#68687d]">
                        <span className="flex items-center gap-1">
                          <FaBolt className="text-[9px]" /> {p.proposalCount} proposals
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-[9px]" /> {timeAgo(p.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-white/10 text-[#9090aa] hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <FaChevronLeft className="text-xs" />
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 text-xs font-semibold rounded-xl border transition-all ${page === p ? "bg-[#7c6aff]/20 border-[#7c6aff] text-white" : "border-white/10 text-[#9090aa] hover:text-white hover:border-white/20"}`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-xl border border-white/10 text-[#9090aa] hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
