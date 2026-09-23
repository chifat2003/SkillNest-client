"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    const hash = window.location.hash;

    console.log("Google callback URL:", window.location.href);
    console.log("Hash:", hash);


    if (!hash) {
      console.log("ℹ️ No hash found.");
      return;
    }

    processed.current = true;

    const params = new URLSearchParams(hash.substring(1));

    const token = params.get("token");
    const user = params.get("user");

    console.log("Token exists:", !!token);
    console.log("User exists:", !!user);

    if (!token || !user) {
      console.error("Google authentication data missing");
      router.replace("/auth/login?error=google_login_failed");
      return;
    }

    try {
      const userData = JSON.parse(user);

      console.log("Google user data:", userData);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      window.history.replaceState(
        null,
        "",
        window.location.pathname
      );

      // Redirect according to role
      if (userData.role === "Freelancer") {
        console.log(" Redirecting to Freelancer dashboard");
        router.replace("/dashboard/freelancer");
      } else if (userData.role === "Client") {
        console.log(" Redirecting to Client dashboard");
        router.replace("/dashboard/client");
      } else {
        console.error(" Invalid user role:", userData.role);
        router.replace("/auth/login?error=invalid_role");
      }
    } catch (error) {
      console.error(" Google callback error:", error);
      router.replace("/auth/login?error=google_login_failed");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Signing you in with Google...</p>
    </div>
  );
}