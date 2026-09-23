"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaSearch, FaStar, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Members" },
  { value: "rate_high", label: "Rate: High to Low" },
  { value: "rate_low", label: "Rate: Low to High" },
];

const SKILL_SUGGESTIONS = ["React", "Node.js", "Python", "Figma", "TypeScript", "Flutter", "AWS", "MongoDB", "Next.js", "TailwindCSS"];

interface Freelancer {
  _id: string;
  fullName: string;
  email: string;
  createdAt: string;
  profile?: {
    title?: string;
    overview?: string;
    hourlyRate?: number;
    skills?: string[];
    availability?: string;
    avatar?: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const AVATAR_COLORS = [
  "from-[#7c6aff] to-[#5b4fcf]", "from-[#ff6a9e] to-[#d44d80]",
  "from-[#4ecdc4] to-[#35a8a0]", "from-[#f7c59f] to-[#e8975e]",
  "from-[#a8edea] to-[#4ecdc4]",
];

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [skills, setSkills] = useState("");
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const fetchFreelancers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: "12", sort });
      if (keyword) params.set("keyword", keyword);
      if (skills) params.set("skills", skills);
      if (minRate) params.set("minRate", minRate);
      if (maxRate) params.set("maxRate", maxRate);
      const res = await fetch(`${API}/api/profiles/freelancers?${params}`);
      const data = await res.json();
      if (data.success) {
        setFreelancers(data.data);
        setPagination(data.pagination);
      }
    } catch {
      toast.error("Failed to load freelancers.");
    } finally {
      setLoading(false);
    }
  }, [keyword, skills, minRate, maxRate, sort]);

  useEffect(() => { setPage(1); void fetchFreelancers(1); }, [sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    void fetchFreelancers(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    void fetchFreelancers(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const avatarColor = (id: string) => AVATAR_COLORS[id.charCodeAt(id.length - 1) % AVATAR_COLORS.length];

  return (
    <main className="min-h-screen bg-[#08080d] text-white">
      {/* Header */}
      <div className="border-b border-white/8 bg-[#09090f]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-1">Find Freelancers</h1>
          <p className="text-[#9090aa] text-sm">Browse {pagination.total.toLocaleString()} skilled professionals ready to work with you.</p>

          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9090aa] text-sm" />
              <input
                type="text"
                placeholder="Search by name or keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#13131a] border border-white/10 rounded-xl text-sm text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 transition-colors"
              />
            </div>
            <button type="submit" className="px-6 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_20px_rgba(124,106,255,0.3)] transition-all">
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

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-3 max-w-3xl">
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Skills (comma separated)"
                className="px-3 py-2.5 text-xs bg-[#13131a] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 w-56"
              />
              <input
                type="number"
                value={minRate}
                onChange={(e) => setMinRate(e.target.value)}
                placeholder="Min $/hr"
                className="px-3 py-2.5 text-xs bg-[#13131a] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 w-28"
              />
              <input
                type="number"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                placeholder="Max $/hr"
                className="px-3 py-2.5 text-xs bg-[#13131a] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 w-28"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2.5 text-xs bg-[#13131a] border border-white/10 rounded-xl text-white outline-none focus:border-[#7c6aff]/50"
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          )}

          {/* Skill suggestions */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-[#68687d]">Popular:</span>
            {SKILL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setSkills(s); setPage(1); void fetchFreelancers(1); }}
                className="text-xs text-[#9090aa] bg-white/5 border border-white/8 px-2.5 py-0.5 rounded-full hover:text-white hover:border-[#7c6aff]/40 hover:bg-[#7c6aff]/10 transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" />
          </div>
        ) : freelancers.length === 0 ? (
          <div className="text-center py-24 text-[#9090aa]">
            <p className="text-xl mb-2">No freelancers found</p>
            <p className="text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#9090aa] mb-5">{pagination.total} freelancers found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {freelancers.map((fl) => (
                <Link
                  key={fl._id}
                  href={`/freelancers/${fl._id}`}
                  className="group bg-[#13131a] border border-white/8 rounded-2xl p-5 hover:border-[#7c6aff]/30 hover:-translate-y-1 transition-all flex flex-col items-center text-center"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColor(fl._id)} flex items-center justify-center text-xl font-bold text-white mb-3 group-hover:shadow-[0_0_20px_rgba(124,106,255,0.25)] transition-all`}>
                    {fl.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1 mb-0.5">
                    <h3 className="text-sm font-semibold text-white group-hover:text-[#a99aff] transition-colors">{fl.fullName}</h3>
                    <MdVerified className="text-[#4ecdc4] text-sm shrink-0" />
                  </div>
                  <p className="text-xs text-[#9090aa] mb-2">{fl.profile?.title || "Freelancer"}</p>
                  {fl.profile?.hourlyRate && (
                    <p className="text-sm font-bold text-[#7c6aff] mb-3">${fl.profile.hourlyRate}/hr</p>
                  )}
                  {fl.profile?.skills && fl.profile.skills.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                      {fl.profile.skills.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs text-[#9090aa] bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                      {fl.profile.skills.length > 3 && (
                        <span className="text-xs text-[#68687d]">+{fl.profile.skills.length - 3}</span>
                      )}
                    </div>
                  )}
                  <span className="mt-auto w-full py-2 text-xs font-semibold text-[#9090aa] border border-white/8 rounded-xl group-hover:text-white group-hover:border-[#7c6aff]/40 group-hover:bg-[#7c6aff]/8 transition-all">
                    View Profile
                  </span>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="p-2 rounded-xl border border-white/10 text-[#9090aa] hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <FaChevronLeft className="text-xs" />
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => handlePageChange(p)} className={`w-9 h-9 text-xs font-semibold rounded-xl border transition-all ${page === p ? "bg-[#7c6aff]/20 border-[#7c6aff] text-white" : "border-white/10 text-[#9090aa] hover:text-white hover:border-white/20"}`}>{p}</button>
                ))}
                <button onClick={() => handlePageChange(page + 1)} disabled={page === pagination.totalPages} className="p-2 rounded-xl border border-white/10 text-[#9090aa] hover:text-white hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
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
