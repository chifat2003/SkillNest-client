"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import MessagesUI from "@/components/shared/messages/MessagesUI";

export default function FreelancerMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={["Freelancer"]}>
      <MessagesUI />
    </ProtectedRoute>
  );
}
