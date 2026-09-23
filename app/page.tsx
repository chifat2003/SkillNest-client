"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FaBrain, FaBolt, FaShieldAlt, FaStar, FaCheckCircle,
  FaChevronDown, FaChevronUp, FaSearch, FaRocket, FaUsers,
  FaCode, FaPalette, FaPenNib, FaChartLine, FaMobileAlt,
  FaArrowRight, FaPlay, FaQuoteLeft, FaGlobe, FaClock,
  FaLock, FaAward, FaThumbsUp, FaDollarSign,
} from "react-icons/fa";
import { MdAutoAwesome, MdVerified } from "react-icons/md";

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Counter Animation Hook ───────────────────────────────────────────────────
function useCounter(end: number, duration = 2000, suffix = "") {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = end / (duration / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= end) { setCount(end); clearInterval(timer); } else { setCount(Math.floor(start)); }
          }, 16);
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);
  return { ref, display: `${count.toLocaleString()}${suffix}` };
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { step: "01", icon: <FaSearch />, title: "Post or Browse", desc: "Clients post projects with budgets and requirements. Freelancers browse and filter thousands of listings." },
  { step: "02", icon: <FaBrain />, title: "AI Matching", desc: "Our intelligent engine scores compatibility and surfaces the best matches for both sides instantly." },
  { step: "03", icon: <FaUsers />, title: "Connect & Collaborate", desc: "Chat, share files, and manage milestones in a seamless built-in workspace." },
  { step: "04", icon: <FaShieldAlt />, title: "Secure Payment", desc: "Funds are held in escrow and released only when work is approved — zero risk for both parties." },
];

const FREELANCER_BENEFITS = [
  { icon: <FaDollarSign />, title: "Competitive Earnings", desc: "Set your own rates. Keep up to 90% of what you earn with our industry-leading low commission." },
  { icon: <FaGlobe />, title: "Global Clients", desc: "Access clients from 180+ countries. Work from anywhere, anytime, on your terms." },
  { icon: <FaAward />, title: "Build Your Reputation", desc: "Earn verified badges, skill endorsements, and a portfolio that speaks for itself." },
  { icon: <FaClock />, title: "Flexible Schedule", desc: "Work on your own schedule. Pick projects that fit your life — not the other way around." },
];

const CLIENT_BENEFITS = [
  { icon: <FaBolt />, title: "Fast Hiring", desc: "Go from posting to first proposal in under an hour. Our AI shortlists top candidates instantly." },
  { icon: <FaLock />, title: "Risk-Free Payments", desc: "Milestone-based escrow ensures you only pay for approved, quality deliverables." },
  { icon: <FaThumbsUp />, title: "Verified Talent", desc: "Every freelancer is skill-tested and identity-verified before they appear in search results." },
  { icon: <FaChartLine />, title: "Track Progress", desc: "Real-time project dashboards, time tracking, and delivery milestones keep everything transparent." },
];

const AI_FEATURES = [
  { icon: <FaBrain />, title: "Smart Talent Matching", desc: "AI analyzes 50+ signals to match your project with the perfect freelancer in seconds.", color: "from-[#7c6aff] to-[#5b4fcf]" },
  { icon: <MdAutoAwesome />, title: "Proposal Scoring", desc: "Automated proposal ranking highlights the highest-quality bids so you never miss great talent.", color: "from-[#ff6a9e] to-[#d44d80]" },
  { icon: <FaChartLine />, title: "Pricing Intelligence", desc: "Real-time market data suggests fair rates for both clients and freelancers.", color: "from-[#4ecdc4] to-[#35a8a0]" },
  { icon: <FaShieldAlt />, title: "Fraud Detection", desc: "Behavioral AI monitors every interaction to keep the platform safe 24/7.", color: "from-[#f7c59f] to-[#e8975e]" },
  { icon: <FaBolt />, title: "Auto Contract Drafting", desc: "One click generates a professional contract tailored to your project scope.", color: "from-[#a8edea] to-[#4ecdc4]" },
  { icon: <FaGlobe />, title: "Real-time Translation", desc: "Built-in AI translation removes language barriers across 60+ languages.", color: "from-[#7c6aff] to-[#ff6a9e]" },
];

