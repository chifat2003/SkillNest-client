"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Stats {
  totalProjects: number;
  draftProjects: number;
  activeContracts: number;
  pendingProposals: number;
  sentInvitations: number;
  totalSpending: number;
}

function ClientDashboardContent() {
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    draftProjects: 0,
    activeContracts: 0,
    pendingProposals: 0,
    sentInvitations: 0,
    totalSpending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      const stored = localStorage.getItem("user");
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
      }

      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [projectsRes, proposalsRes, invitationsRes, contractsRes] = await Promise.all([
          fetch(`${API}/api/projects?myProjects=true&limit=100`, { headers }),
          fetch(`${API}/api/proposals?limit=100`, { headers }),
          fetch(`${API}/api/invitations?limit=100`, { headers }),
          fetch(`${API}/api/contracts?limit=100`, { headers }),
        ]);

        const [projectsData, proposalsData, invitationsData, contractsData] = await Promise.all([
          projectsRes.json(), proposalsRes.json(), invitationsRes.json(), contractsRes.json(),
        ]);
        const [proposalsData, invitationsData] = await Promise.all([proposalsRes.json(), invitationsRes.json()]);

        setStats({
          totalProposals: proposalsData.success
            ? proposalsData.pagination?.total ?? proposalsData.data.length
            : 0,
          pendingProposals: proposalsData.success
            ? proposalsData.data.filter((p: { status: string }) => ["Submitted", "Viewed"].includes(p.status)).length
            : 0,
          sentInvitations: invitationsData.success
            ? invitationsData.pagination?.total ?? invitationsData.data.length
            : 0,
        });
      } catch { /* ignore */ }
    });
  }, []);

  const statCards = [
    {
      label: "Total Projects",
      value: loading ? "—" : stats.totalProjects,
      href: "/dashboard/client/projects",
      color: "from-[#7c6aff] to-[#9b8dff]",
      icon: "📁",
    },
    {
      label: "Active Contracts",
      value: loading ? "—" : stats.activeContracts,
      href: "/dashboard/client/contracts",
      color: "from-[#4ecdc4] to-[#26a69a]",
      icon: "📑",
    },
    {
      label: "Pending Proposals",
      value: loading ? "—" : stats.pendingProposals,
      href: "/dashboard/client/proposals",
      color: "from-[#ff6a9e] to-[#ff8fbd]",
      icon: "📬",
    },
    {
      label: "Total Spending",
      value: loading ? "—" : `$${stats.totalSpending.toLocaleString()}`,
      href: "/dashboard/client/contracts",
      color: "from-[#f59e0b] to-[#fbbf24]",
      icon: "💰",
    },
  ];

  const quickLinks = [
    { label: "Post a Project", href: "/dashboard/client/projects/new", icon: "➕", desc: "Create and publish a new project" },
    { label: "My Projects", href: "/dashboard/client/projects", icon: "📁", desc: "Manage your posted projects" },
    { label: "Review Proposals", href: "/dashboard/client/proposals", icon: "📋", desc: "Shortlist and hire freelancers" },
    { label: "Active Contracts", href: "/dashboard/client/contracts", icon: "📑", desc: "Manage milestones and payments" },
    { label: "Messages", href: "/dashboard/client/messages", icon: "💬", desc: "Chat with freelancers" },
    { label: "Invitations", href: "/dashboard/client/invitations", icon: "✉️", desc: "Track sent invitations" },
    { label: "Find Freelancers", href: "/freelancers", icon: "🔍", desc: "Browse talented professionals" },
  ];

  return (
    <main className="min-h-screen bg-[#08080d] px-4 py-10 text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-[#9090aa] text-sm mt-1">Manage your projects and hire the right talent.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-[#13131a] border border-white/8 rounded-2xl p-4 hover:border-white/20 hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg">{card.icon}</span>
                <span className="text-[10px] text-[#68687d] group-hover:text-[#9090aa] transition-colors">→</span>
              </div>
              <p className={`text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent mb-1`}>
                {card.value}
              </p>
              <p className="text-[#9090aa] text-xs">{card.label}</p>
            </Link>
          ))}
        </div>

        {/* Draft projects notice */}
        {stats.draftProjects > 0 && (
          <div className="mb-6 flex items-center gap-3 bg-[#7c6aff]/8 border border-[#7c6aff]/20 rounded-xl px-4 py-3">
            <span className="text-sm">📝</span>
            <p className="text-sm text-[#c0c0d0] flex-1">
              You have <span className="text-white font-semibold">{stats.draftProjects}</span> draft project{stats.draftProjects > 1 ? "s" : ""} waiting to be published.
            </p>
            <Link
              href="/dashboard/client/projects"
              className="text-xs font-semibold text-[#7c6aff] hover:text-white transition-colors shrink-0"
            >
              View →
            </Link>
          </div>
        )}

        {/* Quick Access */}
        <h2 className="text-xs font-semibold text-[#9090aa] uppercase tracking-wider mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-3 bg-[#13131a] border border-white/8 rounded-2xl p-4 hover:border-[#7c6aff]/35 hover:bg-[#7c6aff]/5 transition-all group"
            >
              <span className="text-xl mt-0.5 shrink-0">{link.icon}</span>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-[#c8bfff] transition-colors">{link.label}</p>
                <p className="text-xs text-[#68687d] mt-0.5">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function ClientDashboard() {
  return (
    <ProtectedRoute allowedRoles={["Client"]}>
      <ClientDashboardContent />
    </ProtectedRoute>
  );
}
