"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FaArrowLeft, FaPlus, FaTimes, FaSave, FaUser, FaBriefcase, FaGraduationCap, FaFolderOpen } from "react-icons/fa";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SKILLS_SUGGESTIONS = [
  "React", "Next.js", "Node.js", "TypeScript", "JavaScript", "Python",
  "Figma", "UI/UX Design", "MongoDB", "PostgreSQL", "AWS", "Docker",
  "Flutter", "React Native", "TailwindCSS", "GraphQL",
];
const AVAILABILITY_OPTIONS = ["Available", "Not Available", "Available Soon"];
const LANGUAGE_OPTIONS = ["English", "Bengali", "Spanish", "French", "Arabic", "Hindi", "German", "Japanese"];

type Tab = "overview" | "experience" | "education" | "portfolio";

interface Experience {
  _id?: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  _id?: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface PortfolioItem {
  _id?: string;
  title: string;
  description: string;
  technologies: string;
  category: string;
  projectUrl: string;
}

function EditProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "overview";

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // ── Overview fields ──
  const [overview, setOverview] = useState({
    fullName: "", location: "", bio: "",
    title: "", hourlyRate: "", availability: "Available",
    skills: [] as string[], languages: [] as string[],
    overview: "",
  });
  const [skillInput, setSkillInput] = useState("");

  // ── Experience ──
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [expForm, setExpForm] = useState<Experience>({
    title: "", company: "", startDate: "", endDate: "", current: false, description: "",
  });
  const [addingExp, setAddingExp] = useState(false);

  // ── Education ──
  const [educations, setEducations] = useState<Education[]>([]);
  const [eduForm, setEduForm] = useState<Education>({
    school: "", degree: "", field: "", startDate: "", endDate: "",
  });
  const [addingEdu, setAddingEdu] = useState(false);

  // ── Portfolio ──
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [portForm, setPortForm] = useState<PortfolioItem>({
    title: "", description: "", technologies: "", category: "", projectUrl: "",
  });
  const [addingPort, setAddingPort] = useState(false);