const FEATURED_PROJECTS = [
  { category: "Web Development", title: "Build a SaaS Dashboard with Next.js & TypeScript", budget: "$1,200 – $2,500", skills: ["Next.js", "TypeScript", "Tailwind"], proposals: 12, urgent: true },
  { category: "Mobile App", title: "iOS & Android Fitness Tracking App with AI Coach", budget: "$3,000 – $6,000", skills: ["React Native", "Firebase", "AI"], proposals: 8, urgent: false },
  { category: "UI/UX Design", title: "Complete Brand Identity & Design System for Fintech", budget: "$800 – $1,500", skills: ["Figma", "Branding", "Design Systems"], proposals: 21, urgent: false },
  { category: "AI & ML", title: "Custom Chatbot with RAG Architecture for E-commerce", budget: "$2,000 – $4,000", skills: ["Python", "LangChain", "OpenAI"], proposals: 6, urgent: true },
  { category: "Content Writing", title: "Technical Blog Content for Developer Tool Startup", budget: "$300 – $600", skills: ["Technical Writing", "SEO", "Dev Content"], proposals: 15, urgent: false },
  { category: "Backend", title: "Scalable Microservices API with Node.js & Kubernetes", budget: "$1,800 – $3,500", skills: ["Node.js", "Docker", "Kubernetes"], proposals: 9, urgent: true },
];

const FEATURED_FREELANCERS = [
  { name: "Aria Chen", role: "Full-Stack Developer", avatar: "AC", rating: 4.9, reviews: 127, skills: ["React", "Node.js", "AWS"], hourly: "$85", location: "Singapore", verified: true, color: "from-[#7c6aff] to-[#5b4fcf]" },
  { name: "Marcus Reid", role: "UI/UX Designer", avatar: "MR", rating: 5.0, reviews: 84, skills: ["Figma", "Framer", "Prototyping"], hourly: "$75", location: "London, UK", verified: true, color: "from-[#ff6a9e] to-[#d44d80]" },
  { name: "Priya Sharma", role: "AI/ML Engineer", avatar: "PS", rating: 4.8, reviews: 63, skills: ["Python", "TensorFlow", "LLMs"], hourly: "$110", location: "Bangalore, IN", verified: true, color: "from-[#4ecdc4] to-[#35a8a0]" },
  { name: "Lucas Torres", role: "Mobile Developer", avatar: "LT", rating: 4.9, reviews: 98, skills: ["Flutter", "Swift", "Firebase"], hourly: "$90", location: "São Paulo, BR", verified: true, color: "from-[#f7c59f] to-[#e8975e]" },
];

const TESTIMONIALS = [
  { name: "Sarah Mitchell", role: "Product Manager, TechCorp", avatar: "SM", text: "SkillNest's AI matching found us a perfect React developer in under 2 hours. The quality of talent is remarkable — we've now hired 8 freelancers through the platform.", rating: 5, color: "from-[#7c6aff] to-[#5b4fcf]" },
  { name: "David Park", role: "Senior Freelancer", avatar: "DP", text: "I've used every major freelance platform. SkillNest's lower fees and smarter matching have tripled my monthly earnings. The escrow system gives me complete peace of mind.", rating: 5, color: "from-[#ff6a9e] to-[#d44d80]" },
  { name: "Emma Laurent", role: "Startup Founder", avatar: "EL", text: "We built our entire MVP with SkillNest freelancers in 6 weeks. The collaboration tools, milestone tracking, and payment escrow made the whole experience incredibly smooth.", rating: 5, color: "from-[#4ecdc4] to-[#35a8a0]" },
];

