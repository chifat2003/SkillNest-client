"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ReviewForm from "@/components/shared/reviews/ReviewForm";

export default function ClientReviewsPage() {
  return (
    <ProtectedRoute allowedRoles={["Client"]}>
      <ReviewForm />
    </ProtectedRoute>
  );
}
