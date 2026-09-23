"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { NAV_LINKS } from "@/constants/navlinks";

type NavbarUser = {
  role?: string;
  userType?: string;
};

const readStoredUser = (): NavbarUser | null => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<NavbarUser | null>(() => readStoredUser());

  const dashboardHref = useMemo(() => {
    const role = user?.role || user?.userType;
    return role === "Client" ? "/dashboard/client" : "/dashboard/freelancer";
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully.");
    router.push("/auth/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-8 px-6">
        <Link
          href="/"
          id="navbar-logo"
          className="flex items-center gap-2 flex-shrink-0 transition-opacity hover:opacity-85"
        >
          <span className="text-2xl drop-shadow-[0_0_10px_rgba(124,106,255,0.8)]">⚡</span>
          <span className="text-xl font-bold tracking-tight text-white">
            Skill<span className="text-[#7c6aff]">Nest</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center justify-center gap-0.5 flex-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href === "/" && pathname === "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                id={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
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

        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {user ? (
            <>
              <Link
                href={dashboardHref}
                id="btn-dashboard"
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
                id="btn-login"
                className="px-4 py-2 text-sm font-medium text-[#9090aa] rounded-lg transition-colors hover:text-white hover:bg-white/5"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                id="btn-signup"
                className="px-5 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] shadow-[0_0_20px_rgba(124,106,255,0.35)] transition-all duration-200 hover:shadow-[0_0_28px_rgba(124,106,255,0.55)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          id="navbar-menu-toggle"
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
                id={`mobile-nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-white bg-[#7c6aff]/10"
                    : "text-[#9090aa] hover:text-white hover:bg-white/5"
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
                id="mobile-btn-dashboard"
                className="flex-1 py-2.5 text-center text-sm font-semibold text-white rounded-lg bg-gradient-to-br from-[#7c6aff] to-[#ff6a9e] shadow-[0_0_15px_rgba(124,106,255,0.3)] transition-opacity hover:opacity-90"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex-1 py-2.5 text-center text-sm font-medium text-[#9090aa] rounded-lg border border-white/10 hover:text-white hover:bg-white/5 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                id="mobile-btn-login"
                className="flex-1 py-2.5 text-center text-sm font-medium text-[#9090aa] rounded-lg border border-white/10 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                id="mobile-btn-signup"
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