const FAQS = [
  { q: "How does SkillNest's AI matching work?", a: "Our AI analyzes your project requirements, budget, timeline, and preferred working style against 50+ data points from freelancer profiles, past performance, and skill assessments. It then ranks candidates by compatibility score, so you always see the best matches first." },
  { q: "What are SkillNest's platform fees?", a: "Freelancers pay just 10% on their first $10,000 with a client, dropping to 5% thereafter — one of the lowest in the industry. Clients pay a flat 3% payment processing fee. No hidden charges, ever." },
  { q: "How does the escrow payment system work?", a: "Clients fund project milestones upfront. The funds are held securely in escrow and only released to the freelancer once you review and approve the delivered work. If there's a dispute, our resolution team steps in." },
  { q: "Are freelancers skill-verified?", a: "Yes. All freelancers complete skill assessments relevant to their listed expertise. Top performers earn Verified badges and Pro status, which appear prominently in search results." },
  { q: "Can I hire a team of freelancers for a large project?", a: "Absolutely. SkillNest supports team hiring. You can bring together multiple freelancers — a developer, designer, and project manager, for example — under a single project workspace with shared milestones and communication." },
  { q: "Is my intellectual property protected?", a: "Yes. Every contract includes automatic IP transfer clauses. Once payment is released, all work product is legally yours. Our legal team has crafted bulletproof contracts reviewed in 50+ jurisdictions." },
];

const STATS = [
  { value: 250000, suffix: "+", label: "Active Freelancers" },
  { value: 50000, suffix: "+", label: "Projects Completed" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
  { value: 180, suffix: "+", label: "Countries Served" },
];

const CATEGORIES = [
  { icon: <FaCode />, label: "Development", count: "48K+" },
  { icon: <FaPalette />, label: "Design", count: "22K+" },
  { icon: <FaPenNib />, label: "Writing", count: "15K+" },
  { icon: <FaBrain />, label: "AI & ML", count: "9K+" },
  { icon: <FaMobileAlt />, label: "Mobile", count: "18K+" },
  { icon: <FaChartLine />, label: "Marketing", count: "12K+" },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar key={i} className={`text-xs ${i < rating ? "text-[#fbbf24]" : "text-white/15"}`} />
      ))}
    </div>
  );
}

