"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  FaBrain, FaBolt, FaShieldAlt, FaStar, FaCheckCircle,
  FaUsers, FaGlobe, FaRocket, FaHeart, FaArrowRight,
  FaLinkedin, FaTwitter, FaGithub, FaLightbulb,
  FaHandshake, FaLock, FaChartLine,
} from "react-icons/fa";
import { MdVerified, MdAutoAwesome } from "react-icons/md";

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Static data ─────────────────────────────────────────────────────────────
const STATS = [
  { value: "50K+", label: "Freelancers" },
  { value: "12K+", label: "Clients" },
  { value: "98K+", label: "Projects Completed" },
  { value: "180+", label: "Countries" },
];

const VALUES = [
  {
    icon: <FaHeart />,
    color: "from-[#ff6a9e] to-[#d44d80]",
    title: "People First",
    desc: "We build for humans, not metrics. Every feature starts with 'how does this help someone do better work or find better talent?'",
  },
  {
    icon: <FaShieldAlt />,
    color: "from-[#7c6aff] to-[#5b4fcf]",
    title: "Trust & Safety",
    desc: "Escrow payments, identity verification, and AI fraud detection mean both sides can collaborate with confidence.",
  },
  {
    icon: <FaLightbulb />,
    color: "from-[#f59e0b] to-[#d97706]",
    title: "Constant Innovation",
    desc: "We ship new AI capabilities, quality-of-life improvements, and integrations every sprint.",
  },
  {
    icon: <FaHandshake />,
    color: "from-[#4ecdc4] to-[#35a8a0]",
    title: "Fair for Everyone",
    desc: "Transparent fees, clear contracts, and dispute resolution so no one ever feels powerless.",
  },
  {
    icon: <FaGlobe />,
    color: "from-[#a78bfa] to-[#7c3aed]",
    title: "Borderless Work",
    desc: "Language, time zones, and geography should never be barriers. We support 60+ languages and 180 countries.",
  },
  {
    icon: <FaChartLine />,
    color: "from-[#34d399] to-[#059669]",
    title: "Growth Focused",
    desc: "We invest in education, mentorship tools, and community features that help freelancers level up their careers.",
  },
];

const AI_CAPABILITIES = [
  { icon: <FaBrain />, title: "Smart Matching", desc: "50+ compatibility signals match clients with freelancers in seconds — not hours." },
  { icon: <MdAutoAwesome />, title: "Proposal Assistant", desc: "AI drafts personalised proposals that freelancers review and own before submitting." },
  { icon: <FaBolt />, title: "Project Generator", desc: "Clients describe their idea in plain language; AI turns it into a structured brief." },
  { icon: <FaShieldAlt />, title: "Fraud Detection", desc: "Behavioural AI monitors every session to protect both sides 24/7." },
  { icon: <FaLock />, title: "Auto Contracts", desc: "One click produces a professionally structured contract tailored to the project scope." },
  { icon: <FaGlobe />, title: "Real-time Translation", desc: "Built-in AI translation removes language barriers across 60+ languages." },
];

const TEAM = [
  { name: "Arjun Mehta", role: "Co-Founder & CEO", avatar: "A", color: "from-[#7c6aff] to-[#5b4fcf]", bio: "Ex-Toptal engineer turned founder. Passionate about making global remote work accessible.", linkedin: "#", twitter: "#" },
  { name: "Sofia Reyes", role: "Co-Founder & CTO", avatar: "S", color: "from-[#ff6a9e] to-[#d44d80]", bio: "ML researcher and full-stack architect. Built SkillNest's AI core from scratch.", linkedin: "#", github: "#" },
  { name: "Liam Okafor", role: "Head of Product", avatar: "L", color: "from-[#4ecdc4] to-[#35a8a0]", bio: "10 years in marketplace products. Obsessed with reducing friction for both sides.", twitter: "#" },
  { name: "Yuna Park", role: "Head of Design", avatar: "Y", color: "from-[#f59e0b] to-[#d97706]", bio: "Former Figma designer. Leads the visual language and accessibility standards for the platform.", linkedin: "#", twitter: "#" },
  { name: "Marcus Webb", role: "Head of Trust & Safety", avatar: "M", color: "from-[#34d399] to-[#059669]", bio: "Ex-PayPal fraud team. Makes sure every transaction and interaction on SkillNest is safe.", linkedin: "#" },
  { name: "Priya Nair", role: "Head of Community", avatar: "P", color: "from-[#a78bfa] to-[#7c3aed]", bio: "Grew online communities to 500K+ members. Champions freelancer education and mentorship.", twitter: "#", linkedin: "#" },
];

