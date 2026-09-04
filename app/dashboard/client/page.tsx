"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function ClientDashboard() {
  return (
    <ProtectedRoute allowedRoles={["Client"]}>
      <main className="min-h-screen p-8 text-white bg-[#08080d]">
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <p className="mt-2 text-gray-400">Welcome back! Manage your jobs and hire talent.</p>
      </main>
    </ProtectedRoute>
  );
}