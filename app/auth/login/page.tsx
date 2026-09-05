"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials. Please try again.");
      }

      // Store Auth Token and User Details
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success("Logged in successfully!");

      // Role-based redirection logic
      setTimeout(() => {
        if (data.user?.role === "Client") {
          router.push("/dashboard/client");
        } else if (data.user?.role === "Freelancer") {
          router.push("/dashboard/freelancer");
        } else {
          router.push("/dashboard");
        }
      }, 1000);

    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-10 flex items-center justify-center bg-[radial-gradient(circle_at_10%_20%,rgba(124,106,255,0.08),transparent_35%),radial-gradient(circle_at_90%_80%,rgba(255,106,158,0.06),transparent_35%),#08080d]">
      <div className="w-full max-w-[1180px] min-h-[680px] grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-[#13131a] border border-white/10 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.45),0_0_50px_rgba(124,106,255,0.05)]">
        
        {/* ───────────── Left: Login Form ───────────── */}
        <section className="flex items-center px-6 py-10 sm:px-10 md:px-16 bg-[radial-gradient(circle_at_0%_0%,rgba(124,106,255,0.07),transparent_35%),#0d0d14]">
          <div className="w-full max-w-[470px] mx-auto">

            {/* Heading */}
            <div className="mb-9">
              <h1 className="mb-2.5 text-white text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
                Welcome back 👋
              </h1>
              <p className="max-w-[400px] text-[#9090aa] text-base leading-relaxed">
                Log in to continue your journey with SkillNest.
              </p>
            </div>

            {/* Login Form */}
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-white text-sm font-medium">
                  Email address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[#9090aa] text-base pointer-events-none z-10">✉</span>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3.5 text-white bg-[#101018] border border-white/10 rounded-xl outline-none text-sm placeholder-[#68687d] transition-all hover:border-white/20 focus:bg-[#11111b] focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-white text-sm font-medium">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[#7c6aff] text-xs font-medium hover:text-[#9b8dff] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-[#9090aa] text-base pointer-events-none z-10">🔒</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3.5 text-white bg-[#101018] border border-white/10 rounded-xl outline-none text-sm placeholder-[#68687d] transition-all hover:border-white/20 focus:bg-[#11111b] focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10"
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 flex items-center justify-center w-7 h-7 text-[#9090aa] hover:text-white transition-colors"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label className="relative flex items-center gap-2.5 w-fit text-[#9090aa] text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`flex items-center justify-center w-4 h-4 border rounded text-xs transition-all ${
                    rememberMe
                      ? "bg-[#7c6aff] border-[#7c6aff] text-white shadow-[0_0_12px_rgba(124,106,255,0.35)]"
                      : "bg-[#101018] border-white/20"
                  }`}
                >
                  {rememberMe && "✓"}
                </span>
                <span>Remember me</span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-1 py-3.5 px-4 text-white font-semibold text-sm rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] shadow-[0_8px_25px_rgba(124,106,255,0.2)] hover:shadow-[0_10px_30px_rgba(124,106,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3.5 my-7">
              <span className="flex-1 h-px bg-white/10" />
              <p className="flex-shrink-0 text-[#68687d] text-xs">or continue with</p>
              <span className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 py-3 px-4 text-white text-sm font-medium bg-[#101018] border border-white/10 rounded-xl hover:bg-[#15151f] hover:border-white/20 hover:-translate-y-0.5 transition-all"
                onClick={() => {
                  window.location.href = `${API_BASE_URL}/api/auth/google`;
                }}
              >
                <FaGoogle className="text-[#4285f4] text-base" />
                <span>Google</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2.5 py-3 px-4 text-white text-sm font-medium bg-[#101018] border border-white/10 rounded-xl hover:bg-[#15151f] hover:border-white/20 hover:-translate-y-0.5 transition-all"
                onClick={() => {
                  window.location.href = `${API_BASE_URL}/api/auth/github`;
                }}
              >
                <FaGithub className="text-white text-base" />
                <span>GitHub</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="mt-7 text-center text-[#9090aa] text-sm">
              Do not have an account?{" "}
              <Link href="/auth/signup" className="text-[#7c6aff] font-semibold hover:text-[#9b8dff] transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </section>

        {/* ───────────── Right: Illustration ───────────── */}
        <section className="relative hidden lg:block min-h-[680px] overflow-hidden bg-[radial-gradient(circle_at_50%_30%,rgba(124,106,255,0.22),transparent_45%),#0b0b22]">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0b0b22]/15 to-transparent via-transparent bg-gradient-to-t from-[#050514]/40 to-transparent" />

          <Image
            src="/images/login-illustration.png"
            alt="SkillNest learning journey"
            className="absolute inset-0 w-full h-full object-cover opacity-85"
            width={800}
            height={800}
          />

          <div className="absolute top-16 left-16 z-20 max-w-[330px]">
            <span className="inline-block mb-5 text-[#b7afff] text-xs font-semibold tracking-[0.16em]">
              YOUR LEARNING JOURNEY
            </span>

            <h2 className="mb-5 text-white text-5xl font-bold leading-none tracking-tight">
              Learn.
              <br />
              Build.
              <br />
              <span className="text-[#ff8fbd] drop-shadow-[0_0_25px_rgba(255,106,158,0.3)]">Grow.</span>
            </h2>

            <p className="text-white/80 text-sm leading-relaxed">
              Connect with learners and professionals, develop new skills, and build your future with SkillNest.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}