  // Load existing profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const stored = localStorage.getItem("user");
        if (stored) {
          try { setUserId(JSON.parse(stored).id); } catch { /* ignore */ }
        }
        const res = await fetch(`${API}/api/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          const u = data.data;
          const p = u.profile || {};
          setOverview({
            fullName: u.fullName || "",
            location: u.location || "",
            bio: u.bio || "",
            title: p.title || "",
            hourlyRate: p.hourlyRate ? String(p.hourlyRate) : "",
            availability: p.availability || "Available",
            skills: p.skills || [],
            languages: p.languages || [],
            overview: p.overview || "",
          });
          setExperiences(p.experiences || []);
          setEducations(p.educations || []);
          setPortfolio((p.portfolio || []).map((item: PortfolioItem & { technologies?: string[] }) => ({
            ...item,
            technologies: Array.isArray(item.technologies) ? item.technologies.join(", ") : (item.technologies || ""),
          })));
        }
      } catch { /* ignore */ }
    };
    void loadProfile();
  }, []);

  // ── Save overview ──
  const saveOverview = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const body = {
        fullName: overview.fullName,
        location: overview.location,
        bio: overview.bio,
        title: overview.title,
        hourlyRate: overview.hourlyRate ? Number(overview.hourlyRate) : undefined,
        availability: overview.availability,
        skills: overview.skills,
        languages: overview.languages,
        overview: overview.overview,
      };
      const res = await fetch(`${API}/api/profiles/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to save.");
      toast.success("Profile updated!");
      // Update localStorage name
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const u = JSON.parse(stored);
          localStorage.setItem("user", JSON.stringify({ ...u, fullName: overview.fullName }));
        } catch { /* ignore */ }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ── Add experience ──
  const addExperience = async () => {
    if (!expForm.title || !expForm.company) { toast.error("Title and company are required."); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/profiles/experience`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(expForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to add.");
      setExperiences((prev) => [...prev, data.data]);
      setExpForm({ title: "", company: "", startDate: "", endDate: "", current: false, description: "" });
      setAddingExp(false);
      toast.success("Experience added.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ── Add education ──
  const addEducation = async () => {
    if (!eduForm.school || !eduForm.degree) { toast.error("School and degree are required."); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/profiles/education`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(eduForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to add.");
      setEducations((prev) => [...prev, data.data]);
      setEduForm({ school: "", degree: "", field: "", startDate: "", endDate: "" });
      setAddingEdu(false);
      toast.success("Education added.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ── Add portfolio project ──
  const addPortfolioItem = async () => {
    if (!portForm.title) { toast.error("Title is required."); return; }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const body = {
        ...portForm,
        technologies: portForm.technologies
          ? portForm.technologies.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };
      const res = await fetch(`${API}/api/profiles/portfolio`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to add.");
      setPortfolio((prev) => [...prev, { ...data.data, technologies: portForm.technologies }]);
      setPortForm({ title: "", description: "", technologies: "", category: "", projectUrl: "" });
      setAddingPort(false);
      toast.success("Portfolio project added.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (s: string) => {
    const skill = s.trim();
    if (skill && !overview.skills.includes(skill)) {
      setOverview((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
    setSkillInput("");
  };

  const removeSkill = (s: string) =>
    setOverview((prev) => ({ ...prev, skills: prev.skills.filter((x) => x !== s) }));

  const toggleLanguage = (lang: string) =>
    setOverview((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <FaUser className="text-xs" /> },
    { id: "experience", label: "Experience", icon: <FaBriefcase className="text-xs" /> },
    { id: "education", label: "Education", icon: <FaGraduationCap className="text-xs" /> },
    { id: "portfolio", label: "Portfolio", icon: <FaFolderOpen className="text-xs" /> },
  ];

  return (
    <main className="min-h-screen bg-[#08080d] text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {userId && (
              <Link href={`/freelancers/${userId}`} className="flex items-center gap-2 text-[#9090aa] text-sm hover:text-white transition-colors">
                <FaArrowLeft className="text-xs" /> View Profile
              </Link>
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-1">Edit Profile</h1>
        <p className="text-[#9090aa] text-sm mb-6">Keep your profile up to date to attract the right clients.</p>

        {/* Tabs */}
        <div className="flex gap-1.5 flex-wrap mb-6 bg-[#13131a] border border-white/8 rounded-2xl p-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl flex-1 justify-center transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] text-white shadow-[0_0_12px_rgba(124,106,255,0.2)]"
                  : "text-[#9090aa] hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <form onSubmit={saveOverview} className="flex flex-col gap-5">

            {/* Basic info */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#9090aa] mb-1.5">Full Name</label>
                  <input type="text" value={overview.fullName}
                    onChange={(e) => setOverview((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Your full name"
                    className="w-full px-3 py-2.5 text-sm bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50" />
                </div>
                <div>
                  <label className="block text-xs text-[#9090aa] mb-1.5">Professional Title</label>
                  <input type="text" value={overview.title}
                    onChange={(e) => setOverview((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Full Stack Developer"
                    className="w-full px-3 py-2.5 text-sm bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50" />
                </div>
                <div>
                  <label className="block text-xs text-[#9090aa] mb-1.5">Location</label>
                  <input type="text" value={overview.location}
                    onChange={(e) => setOverview((p) => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Dhaka, Bangladesh"
                    className="w-full px-3 py-2.5 text-sm bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50" />
                </div>
                <div>
                  <label className="block text-xs text-[#9090aa] mb-1.5">Hourly Rate ($/hr)</label>
                  <input type="number" min={0} value={overview.hourlyRate}
                    onChange={(e) => setOverview((p) => ({ ...p, hourlyRate: e.target.value }))}
                    placeholder="e.g. 25"
                    className="w-full px-3 py-2.5 text-sm bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs text-[#9090aa] mb-1.5">Availability</label>
                <div className="flex gap-2 flex-wrap">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button key={opt} type="button"
                      onClick={() => setOverview((p) => ({ ...p, availability: opt }))}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                        overview.availability === opt
                          ? "bg-[#7c6aff]/15 border-[#7c6aff] text-white"
                          : "bg-[#0d0d14] border-white/10 text-[#9090aa] hover:border-white/20"
                      }`}>{opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Overview text */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <label className="block text-sm font-semibold text-white mb-3">Professional Overview</label>
              <textarea value={overview.overview}
                onChange={(e) => setOverview((p) => ({ ...p, overview: e.target.value }))}
                placeholder="Describe your expertise, what you specialize in, and what clients can expect when working with you..."
                rows={6}
                className="w-full px-3 py-2.5 text-sm bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 resize-none" />
              <p className="text-xs text-[#68687d] mt-1.5">{overview.overview.length} characters</p>
            </div>

            {/* Skills */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <label className="block text-sm font-semibold text-white mb-3">Skills</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }}
                  placeholder="Type a skill and press Enter"
                  className="flex-1 px-3 py-2.5 text-sm bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50" />
                <button type="button" onClick={() => addSkill(skillInput)}
                  className="px-3 py-2.5 text-xs font-semibold text-[#7c6aff] border border-[#7c6aff]/30 rounded-xl hover:bg-[#7c6aff]/10 transition-all flex items-center gap-1">
                  <FaPlus className="text-[10px]" /> Add
                </button>
              </div>
              {/* Suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {SKILLS_SUGGESTIONS.filter((s) => !overview.skills.includes(s)).slice(0, 10).map((s) => (
                  <button key={s} type="button" onClick={() => addSkill(s)}
                    className="text-xs text-[#68687d] bg-white/4 border border-white/8 px-2 py-0.5 rounded-full hover:text-[#7c6aff] hover:border-[#7c6aff]/30 transition-all">
                    + {s}
                  </button>
                ))}
              </div>
              {overview.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {overview.skills.map((s) => (
                    <span key={s} className="flex items-center gap-1.5 text-xs bg-[#7c6aff]/10 border border-[#7c6aff]/20 text-[#a99aff] px-3 py-1 rounded-full">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)} className="text-[#9090aa] hover:text-white transition-colors">
                        <FaTimes className="text-[9px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Languages */}
            <div className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
              <label className="block text-sm font-semibold text-white mb-3">Languages</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                      overview.languages.includes(lang)
                        ? "bg-[#4ecdc4]/10 border-[#4ecdc4]/30 text-[#4ecdc4]"
                        : "bg-[#0d0d14] border-white/10 text-[#9090aa] hover:border-white/20"
                    }`}>{lang}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full py-3.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_20px_rgba(124,106,255,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              <FaSave className="text-xs" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}

        {/* ── Experience Tab ── */}
        {activeTab === "experience" && (
          <div className="flex flex-col gap-4">
            {/* Existing */}
            {experiences.map((exp, i) => (
              <div key={exp._id || i} className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{exp.title}</h3>
                    <p className="text-xs text-[#9090aa]">{exp.company} · {exp.current ? "Present" : exp.endDate ? new Date(exp.endDate).getFullYear() : ""}</p>
                    {exp.description && <p className="text-xs text-[#c0c0d0] mt-1">{exp.description}</p>}
                  </div>
                </div>
              </div>
            ))}

            {/* Add form */}
            {addingExp ? (
              <div className="bg-[#13131a] border border-[#7c6aff]/25 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">New Experience</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {[
                    { label: "Job Title *", key: "title", placeholder: "e.g. Senior Developer" },
                    { label: "Company *", key: "company", placeholder: "e.g. Acme Inc." },
                    { label: "Start Date", key: "startDate", type: "date" },
                    { label: "End Date", key: "endDate", type: "date" },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label className="block text-xs text-[#9090aa] mb-1.5">{label}</label>
                      <input type={type || "text"}
                        value={expForm[key as keyof Experience] as string}
                        onChange={(e) => setExpForm((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        disabled={key === "endDate" && expForm.current}
                        className="w-full px-3 py-2.5 text-sm bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 disabled:opacity-40 [color-scheme:dark]" />
                    </div>
                  ))}
                </div>
                <label className="flex items-center gap-2 text-xs text-[#9090aa] mb-3 cursor-pointer">
                  <input type="checkbox" checked={expForm.current}
                    onChange={(e) => setExpForm((p) => ({ ...p, current: e.target.checked, endDate: "" }))}
                    className="w-3.5 h-3.5 rounded accent-[#7c6aff]" />
                  Currently working here
                </label>
                <div className="mb-4">
                  <label className="block text-xs text-[#9090aa] mb-1.5">Description</label>
                  <textarea value={expForm.description}
                    onChange={(e) => setExpForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe your responsibilities and achievements..."
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={addExperience} disabled={saving}
                    className="px-4 py-2.5 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] disabled:opacity-50 transition-all">
                    {saving ? "Saving..." : "Save Experience"}
                  </button>
                  <button onClick={() => setAddingExp(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-[#9090aa] rounded-xl border border-white/10 hover:text-white transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingExp(true)}
                className="flex items-center justify-center gap-2 w-full py-4 text-sm font-medium text-[#7c6aff] border border-dashed border-[#7c6aff]/30 rounded-2xl hover:bg-[#7c6aff]/5 transition-all">
                <FaPlus className="text-xs" /> Add Work Experience
              </button>
            )}
          </div>
        )}

        {/* ── Education Tab ── */}
        {activeTab === "education" && (
          <div className="flex flex-col gap-4">
            {educations.map((edu, i) => (
              <div key={edu._id || i} className="bg-[#13131a] border border-white/8 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white">{edu.school}</h3>
                <p className="text-xs text-[#9090aa]">{edu.degree}{edu.field ? `, ${edu.field}` : ""}</p>
                {edu.startDate && <p className="text-xs text-[#68687d] mt-0.5">{new Date(edu.startDate).getFullYear()} – {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}</p>}
              </div>
            ))}

            {addingEdu ? (
              <div className="bg-[#13131a] border border-[#7c6aff]/25 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">New Education</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "School / University *", key: "school", placeholder: "e.g. BUET" },
                    { label: "Degree *", key: "degree", placeholder: "e.g. B.Sc. in CSE" },
                    { label: "Field of Study", key: "field", placeholder: "e.g. Computer Science" },
                    { label: "Start Date", key: "startDate", type: "date" },
                    { label: "End Date", key: "endDate", type: "date" },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label className="block text-xs text-[#9090aa] mb-1.5">{label}</label>
                      <input type={type || "text"}
                        value={eduForm[key as keyof Education] as string}
                        onChange={(e) => setEduForm((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-3 py-2.5 text-sm bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 [color-scheme:dark]" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={addEducation} disabled={saving}
                    className="px-4 py-2.5 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] disabled:opacity-50 transition-all">
                    {saving ? "Saving..." : "Save Education"}
                  </button>
                  <button onClick={() => setAddingEdu(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-[#9090aa] rounded-xl border border-white/10 hover:text-white transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingEdu(true)}
                className="flex items-center justify-center gap-2 w-full py-4 text-sm font-medium text-[#7c6aff] border border-dashed border-[#7c6aff]/30 rounded-2xl hover:bg-[#7c6aff]/5 transition-all">
                <FaPlus className="text-xs" /> Add Education
              </button>
            )}
          </div>
        )}

        {/* ── Portfolio Tab ── */}
        {activeTab === "portfolio" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {portfolio.map((item, i) => (
                <div key={item._id || i} className="bg-[#13131a] border border-white/8 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                  {item.category && <span className="text-[10px] text-[#7c6aff] bg-[#7c6aff]/10 px-2 py-0.5 rounded-full">{item.category}</span>}
                  <p className="text-xs text-[#9090aa] line-clamp-2 mt-1.5 mb-2">{item.description}</p>
                  {item.technologies && (
                    <div className="flex flex-wrap gap-1">
                      {(typeof item.technologies === "string" ? item.technologies.split(",") : item.technologies)
                        .slice(0, 4).map((t: string) => (
                          <span key={t} className="text-xs text-[#7c6aff] bg-[#7c6aff]/10 px-2 py-0.5 rounded-full">{t.trim()}</span>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {addingPort ? (
              <div className="bg-[#13131a] border border-[#7c6aff]/25 rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">New Portfolio Project</h3>
                <div className="flex flex-col gap-3 mb-4">
                  {[
                    { label: "Project Title *", key: "title", placeholder: "e.g. E-commerce Dashboard" },
                    { label: "Category", key: "category", placeholder: "e.g. Web Development" },
                    { label: "Technologies (comma-separated)", key: "technologies", placeholder: "e.g. React, Node.js, MongoDB" },
                    { label: "Live URL", key: "projectUrl", placeholder: "https://..." },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs text-[#9090aa] mb-1.5">{label}</label>
                      <input type={key === "projectUrl" ? "url" : "text"}
                        value={portForm[key as keyof PortfolioItem]}
                        onChange={(e) => setPortForm((p) => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-3 py-2.5 text-sm bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-[#9090aa] mb-1.5">Description</label>
                    <textarea value={portForm.description}
                      onChange={(e) => setPortForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Describe the project, your role, and the problem it solves..."
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm bg-[#0d0d14] border border-white/10 rounded-xl text-white placeholder-[#68687d] outline-none focus:border-[#7c6aff]/50 resize-none" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addPortfolioItem} disabled={saving}
                    className="px-4 py-2.5 text-xs font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] disabled:opacity-50 transition-all">
                    {saving ? "Saving..." : "Save Project"}
                  </button>
                  <button onClick={() => setAddingPort(false)}
                    className="px-4 py-2.5 text-xs font-semibold text-[#9090aa] rounded-xl border border-white/10 hover:text-white transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingPort(true)}
                className="flex items-center justify-center gap-2 w-full py-4 text-sm font-medium text-[#7c6aff] border border-dashed border-[#7c6aff]/30 rounded-2xl hover:bg-[#7c6aff]/5 transition-all">
                <FaPlus className="text-xs" /> Add Portfolio Project
              </button>
            )}
          </div>
        )}

      </div>
    </main>
  );
}

export default function EditProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["Freelancer"]}>
      <Suspense fallback={<div className="min-h-screen bg-[#08080d] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]" /></div>}>
        <EditProfileContent />
      </Suspense>
    </ProtectedRoute>
  );
}
