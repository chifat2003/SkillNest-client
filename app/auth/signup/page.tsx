"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Freelancer" | "Client">("Freelancer");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreedToTerms) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, username, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      // Show success toast
      toast.success("Account created successfully! Redirecting to login...");

      // Clear input fields
      setFullName("");
      setUsername("");
      setEmail("");
      setPassword("");

      // Delay redirect by 1.5s so the user can read the toast message
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);

    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-68px)] px-4 py-10 flex items-center justify-center bg-[radial-gradient(circle_at_10%_20%,rgba(124,106,255,0.08),transparent_35%),radial-gradient(circle_at_90%_80%,rgba(255,106,158,0.06),transparent_35%),#08080d]">
      <div className="w-full max-w-[1180px] min-h-[680px] grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-[#13131a] border border-white/10 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.45),0_0_50px_rgba(124,106,255,0.05)]">
        
        {/* ───────────── Left: Sign Up Form ───────────── */}
        <section className="flex items-center px-6 py-10 sm:px-10 md:px-16 bg-[radial-gradient(circle_at_0%_0%,rgba(124,106,255,0.07),transparent_35%),#0d0d14]">
          <div className="w-full max-w-[470px] mx-auto">

            {/* Heading */}
            <div className="mb-5">
              <h1 className="mb-1.5 text-white text-3xl font-bold tracking-tight leading-tight">
                Create an account 
              </h1>
              <p className="text-[#9090aa] text-sm leading-relaxed">
                Join thousands of freelancers and clients on SkillNest.
              </p>
            </div>

            {/* Sign Up Form */}
            <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
              
              {/* Role Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-white text-xs font-medium">I want to join as a</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRole("Freelancer")}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      role === "Freelancer"
                        ? "bg-[#7c6aff]/15 border-[#7c6aff] text-white shadow-[0_0_15px_rgba(124,106,255,0.2)]"
                        : "bg-[#101018] border-white/10 text-[#9090aa] hover:border-white/20"
                    }`}
                  >
                    🛠️ Freelancer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("Client")}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      role === "Client"
                        ? "bg-[#7c6aff]/15 border-[#7c6aff] text-white shadow-[0_0_15px_rgba(124,106,255,0.2)]"
                        : "bg-[#101018] border-white/10 text-[#9090aa] hover:border-white/20"
                    }`}
                  >
                    💼 Client
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="fullName" className="text-white text-xs font-medium">Full Name</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#9090aa] text-sm pointer-events-none z-10">👤</span>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-white bg-[#101018] border border-white/10 rounded-xl outline-none text-xs placeholder-[#68687d] transition-all hover:border-white/20 focus:bg-[#11111b] focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1">
                <label htmlFor="username" className="text-white text-xs font-medium">Username</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#9090aa] text-sm pointer-events-none z-10">@</span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-white bg-[#101018] border border-white/10 rounded-xl outline-none text-xs placeholder-[#68687d] transition-all hover:border-white/20 focus:bg-[#11111b] focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10"
                  />
                </div>
              </div>

              {/* Email address */}
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-white text-xs font-medium">Email address</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#9090aa] text-sm pointer-events-none z-10">✉</span>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-white bg-[#101018] border border-white/10 rounded-xl outline-none text-xs placeholder-[#68687d] transition-all hover:border-white/20 focus:bg-[#11111b] focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-white text-xs font-medium">Password</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#9090aa] text-sm pointer-events-none z-10">🔒</span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-white bg-[#101018] border border-white/10 rounded-xl outline-none text-xs placeholder-[#68687d] transition-all hover:border-white/20 focus:bg-[#11111b] focus:border-[#7c6aff] focus:ring-4 focus:ring-[#7c6aff]/10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 flex items-center justify-center w-6 h-6 text-[#9090aa] hover:text-white transition-colors"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="relative flex items-start gap-2.5 mt-1 text-[#9090aa] text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                  className="sr-only"
                />
                <span
                  className={`mt-0.5 flex items-center justify-center min-w-[16px] h-4 border rounded text-[10px] transition-all ${
                    agreedToTerms
                      ? "bg-[#7c6aff] border-[#7c6aff] text-white shadow-[0_0_12px_rgba(124,106,255,0.35)]"
                      : "bg-[#101018] border-white/20"
                  }`}
                >
                  {agreedToTerms && "✓"}
                </span>
                <span className="leading-normal text-[11px]">
                  I agree to SkillNest's{" "}
                  <Link href="/terms" className="text-[#7c6aff] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#7c6aff] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!agreedToTerms || loading}
                className="w-full mt-1 py-2.5 px-4 text-white font-semibold text-xs rounded-xl bg-gradient-to-r from-[#7c6aff] to-[#ff6a9e] shadow-[0_8px_25px_rgba(124,106,255,0.2)] hover:shadow-[0_10px_30px_rgba(124,106,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="flex items-center gap-3.5 my-5">
              <span className="flex-1 h-px bg-white/10" />
              <p className="flex-shrink-0 text-[#68687d] text-[11px]">or continue with</p>
              <span className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-3 text-white text-xs font-medium bg-[#101018] border border-white/10 rounded-xl hover:bg-[#15151f] hover:border-white/20 hover:-translate-y-0.5 transition-all"
                onClick={() => {
                  window.location.href = `${API_BASE_URL}/api/auth/google`;
                }}
              >
                <FaGoogle className="text-[#4285f4] text-sm" />
                <span>Google</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 py-2.5 px-3 text-white text-xs font-medium bg-[#101018] border border-white/10 rounded-xl hover:bg-[#15151f] hover:border-white/20 hover:-translate-y-0.5 transition-all"
                onClick={() => {
                  window.location.href = `${API_BASE_URL}/api/auth/github`;
                }}
              >
                <FaGithub className="text-white text-sm" />
                <span>GitHub</span>
              </button>
            </div>

            {/* Login Link */}
            <p className="mt-5 text-center text-[#9090aa] text-xs">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#7c6aff] font-semibold hover:text-[#9b8dff] transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </section>

        {/* ───────────── Right: Illustration ───────────── */}
        <section className="relative hidden lg:block min-h-[680px] overflow-hidden bg-[radial-gradient(circle_at_50%_30%,rgba(124,106,255,0.22),transparent_45%),#0b0b22]">
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#0b0b22]/15 to-transparent via-transparent bg-gradient-to-t from-[#050514]/40 to-transparent" />

          <Image
            src="/images/register-illustration.png"
            alt="SkillNest community learning"
            className="absolute inset-0 w-full h-full object-cover opacity-85"
            width={800}
            height={800}
          />

          <div className="absolute top-16 left-16 z-20 max-w-[340px]">
            <span className="inline-block mb-4 text-[#b7afff] text-xs font-semibold tracking-[0.16em]">
              START YOUR JOURNEY TODAY
            </span>

            <h2 className="mb-4 text-white text-4xl font-bold leading-none tracking-tight">
              Master.
              <br />
              Collaborate.
              <br />
              <span className="text-[#ff8fbd] drop-shadow-[0_0_25px_rgba(255,106,158,0.3)]">Succeed.</span>
            </h2>

            <p className="text-white/80 text-xs leading-relaxed">
              Unlock interactive projects, freelance opportunities, and a global marketplace.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}