const MILESTONES = [
  { year: "2022", event: "SkillNest founded in a co-working space in Dhaka with a team of 4." },
  { year: "2023 Q1", event: "Launched closed beta — 500 freelancers and 80 clients in the first month." },
  { year: "2023 Q3", event: "Raised seed funding. Expanded team to 18 people across 5 countries." },
  { year: "2024 Q1", event: "Shipped AI matching engine and passed 10,000 registered users." },
  { year: "2024 Q3", event: "Crossed $2M in total processed payments. Launched mobile-responsive redesign." },
  { year: "2025", event: "Released AI proposal assistant, auto-contract drafting, and fraud detection." },
  { year: "2026", event: "Serving 50K+ freelancers across 180 countries. Still growing." },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal();
  return <div ref={ref} className={`section-reveal ${className}`}>{children}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <main className="bg-[#08080d] text-white overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center text-center px-4 py-24 overflow-hidden">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-[#7c6aff]/12 blur-[100px] animate-float-orb" />
          <div className="absolute bottom-16 right-1/4 w-64 h-64 rounded-full bg-[#ff6a9e]/10 blur-[90px] animate-float-orb delay-700" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto animate-slide-up">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#7c6aff] bg-[#7c6aff]/10 border border-[#7c6aff]/20 px-4 py-1.5 rounded-full mb-6">
            <FaRocket className="text-[10px]" /> Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            We&apos;re building the{" "}
            <span className="gradient-text">future of work</span>
          </h1>
          <p className="text-base sm:text-lg text-[#9090aa] leading-relaxed max-w-2xl mx-auto mb-8">
            SkillNest is an AI-powered freelance marketplace that connects talented
            professionals with forward-thinking clients — making great work possible
            across borders, time zones, and industries.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/freelancers"
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_24px_rgba(124,106,255,0.4)] hover:-translate-y-0.5 transition-all"
            >
              Browse Freelancers <FaArrowRight className="text-xs" />
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-xl border border-white/15 hover:bg-white/5 hover:-translate-y-0.5 transition-all"
            >
              Find Projects
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <Reveal>
        <section className="py-16 border-y border-white/8">
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-extrabold gradient-text mb-1">{s.value}</p>
                <p className="text-sm text-[#9090aa]">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── Mission ── */}
      <Reveal>
        <section className="max-w-5xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold text-[#7c6aff] uppercase tracking-widest mb-3 block">Our Mission</span>
              <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
                Talent should never be limited by{" "}
                <span className="gradient-text">geography</span>
              </h2>
              <p className="text-[#9090aa] leading-relaxed mb-4">
                Millions of skilled professionals around the world never get a fair shot
                because opportunity isn't evenly distributed. We built SkillNest to
                change that — giving every talented person access to global clients, and
                every business access to world-class talent.
              </p>
              <p className="text-[#9090aa] leading-relaxed mb-6">
                We combine the power of AI with a human-centered design philosophy to
                remove friction, prevent fraud, and make remote collaboration feel as
                natural as working in the same room.
              </p>
              <div className="flex flex-col gap-2.5">
                {["Secure milestone-based payments", "AI-powered talent matching", "Built-in messaging and project management", "Verified identities and skill endorsements"].map((p) => (
                  <div key={p} className="flex items-center gap-2.5 text-sm text-[#c0c0d0]">
                    <FaCheckCircle className="text-[#7c6aff] shrink-0 text-xs" /> {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Visual card grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🌍", label: "Global Reach", sub: "180+ countries" },
                { icon: "🤖", label: "AI-Powered", sub: "Smart matching" },
                { icon: "🔒", label: "Secure Payments", sub: "Escrow protected" },
                { icon: "⭐", label: "Quality Talent", sub: "Verified profiles" },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-2xl p-5 text-center hover:border-[#7c6aff]/30 hover:-translate-y-0.5 transition-all">
                  <span className="text-3xl mb-2 block">{item.icon}</span>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-[#68687d] mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── Values ── */}
      <Reveal>
        <section className="py-20 bg-[#09090f] border-y border-white/8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold text-[#7c6aff] uppercase tracking-widest mb-3 block">What We Stand For</span>
              <h2 className="text-3xl sm:text-4xl font-bold">Our core values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VALUES.map((v) => (
                <div key={v.title} className="glass-card rounded-2xl p-6 hover:border-white/15 hover:-translate-y-0.5 transition-all group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center text-white text-sm mb-4 shadow-[0_0_15px_rgba(124,106,255,0.2)] group-hover:shadow-[0_0_20px_rgba(124,106,255,0.3)] transition-all`}>
                    {v.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-xs text-[#9090aa] leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── AI Capabilities ── */}
      <Reveal>
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#7c6aff] bg-[#7c6aff]/10 border border-[#7c6aff]/20 px-4 py-1.5 rounded-full mb-4">
              <MdAutoAwesome /> AI at our core
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Intelligence built into<br />every step of the process
            </h2>
            <p className="text-[#9090aa] max-w-xl mx-auto text-sm leading-relaxed">
              From finding the right match to releasing payment, AI works silently in the background to make every interaction smarter.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_CAPABILITIES.map((a) => (
              <div key={a.title} className="bg-[#13131a] border border-white/8 rounded-2xl p-5 hover:border-[#7c6aff]/30 hover:-translate-y-0.5 transition-all">
                <div className="w-9 h-9 rounded-xl bg-[#7c6aff]/10 border border-[#7c6aff]/20 flex items-center justify-center text-[#7c6aff] text-sm mb-3">
                  {a.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{a.title}</h3>
                <p className="text-xs text-[#9090aa] leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── Timeline ── */}
      <Reveal>
        <section className="py-20 bg-[#09090f] border-y border-white/8">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold text-[#7c6aff] uppercase tracking-widest mb-3 block">Our Journey</span>
              <h2 className="text-3xl sm:text-4xl font-bold">How we got here</h2>
            </div>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#7c6aff]/60 via-[#ff6a9e]/40 to-transparent rounded-full" />
              <div className="flex flex-col gap-8 pl-12">
                {MILESTONES.map((m, i) => (
                  <div key={i} className="relative">
                    {/* Dot */}
                    <div className="absolute -left-[38px] top-1 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] shadow-[0_0_8px_rgba(124,106,255,0.5)]" />
                    <span className="text-xs font-bold text-[#7c6aff] mb-1 block">{m.year}</span>
                    <p className="text-sm text-[#c0c0d0] leading-relaxed">{m.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── Team ── */}
      <Reveal>
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-[#7c6aff] uppercase tracking-widest mb-3 block">The People</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Meet the team</h2>
            <p className="text-[#9090aa] max-w-lg mx-auto text-sm">
              A small, distributed team obsessed with making the future of work better for everyone.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TEAM.map((member) => (
              <div key={member.name} className="glass-card rounded-2xl p-6 hover:border-white/15 hover:-translate-y-0.5 transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-lg font-bold text-white shrink-0 shadow-[0_0_15px_rgba(124,106,255,0.2)] group-hover:shadow-[0_0_20px_rgba(124,106,255,0.3)] transition-all`}>
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white">{member.name}</h3>
                      <MdVerified className="text-[#4ecdc4] text-sm shrink-0" />
                    </div>
                    <p className="text-xs text-[#7c6aff]">{member.role}</p>
                  </div>
                </div>
                <p className="text-xs text-[#9090aa] leading-relaxed mb-4">{member.bio}</p>
                <div className="flex gap-2">
                  {member.linkedin && (
                    <a href={member.linkedin} aria-label={`${member.name} LinkedIn`} className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-[#9090aa] hover:text-[#7c6aff] hover:border-[#7c6aff]/30 transition-all">
                      <FaLinkedin className="text-xs" />
                    </a>
                  )}
                  {member.twitter && (
                    <a href={member.twitter} aria-label={`${member.name} Twitter`} className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-[#9090aa] hover:text-[#7c6aff] hover:border-[#7c6aff]/30 transition-all">
                      <FaTwitter className="text-xs" />
                    </a>
                  )}
                  {member.github && (
                    <a href={member.github} aria-label={`${member.name} GitHub`} className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-[#9090aa] hover:text-[#7c6aff] hover:border-[#7c6aff]/30 transition-all">
                      <FaGithub className="text-xs" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── Join us CTA ── */}
      <Reveal>
        <section className="px-4 py-20">
          <div className="max-w-4xl mx-auto text-center relative">
            {/* Glow blob */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-48 rounded-full bg-[#7c6aff]/15 blur-[80px]" />
            </div>
            <div className="relative z-10 glass-card rounded-3xl px-8 py-14 border border-white/8">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#7c6aff] bg-[#7c6aff]/10 border border-[#7c6aff]/20 px-4 py-1.5 rounded-full mb-6">
                <FaRocket className="text-[10px]" /> Join the community
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Ready to find great{" "}
                <span className="gradient-text">work or talent?</span>
              </h2>
              <p className="text-[#9090aa] text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
                Whether you&apos;re a freelancer looking for your next project or a business searching for the
                perfect professional — SkillNest is built for you.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] hover:shadow-[0_0_30px_rgba(124,106,255,0.45)] hover:-translate-y-0.5 transition-all"
                >
                  Get Started Free <FaArrowRight className="text-xs" />
                </Link>
                <Link
                  href="/freelancers"
                  className="flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-xl border border-white/15 hover:bg-white/5 hover:-translate-y-0.5 transition-all"
                >
                  <FaUsers className="text-xs" /> Browse Freelancers
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

    </main>
  );
}
