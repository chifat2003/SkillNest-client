"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Stats {
  totalProposals: number;
  pendingProposals: number;
  sentInvitations: number;
}

function ClientDashboardContent() {
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [stats, setStats] = useState<Stats>({ totalProposals: 0, pendingProposals: 0, sentInvitations: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const [proposalsRes, invitationsRes] = await Promise.all([
          fetch(`${API}/api/proposals`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/invitations`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [proposalsData, invitationsData] = await Promise.all([proposalsRes.json(), invitationsRes.json()]);

        if (proposalsData.success) {
          const proposals = proposalsData.data;
          setStats((prev) => ({
            ...prev,
            totalProposals: proposalsData.pagination?.total ?? proposals.length,
            pendingProposals: proposals.filter((p: { status: string }) =>
              ["Submitted", "Viewed"].includes(p.status)
            ).length,
          }));
        }
        if (invitationsData.success) {
          setStats((prev) => ({
            ...prev,
            sentInvitations: invitationsData.pagination?.total ?? invitationsData.data.length,
          }));
        }
      } catch { /* ignore */ }
    };

    fetchStats();
  }, []);

  const cards = [
    { label: "Total Proposals", value: stats.totalProposals, href: "/dashboard/client/proposals", color: "from-[#7c6aff] to-[#9b8dff]" },
    { label: "Pending Review", value: stats.pendingProposals, href: "/dashboard/client/proposals?status=Submitted", color: "from-[#ff6a9e] to-[#ff8fbd]" },
    { label: "Invitations Sent", value: stats.sentInvitations, href: "/dashboard/client/invitations", color: "from-[#06b6d4] to-[#22d3ee]" },
  ];

  const quickLinks = [
    { label: "Review Proposals", href: "/dashboard/client/proposals", icon: "📋" },
    { label: "Manage Invitations", href: "/dashboard/client/invitations", icon: "✉️" },
  ];

  return (
    <main className="min-h-screen bg-[#08080d] px-4 py-10 text-white">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold">
            Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-[#9090aa] text-sm mt-1">Manage your projects and hire the right talent.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {cards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-[#13131a] border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:-translate-y-0.5 transition-all"
            >
              <p className="text-[#9090aa] text-xs mb-2">{card.label}</p>
              <p className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                {card.value}
              </p>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <h2 className="text-sm font-semibold text-[#9090aa] uppercase tracking-wider mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 bg-[#13131a] border border-white/10 rounded-2xl p-5 hover:border-[#7c6aff]/40 hover:bg-[#7c6aff]/5 transition-all group"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="font-medium text-sm group-hover:text-white text-[#9090aa] transition-colors">{link.label}</span>
              <span className="ml-auto text-[#9090aa] group-hover:text-white transition-colors">→</span>
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
