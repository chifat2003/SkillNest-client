"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ReviewForm from "@/components/shared/reviews/ReviewForm";

export default function FreelancerReviewsPage() {
  return (
    <ProtectedRoute allowedRoles={["Freelancer"]}>
      <ReviewForm />
    </ProtectedRoute>
  );
}
