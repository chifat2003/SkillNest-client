"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

// Define the shape of User stored in localStorage
interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: "Client" | "Freelancer";
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("Client" | "Freelancer")[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");

    // 1. Check if token and user exist
    if (!token || !userJson) {
      router.replace("/auth/login");
      return;
    }

    try {
      const user: User = JSON.parse(userJson);

      // 2. Validate role against allowedRoles
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          // Redirect unauthorized user to their respective home route
          if (user.role === "Client") {
            router.replace("/dashboard/client");
          } else if (user.role === "Freelancer") {
            router.replace("/dashboard/freelancer");
          } else {
            router.replace("/auth/login");
          }
          return;
        }
      }

      // 3. User is authenticated and authorized
      setIsAuthorized(true);
    } catch (error) {
      console.error("Auth Guard Error:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/auth/login");
    }
  }, [router, allowedRoles]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08080d] text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#7c6aff]"></div>
      </div>
    );
  }

  return <>{children}</>;
}