"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import MessagesUI from "@/components/shared/messages/MessagesUI";

export default function ClientMessagesPage() {
  return (
    <ProtectedRoute allowedRoles={["Client"]}>
      <MessagesUI />
    </ProtectedRoute>
  );
}
