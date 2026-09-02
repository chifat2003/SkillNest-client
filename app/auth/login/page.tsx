"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // console.log({
        //     email,
        //     password,
        //     rememberMe,
        // });

        // Backend login API will be connected here later.
    };

    return (
        <main className="auth-page">
            <div className="auth-wrapper">
                {/* ───────────── Left: Login Form ───────────── */}
                <section className="login-section">
                    <div className="login-content">
                        {/* Logo */}
                        <Link href="/" className="auth-logo">
                            <span className="auth-logo-icon">⚡</span>
                            <span>
                                Skill<span>Nest</span>
                            </span>
                        </Link>

                        {/* Heading */}
                        <div className="login-heading">
                            <h1>Welcome back 👋</h1>
                            <p>Log in to continue your journey with SkillNest.</p>
                        </div>

                        {/* Login Form */}
                        <form className="login-form" onSubmit={handleSubmit}>
                            {/* Email */}
                            <div className="form-field">
                                <label htmlFor="email">Email address</label>

                                <div className="input-wrapper">
                                    <span className="input-icon">✉</span>

                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="form-field">
                                <div className="password-label-row">
                                    <label htmlFor="password">Password</label>

                                    <Link href="/auth/forgot-password">
                                        Forgot password?
                                    </Link>
                                </div>

                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>

                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={
                                            showPassword ? "Hide password" : "Show password"
                                        }
                                    >
                                        {showPassword ? "◉" : "◌"}
                                    </button>
                                </div>
                            </div>

                            {/* Remember Me */}
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />

                                <span className="custom-checkbox">
                                    {rememberMe && "✓"}
                                </span>

                                <span>Remember me</span>
                            </label>

                            {/* Submit */}
                            <button type="submit" className="login-button">
                                Log In
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="auth-divider">
                            <span />
                            <p>or continue with</p>
                            <span />
                        </div>

                        {/* Social Login */}
                        <div className="social-login">
                            <button
                                type="button"
                                className="social-button"
                                onClick={() => {
                                    window.location.href =
                                        "http://localhost:5000/api/auth/google";
                                }}
                            >
                                <FaGoogle className="social-icon google-icon" />
                                <span>Continue with Google</span>
                            </button>

                            <button
                                type="button"
                                className="social-button"
                                onClick={() => {
                                    window.location.href =
                                        "http://localhost:5000/api/auth/github";
                                }}
                            >
                                <FaGithub className="social-icon github-icon" />
                                <span>Continue with GitHub</span>
                            </button>
                        </div>
                        {/* Sign Up */}
                        <p className="signup-text">
                            Do not have an account?{" "}
                            <Link href="/auth/signup">Sign up</Link>
                        </p>
                    </div>
                </section>

                {/* ───────────── Right: Illustration ───────────── */}
                <section className="login-visual">
                    <div className="visual-overlay" />

                    <Image
                        src="/images/login-illustration.png"
                        alt="SkillNest learning journey"
                        className="login-illustration"
                        width={800}
                        height={800}
                    />

                    <div className="visual-content">
                        <span className="visual-label">YOUR LEARNING JOURNEY</span>

                        <h2>
                            Learn.
                            <br />
                            Build.
                            <br />
                            <span>Grow.</span>
                        </h2>

                        <p>
                            Connect with learners and professionals,
                            develop new skills, and build your future
                            with SkillNest.
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
}