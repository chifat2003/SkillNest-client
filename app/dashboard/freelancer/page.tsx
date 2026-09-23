"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Stats {
  totalProposals: number;
  activeProposals: number;
  pendingInvitations: number;
  activeContracts: number;
  availableBalance: number;
}

function FreelancerDashboardContent() {
  const [user, setUser] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalProposals: 0,
    activeProposals: 0,
    pendingInvitations: 0,
    activeContracts: 0,
    availableBalance: 0,
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

        const [proposalsRes, invitationsRes, contractsRes] = await Promise.all([
          fetch(`${API}/api/proposals?limit=100`, { headers }),
          fetch(`${API}/api/invitations?limit=100`, { headers }),
          fetch(`${API}/api/contracts?limit=100`, { headers }),
        ]);

        const [proposalsData, invitationsData, contractsData] = await Promise.all([
          proposalsRes.json(), invitationsRes.json(), contractsRes.json(),
        ]);

        const proposals: { status: string }[] = proposalsData.success ? proposalsData.data : [];
        const invitations: { status: string }[] = invitationsData.success ? invitationsData.data : [];
        const contracts: { status: string; milestones?: { status: string; amount: number; funded: boolean }[] }[] =
          contractsData.success ? contractsData.data : [];

        // Sum approved/released milestone amounts as available balance proxy
        const available = contracts.reduce((sum, c) => {
          const releasedMilestones = c.milestones?.filter((m) => m.status === "Completed") ?? [];
          return sum + releasedMilestones.reduce((s, m) => s + (m.amount * 0.9), 0); // after 10% fee
        }, 0);

        setStats({
          totalProposals: proposalsData.success ? (proposalsData.pagination?.total ?? proposals.length) : 0,
          activeProposals: proposals.filter((p) =>
            ["Submitted", "Viewed", "Shortlisted", "Interview"].includes(p.status)
          ).length,
          pendingInvitations: invitations.filter((i) => i.status === "Pending").length,
          activeContracts: contracts.filter((c) => c.status === "Active").length,
          availableBalance: available,
        });
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    });
  }, []);

  const statCards = [
    {
      label: "Active Proposals",
      value: loading ? "—" : stats.activeProposals,
      href: "/dashboard/freelancer/proposals",
      color: "from-[#7c6aff] to-[#9b8dff]",
      icon: "📋",
    },
    {
      label: "Active Contracts",
      value: loading ? "—" : stats.activeContracts,
      href: "/dashboard/freelancer/contracts",
      color: "from-[#4ecdc4] to-[#26a69a]",
      icon: "📑",
    },
    {
      label: "Pending Invitations",
      value: loading ? "—" : stats.pendingInvitations,
      href: "/dashboard/freelancer/invitations",
      color: "from-[#ff6a9e] to-[#ff8fbd]",
      icon: "✉️",
    },
    {
      label: "Available Balance",
      value: loading ? "—" : `$${stats.availableBalance.toFixed(2)}`,
      href: "/dashboard/freelancer/contracts",
      color: "from-[#f59e0b] to-[#fbbf24]",
      icon: "💰",
    },
  ];

  const quickLinks = [
    { label: "Find Projects", href: "/projects", icon: "🔍", desc: "Browse and apply to new projects" },
    { label: "My Proposals", href: "/dashboard/freelancer/proposals", icon: "📋", desc: "Track your submitted proposals" },
    { label: "My Contracts", href: "/dashboard/freelancer/contracts", icon: "📑", desc: "Manage active work and milestones" },
    { label: "Messages", href: "/dashboard/freelancer/messages", icon: "💬", desc: "Chat with clients" },
    { label: "Invitations", href: "/dashboard/freelancer/invitations", icon: "✉️", desc: "View project invitations" },
    { label: "Edit My Profile", href: "/dashboard/freelancer/profile/edit", icon: "✏️", desc: "Update your skills, portfolio & overview" },
    { label: "View Public Profile", href: user?.id ? `/freelancers/${user.id}` : "/freelancers", icon: "👤", desc: "See how clients see your profile" },
  ];

  return (
    <main className="min-h-screen bg-[#08080d] px-4 py-10 text-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-[#9090aa] text-sm mt-1">Here&apos;s what&apos;s happening with your freelance work.</p>
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

        {/* Invitations notice */}
        {stats.pendingInvitations > 0 && (
          <div className="mb-6 flex items-center gap-3 bg-[#7c6aff]/8 border border-[#7c6aff]/20 rounded-xl px-4 py-3">
            <span className="text-sm">🎯</span>
            <p className="text-sm text-[#c0c0d0] flex-1">
              You have <span className="text-white font-semibold">{stats.pendingInvitations}</span> pending invitation{stats.pendingInvitations > 1 ? "s" : ""} from clients.
            </p>
            <Link
              href="/dashboard/freelancer/invitations"
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

export default function FreelancerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["Freelancer"]}>
      <FreelancerDashboardContent />
    </ProtectedRoute>
  );
}