function SkillBadge({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 text-xs font-medium text-[#9090aa] bg-white/5 rounded-full border border-white/8">
      {label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-[#7c6aff]/10 border border-[#7c6aff]/25 text-[#a99aff] text-xs font-semibold tracking-wider uppercase">
      <MdAutoAwesome className="text-[#7c6aff]" />
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"freelancer" | "client">("freelancer");

  const heroRef = useReveal();
  const introRef = useReveal();
  const howRef = useReveal();
  const benefitsRef = useReveal();
  const aiRef = useReveal();
  const projectsRef = useReveal();
  const freelancersRef = useReveal();
  const statsRef = useReveal();
  const testimonialsRef = useReveal();
  const faqRef = useReveal();
  const ctaRef = useReveal();

  const stat0 = useCounter(STATS[0].value, 2200);
  const stat1 = useCounter(STATS[1].value, 2000);
  const stat2 = useCounter(STATS[2].value, 1800);
  const stat3 = useCounter(STATS[3].value, 2000);
  const statRefs = [stat0, stat1, stat2, stat3];

  return (
    <div className="min-h-screen bg-[#08080d] text-white overflow-hidden">

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-68px)] flex items-center justify-center overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-[#7c6aff] opacity-[0.07] blur-[120px] animate-float-orb" />
          <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#ff6a9e] opacity-[0.06] blur-[100px] animate-float-orb delay-1000" />
          <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-[#4ecdc4] opacity-[0.04] blur-[80px] animate-float-orb delay-2000" />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)", backgroundSize: "80px 80px" }} />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <div ref={heroRef} className="section-reveal">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-[#7c6aff]/10 border border-[#7c6aff]/25 text-[#a99aff] text-xs font-semibold tracking-wider uppercase animate-pulse-glow">
              <MdAutoAwesome className="text-[#7c6aff]" />
              AI-Powered Freelance Marketplace
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Find the Right{" "}
              <span className="gradient-text">Talent.</span>
              <br />
              Build Better{" "}
              <span className="relative inline-block">
                Work.
                <span className="absolute -bottom-2 left-0 w-full h-1 rounded-full bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] opacity-60" />
              </span>
            </h1>

            <p className="text-lg text-[#9090aa] leading-relaxed mb-8 max-w-[520px]">
              Connect with skilled freelancers and clients through an intelligent marketplace.
              Our AI matches you with the perfect partner — fast, reliable, and risk-free.
            </p>

            {/* Search Bar */}
            <div className="relative mb-8 group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#7c6aff]/30 to-[#ff6a9e]/30 blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center bg-[#13131a] border border-white/10 rounded-2xl overflow-hidden group-focus-within:border-[#7c6aff]/50 transition-colors">
                <FaSearch className="ml-5 text-[#9090aa] flex-shrink-0" />
                <input
                  id="hero-search"
                  type="text"
                  placeholder="Search for skills, jobs, or freelancers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-4 bg-transparent text-white text-sm placeholder-[#68687d] outline-none"
                />
                <Link
                  href={`/search?q=${searchQuery}`}
                  id="hero-search-btn"
                  className="m-1.5 px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] shadow-[0_0_20px_rgba(124,106,255,0.35)] hover:shadow-[0_0_30px_rgba(124,106,255,0.55)] hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap"
                >
                  Search
                </Link>
              </div>
            </div>

            {/* Popular Searches */}
            <div className="flex flex-wrap gap-2 mb-10">
              <span className="text-[#68687d] text-xs">Popular:</span>
              {["React Developer", "UI Designer", "Python AI", "Mobile App"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 text-xs font-medium text-[#9090aa] bg-white/5 border border-white/8 rounded-full hover:text-white hover:border-[#7c6aff]/40 hover:bg-[#7c6aff]/10 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/freelancers"
                id="hero-cta-find-talent"
                className="group flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] shadow-[0_0_25px_rgba(124,106,255,0.4)] hover:shadow-[0_0_35px_rgba(124,106,255,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-200"
              >
                Find Freelancers
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/projects"
                id="hero-cta-find-work"
                className="group flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 hover:-translate-y-1 transition-all duration-200"
              >
                Find Projects
                <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-8 pt-8 border-t border-white/8">
              {[
                { icon: <FaShieldAlt className="text-[#7c6aff]" />, text: "Secure Escrow" },
                { icon: <MdVerified className="text-[#4ecdc4]" />, text: "Verified Talent" },
                { icon: <FaStar className="text-[#fbbf24]" />, text: "4.9/5 Rating" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-1.5 text-[#9090aa] text-xs">
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI Visual */}
          <div className="relative hidden lg:flex items-center justify-center">
            {/* Central orb */}
            <div className="relative w-[280px] h-[280px] flex items-center justify-center">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-[#7c6aff]/20 animate-spin-slow" />
              <div className="absolute inset-4 rounded-full border border-[#ff6a9e]/15 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "15s" }} />

              {/* Core */}
              <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] shadow-[0_0_60px_rgba(124,106,255,0.5)] flex flex-col items-center justify-center animate-float">
                <FaBrain className="text-5xl text-white drop-shadow-lg" />
                <span className="text-white text-xs font-semibold mt-1 opacity-80">AI Engine</span>
              </div>

              {/* Orbiting icons */}
              {[
                { icon: <FaCode className="text-[#7c6aff]" />, label: "Dev", top: "-10px", left: "50%", transform: "translateX(-50%)" },
                { icon: <FaPalette className="text-[#ff6a9e]" />, label: "Design", top: "50%", right: "-10px", transform: "translateY(-50%)" },
                { icon: <FaChartLine className="text-[#4ecdc4]" />, label: "Marketing", bottom: "-10px", left: "50%", transform: "translateX(-50%)" },
                { icon: <FaMobileAlt className="text-[#f7c59f]" />, label: "Mobile", top: "50%", left: "-10px", transform: "translateY(-50%)" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="absolute w-14 h-14 rounded-2xl glass-card flex flex-col items-center justify-center gap-0.5 shadow-lg"
                  style={{ top: item.top, left: item.left, right: item.right, bottom: item.bottom, transform: item.transform }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[9px] text-[#9090aa]">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Floating match cards */}
            <div className="absolute top-4 -right-4 w-52 glass-card rounded-2xl p-3 animate-float delay-300 shadow-xl border border-[#7c6aff]/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6aff] to-[#5b4fcf] flex items-center justify-center text-xs font-bold">AC</div>
                <div>
                  <p className="text-xs font-semibold text-white">Aria Chen</p>
                  <p className="text-[10px] text-[#9090aa]">Full-Stack Dev</p>
                </div>
                <div className="ml-auto text-[10px] font-bold text-[#4ecdc4]">98%</div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10">
                <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-[#7c6aff] to-[#4ecdc4]" />
              </div>
              <p className="text-[9px] text-[#9090aa] mt-1">AI Match Score</p>
            </div>

            <div className="absolute bottom-4 -left-4 w-48 glass-card rounded-2xl p-3 animate-float delay-600 shadow-xl border border-[#ff6a9e]/20">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FaCheckCircle className="text-[#4ecdc4] text-sm" />
                <span className="text-xs font-semibold text-white">Project Matched!</span>
              </div>
              <p className="text-[10px] text-[#9090aa]">SaaS Dashboard · Next.js</p>
              <p className="text-[10px] font-semibold text-[#7c6aff] mt-1">$1,500 · 2 weeks</p>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -left-8 glass-card rounded-xl p-2.5 animate-float delay-200 shadow-lg">
              <div className="flex items-center gap-1.5">
                <FaBolt className="text-[#fbbf24] text-xs" />
                <span className="text-[10px] text-white font-medium">12 proposals</span>
              </div>
              <p className="text-[9px] text-[#9090aa]">received · 2h ago</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#68687d] animate-bounce">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <FaChevronDown className="text-xs" />
        </div>
      </section>

      {/* ── PLATFORM INTRO / CATEGORIES ─────────────────────────────────────── */}
      <section className="relative py-24 border-t border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-[#7c6aff]/30 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div ref={introRef} className="section-reveal text-center mb-16">
            <SectionLabel>The Platform</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              One Platform, <span className="gradient-text">Infinite Possibilities</span>
            </h2>
            <p className="max-w-2xl mx-auto text-[#9090aa] text-lg leading-relaxed">
              Whether you&apos;re a business hiring for your next big project or a professional looking for meaningful work, SkillNest is built for you.
            </p>
          </div>

          {/* Category grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.label}
                href={`/category/${cat.label.toLowerCase()}`}
                id={`category-${cat.label.toLowerCase()}`}
                className="group flex flex-col items-center gap-3 p-5 glass-card rounded-2xl border border-white/5 hover:border-[#7c6aff]/30 hover:bg-[#7c6aff]/5 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c6aff]/20 to-[#ff6a9e]/10 flex items-center justify-center text-xl text-[#7c6aff] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(124,106,255,0.3)] transition-all duration-300">
                  {cat.icon}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white group-hover:text-[#a99aff] transition-colors">{cat.label}</p>
                  <p className="text-xs text-[#68687d] mt-0.5">{cat.count} freelancers</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-24 bg-[#09090f]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#7c6aff]/5 rounded-full blur-[120px] -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#ff6a9e]/5 rounded-full blur-[120px] -translate-y-1/2" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div ref={howRef} className="section-reveal text-center mb-16">
            <SectionLabel>Process</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              How <span className="gradient-text">SkillNest</span> Works
            </h2>
            <p className="max-w-xl mx-auto text-[#9090aa] text-lg">
              Four simple steps from idea to delivery — powered by AI every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[#7c6aff]/20 via-[#ff6a9e]/30 to-[#7c6aff]/20" />

            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative group">
                <div className="glass-card rounded-2xl p-6 border border-white/5 hover:border-[#7c6aff]/25 hover:bg-[#7c6aff]/3 transition-all duration-300 h-full">
                  {/* Step number */}
                  <div className="relative mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] flex items-center justify-center text-white text-lg shadow-[0_0_20px_rgba(124,106,255,0.3)] group-hover:shadow-[0_0_30px_rgba(124,106,255,0.5)] group-hover:scale-110 transition-all duration-300">
                      {step.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0a0a12] border border-[#7c6aff]/30 text-[10px] font-bold text-[#7c6aff] flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-[#9090aa] leading-relaxed">{step.desc}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-3 w-6 h-6 rounded-full bg-[#7c6aff]/20 border border-[#7c6aff]/30 z-10 flex items-center justify-center">
                    <FaArrowRight className="text-[#7c6aff] text-[8px]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS TABS ───────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={benefitsRef} className="section-reveal text-center mb-12">
            <SectionLabel>Benefits</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Built for <span className="gradient-text">Everyone</span>
            </h2>
            <p className="max-w-xl mx-auto text-[#9090aa] text-lg">
              Whether you hire or get hired, SkillNest is designed around your success.
            </p>

            {/* Tab switcher */}
            <div className="inline-flex mt-8 p-1 glass-card rounded-xl border border-white/8 gap-1">
              {(["freelancer", "client"] as const).map((tab) => (
                <button
                  key={tab}
                  id={`tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] text-white shadow-[0_0_20px_rgba(124,106,255,0.3)]"
                      : "text-[#9090aa] hover:text-white"
                  }`}
                >
                  {tab === "freelancer" ? "For Freelancers" : "For Clients"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(activeTab === "freelancer" ? FREELANCER_BENEFITS : CLIENT_BENEFITS).map((benefit, i) => (
              <div
                key={benefit.title}
                className="group glass-card rounded-2xl p-6 border border-white/5 hover:border-[#7c6aff]/25 hover:-translate-y-1.5 transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7c6aff]/20 to-[#ff6a9e]/10 flex items-center justify-center text-[#7c6aff] text-lg mb-4 group-hover:shadow-[0_0_20px_rgba(124,106,255,0.25)] transition-all">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-white text-base mb-2">{benefit.title}</h3>
                <p className="text-sm text-[#9090aa] leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI FEATURES ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#09090f]">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={aiRef} className="section-reveal text-center mb-16">
            <SectionLabel>Powered by AI</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Intelligence at <span className="gradient-text">Every Step</span>
            </h2>
            <p className="max-w-xl mx-auto text-[#9090aa] text-lg">
              Our AI doesn&apos;t just match — it learns, adapts, and continuously improves your experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {AI_FEATURES.map((feat, i) => (
              <div
                key={feat.title}
                className="group relative glass-card rounded-2xl p-6 border border-white/5 hover:border-white/10 hover:-translate-y-2 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient blob */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${feat.color} opacity-10 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
                <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feat.icon}
                </div>
                <h3 className="font-bold text-white text-base mb-2 relative">{feat.title}</h3>
                <p className="text-sm text-[#9090aa] leading-relaxed relative">{feat.desc}</p>
                <div className="flex items-center gap-1.5 mt-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4ecdc4] animate-pulse" />
                  <span className="text-[10px] text-[#68687d]">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROJECTS ───────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={projectsRef} className="section-reveal flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <SectionLabel>Open Projects</SectionLabel>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Featured <span className="gradient-text">Projects</span>
              </h2>
            </div>
            <Link href="/projects" className="flex items-center gap-2 text-sm font-semibold text-[#7c6aff] hover:text-[#a99aff] transition-colors">
              Browse All Projects <FaArrowRight className="text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURED_PROJECTS.map((proj, i) => (
              <Link
                key={proj.title}
                href="/projects"
                id={`project-card-${i}`}
                className="group glass-card rounded-2xl p-5 border border-white/5 hover:border-[#7c6aff]/25 hover:-translate-y-1.5 transition-all duration-300 block"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#7c6aff] bg-[#7c6aff]/10 px-2.5 py-1 rounded-full">
                    {proj.category}
                  </span>
                  {proj.urgent && (
                    <span className="text-xs font-semibold text-[#ff6a9e] bg-[#ff6a9e]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <FaBolt className="text-[9px]" /> Urgent
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white leading-snug mb-3 group-hover:text-[#a99aff] transition-colors line-clamp-2">
                  {proj.title}
                </h3>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {proj.skills.map((s) => <SkillBadge key={s} label={s} />)}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-sm font-semibold text-white">{proj.budget}</span>
                  <span className="text-xs text-[#68687d]">{proj.proposals} proposals</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED FREELANCERS ─────────────────────────────────────────────── */}
      <section className="py-24 bg-[#09090f]">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={freelancersRef} className="section-reveal flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <SectionLabel>Top Talent</SectionLabel>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Featured <span className="gradient-text">Freelancers</span>
              </h2>
            </div>
            <Link href="/freelancers" className="flex items-center gap-2 text-sm font-semibold text-[#7c6aff] hover:text-[#a99aff] transition-colors">
              Browse All Talent <FaArrowRight className="text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_FREELANCERS.map((fl, i) => (
              <div
                key={fl.name}
                id={`freelancer-card-${i}`}
                className="group glass-card rounded-2xl p-6 border border-white/5 hover:border-[#7c6aff]/25 hover:-translate-y-2 transition-all duration-300 text-center"
              >
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${fl.color} flex items-center justify-center text-xl font-bold text-white shadow-lg group-hover:shadow-[0_0_25px_rgba(124,106,255,0.35)] transition-all duration-300`}>
                    {fl.avatar}
                  </div>
                  {fl.verified && (
                    <MdVerified className="absolute -bottom-1 -right-1 text-[#4ecdc4] text-lg bg-[#09090f] rounded-full" />
                  )}
                </div>

                <h3 className="font-bold text-white text-base">{fl.name}</h3>
                <p className="text-xs text-[#9090aa] mb-2">{fl.role}</p>

                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <StarRating rating={Math.round(fl.rating)} />
                  <span className="text-xs text-[#fbbf24] font-semibold">{fl.rating}</span>
                  <span className="text-xs text-[#68687d]">({fl.reviews})</span>
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {fl.skills.map((s) => <SkillBadge key={s} label={s} />)}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs text-[#68687d]">{fl.location}</span>
                  <span className="text-sm font-bold text-[#7c6aff]">{fl.hourly}/hr</span>
                </div>

                <Link
                  href={`/freelancers/${fl.name.toLowerCase().replace(" ", "-")}`}
                  className="mt-4 w-full block py-2 text-xs font-semibold text-[#9090aa] border border-white/8 rounded-lg hover:text-white hover:border-[#7c6aff]/40 hover:bg-[#7c6aff]/8 transition-all"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATISTICS ──────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7c6aff]/8 via-transparent to-[#ff6a9e]/8 pointer-events-none" />
        <div className="absolute inset-0 border-y border-white/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div ref={statsRef} className="section-reveal grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="text-center group">
                <div className="text-4xl sm:text-5xl font-extrabold gradient-text mb-2">
                  <span ref={statRefs[i].ref}>{statRefs[i].display}</span>
                </div>
                <p className="text-[#9090aa] text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#09090f]">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={testimonialsRef} className="section-reveal text-center mb-16">
            <SectionLabel>Testimonials</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Loved by <span className="gradient-text">Thousands</span>
            </h2>
            <p className="max-w-xl mx-auto text-[#9090aa] text-lg">
              Don&apos;t take our word for it — hear directly from the people building their careers and businesses on SkillNest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.name}
                id={`testimonial-${i}`}
                className="group glass-card rounded-2xl p-6 border border-white/5 hover:border-[#7c6aff]/20 hover:-translate-y-1.5 transition-all duration-300"
              >
                <FaQuoteLeft className="text-[#7c6aff]/40 text-2xl mb-4" />
                <p className="text-sm text-[#c0c0d0] leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-[#68687d]">{t.role}</p>
                  </div>
                  <div className="ml-auto">
                    <StarRating rating={t.rating} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div ref={faqRef} className="section-reveal text-center mb-12">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Common <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-[#9090aa] text-lg">Everything you need to know before getting started.</p>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                id={`faq-${i}`}
                className={`glass-card rounded-2xl border transition-all duration-300 overflow-hidden ${
                  openFaq === i ? "border-[#7c6aff]/30" : "border-white/5 hover:border-white/10"
                }`}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className={`text-sm font-semibold transition-colors ${openFaq === i ? "text-[#a99aff]" : "text-white"}`}>
                    {faq.q}
                  </span>
                  <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${openFaq === i ? "bg-[#7c6aff]/20 text-[#7c6aff]" : "bg-white/5 text-[#9090aa]"}`}>
                    {openFaq === i ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                  </span>
                </button>
                <div className={`transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="px-5 pb-5 text-sm text-[#9090aa] leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#7c6aff]/10 via-transparent to-[#ff6a9e]/10" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-[#7c6aff]/20 to-transparent" />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#7c6aff]/5 blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div ref={ctaRef} className="section-reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-[#7c6aff]/10 border border-[#7c6aff]/25 text-[#a99aff] text-xs font-semibold tracking-wider uppercase">
              <FaRocket className="text-[#7c6aff]" />
              Start Today — It&apos;s Free
            </div>

            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
              Ready to <span className="gradient-text">Get Started?</span>
            </h2>
            <p className="text-xl text-[#9090aa] leading-relaxed mb-10 max-w-2xl mx-auto">
              Join 250,000+ professionals on SkillNest. Post your first project for free or create your freelancer profile in minutes.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/signup?role=client"
                id="cta-hire-talent"
                className="group flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-xl bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] shadow-[0_0_40px_rgba(124,106,255,0.4)] hover:shadow-[0_0_55px_rgba(124,106,255,0.6)] hover:-translate-y-1.5 active:translate-y-0 transition-all duration-200"
              >
                <FaUsers />
                Hire Talent
                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/auth/signup?role=freelancer"
                id="cta-find-work"
                className="group flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 hover:-translate-y-1.5 transition-all duration-200"
              >
                <FaRocket />
                Start Freelancing
                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-10 text-[#68687d] text-xs">
              {["Free to join", "No subscription fees", "Cancel anytime"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <FaCheckCircle className="text-[#4ecdc4]" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 bg-[#08080d]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="text-2xl drop-shadow-[0_0_10px_rgba(124,106,255,0.8)]">⚡</span>
                <span className="text-xl font-bold text-white">Skill<span className="text-[#7c6aff]">Nest</span></span>
              </Link>
              <p className="text-sm text-[#9090aa] leading-relaxed max-w-[300px] mb-6">
                The intelligent freelance marketplace connecting top talent with visionary clients worldwide.
              </p>
              <div className="flex gap-3">
                {["𝕏", "in", "gh", "yt"].map((social, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-lg glass-card border border-white/8 flex items-center justify-center text-xs font-bold text-[#9090aa] hover:text-white hover:border-[#7c6aff]/40 hover:bg-[#7c6aff]/10 transition-all"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { heading: "Platform", links: ["Find Freelancers", "Find Projects", "How It Works", "Pricing", "Enterprise"] },
              { heading: "Company", links: ["About Us", "Blog", "Careers", "Press", "Contact"] },
              { heading: "Support", links: ["Help Center", "Trust & Safety", "Privacy Policy", "Terms of Service", "Cookie Policy"] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-4">{col.heading}</h4>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-[#9090aa] hover:text-white transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/8">
            <p className="text-xs text-[#68687d]">© 2026 SkillNest, Inc. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-xs text-[#68687d]">
              <div className="w-2 h-2 rounded-full bg-[#4ecdc4] animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
