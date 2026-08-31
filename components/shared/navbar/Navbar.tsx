"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/constants/navlinks";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo" id="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">
            Skill<span className="logo-accent">Nest</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar-links" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              id={`nav-link-${link.label.toLowerCase()}`}
              className={`nav-link ${pathname === link.href ? "nav-link--active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons */}
        <div className="navbar-auth">
          <Link href="/login" id="btn-login" className="btn-login">
            Log In
          </Link>
          <Link href="/signup" id="btn-signup" className="btn-signup">
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          id="navbar-menu-toggle"
          className="navbar-hamburger"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className={`hamburger-line ${menuOpen ? "open-top" : ""}`} />
          <span className={`hamburger-line ${menuOpen ? "open-mid" : ""}`} />
          <span className={`hamburger-line ${menuOpen ? "open-bot" : ""}`} />
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`navbar-mobile-menu ${menuOpen ? "navbar-mobile-menu--open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              id={`mobile-nav-link-${link.label.toLowerCase()}`}
              className={`mobile-nav-link ${pathname === link.href ? "mobile-nav-link--active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-auth">
          <Link
            href="/login"
            id="mobile-btn-login"
            className="btn-login"
            onClick={() => setMenuOpen(false)}
          >
            Log In
          </Link>
          <Link
            href="/signup"
            id="mobile-btn-signup"
            className="btn-signup"
            onClick={() => setMenuOpen(false)}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
