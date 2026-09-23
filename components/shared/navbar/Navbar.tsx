"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaBell, FaCheckDouble } from "react-icons/fa";
import { NAV_LINKS } from "@/constants/navlinks";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  entityType?: string;
  entityId?: string;
}

const TYPE_ICON: Record<string, string> = {
  proposal: "📋",
  invitation: "✉️",
  message: "💬",
  contract: "📑",
  milestone: "🏁",
  payment: "💰",
  review: "⭐",
  dispute: "⚠️",
  default: "🔔",
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ role: string; fullName: string } | null>(null);

  // Notifications state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hydrate user from localStorage once on mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch unread count (poll every 30s while logged in)
  const fetchUnreadCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/notifications?limit=1&unreadOnly=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUnreadCount(data.unreadCount ?? 0);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!user) return;
    void fetchUnreadCount();
    pollRef.current = setInterval(() => void fetchUnreadCount(), 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user]);

  // Fetch full notifications list when bell is clicked
  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setNotifLoading(true);
    try {
      const res = await fetch(`${API}/api/notifications?limit=15`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch { /* ignore */ } finally {
      setNotifLoading(false);
    }
  };

  const handleBellClick = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next) void fetchNotifications();
  };

  const markAllRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`${API}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const markOneRead = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await fetch(`${API}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
  };

  const dashboardHref =
    user?.role === "Client" ? "/dashboard/client" : "/dashboard/freelancer";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setUnreadCount(0);
    setNotifications([]);
    setNotifOpen(false);
    toast.success("Logged out.");
    router.push("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-white/10 bg-[#0a0a0f]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "border-transparent bg-[#0a0a0f]/80 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-8 px-6">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0 transition-opacity hover:opacity-85"
        >
          <span className="text-2xl drop-shadow-[0_0_10px_rgba(124,106,255,0.8)]">⚡</span>
          <span className="text-xl font-bold tracking-tight text-white">
            Skill<span className="text-[#7c6aff]">Nest</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center justify-center gap-0.5 flex-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-white bg-[#7c6aff]/10"
                    : "text-[#9090aa] hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-[1px] left-1/2 h-[2px] w-[60%] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] transition-transform duration-300 ease-out ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop right: notifications + auth */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          {user && (
            /* ── Notification Bell ── */
            <div ref={notifRef} className="relative">
              <button
                onClick={handleBellClick}
                aria-label="Notifications"
                className={`relative p-2.5 rounded-xl transition-all ${
                  notifOpen
                    ? "bg-[#7c6aff]/15 text-white"
                    : "text-[#9090aa] hover:text-white hover:bg-white/5"
                }`}
              >
                <FaBell className="text-base" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center text-[9px] font-bold text-white bg-[#ff6a9e] rounded-full leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-80 bg-[#0d0d14] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex items-center gap-1.5 text-xs text-[#7c6aff] hover:text-white transition-colors"
                      >
                        <FaCheckDouble className="text-[10px]" /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-[360px] overflow-y-auto">
                    {notifLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#7c6aff]" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-10 px-4">
                        <FaBell className="text-2xl text-white/15 mx-auto mb-2" />
                        <p className="text-xs text-[#68687d]">No notifications yet.</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n._id}
                          onClick={() => { markOneRead(n._id); setNotifOpen(false); }}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-white/5 transition-all hover:bg-white/4 ${
                            !n.read ? "bg-[#7c6aff]/5" : ""
                          }`}
                        >
                          <span className="text-base mt-0.5 shrink-0">
                            {TYPE_ICON[n.type] ?? TYPE_ICON.default}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold leading-snug mb-0.5 ${!n.read ? "text-white" : "text-[#c0c0d0]"}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-[#9090aa] leading-snug line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-[#68687d] mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-[#7c6aff] shrink-0 mt-1.5" />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <Link
                    href={dashboardHref}
                    onClick={() => setNotifOpen(false)}
                    className="block px-4 py-3 text-center text-xs font-medium text-[#9090aa] hover:text-white border-t border-white/8 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              )}
            </div>
          )}

          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] shadow-[0_0_20px_rgba(124,106,255,0.35)] transition-all duration-200 hover:shadow-[0_0_28px_rgba(124,106,255,0.55)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-[#9090aa] rounded-lg transition-colors hover:text-white hover:bg-white/5"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-[#9090aa] rounded-lg transition-colors hover:text-white hover:bg-white/5"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] shadow-[0_0_20px_rgba(124,106,255,0.35)] transition-all duration-200 hover:shadow-[0_0_28px_rgba(124,106,255,0.55)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden flex flex-col justify-center items-center gap-1.5 p-2 rounded-md hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className={`block h-[2px] w-5 rounded-full bg-white transition-transform duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`block h-[2px] w-5 rounded-full bg-white transition-opacity duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`} />
          <span className={`block h-[2px] w-5 rounded-full bg-white transition-transform duration-300 ${menuOpen ? "-translate-y-[9px] -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden bg-[#0d0d14]/95 border-t border-white/10 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-[600px] opacity-100 px-6 py-4" : "max-h-0 opacity-0 px-6 py-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="flex flex-col gap-1 mb-4" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  isActive ? "text-white bg-[#7c6aff]/10" : "text-[#9090aa] hover:text-white hover:bg-white/5"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex gap-3 pt-4 mt-3 border-t border-white/10">
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="flex-1 py-2.5 text-center text-sm font-semibold text-white rounded-lg bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] shadow-[0_0_15px_rgba(124,106,255,0.3)] transition-opacity hover:opacity-90"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="flex-1 py-2.5 text-center text-sm font-medium text-[#9090aa] rounded-lg border border-white/10 hover:text-white hover:bg-white/5 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="flex-1 py-2.5 text-center text-sm font-medium text-[#9090aa] rounded-lg border border-white/10 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="flex-1 py-2.5 text-center text-sm font-semibold text-white rounded-lg bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] shadow-[0_0_15px_rgba(124,106,255,0.3)] transition-opacity hover:opacity-90"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
