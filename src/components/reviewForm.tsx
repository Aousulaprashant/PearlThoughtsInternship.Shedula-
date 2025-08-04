"use client";

import axiosInstance from "@/utiles/axiosInstance";
import React, { useState } from "react";

type Review = {
  name: string;
  date: string;
  rating: number;
  comment: string;
};

type DoctorResponse = {
  reviewList?: Review[];
  reviews?: number | string;
};

interface ReviewFormProps {
  doctorId: string | number;
  /** e.g., "http://localhost:5000" (defaults to that if not provided) */
  apiBaseUrl?: string;
  /**
   * Called after a successful submit so the parent can update its local state.
   * newCount is the incremented reviews count (parsed to number, if available).
   */
  onAfterSubmit?: (newReviewList: Review[], newCount: number) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  doctorId,
  apiBaseUrl = "http://localhost:5000",
  onAfterSubmit,
}) => {
  // --- Review form state ---
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });
  const [postingReview, setPostingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  // --- Submit handler ---
  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      setReviewError("Please enter your name and a comment.");
      return;
    }

    setPostingReview(true);
    try {
      // Build the new review
      const newReview: Review = {
        name: reviewForm.name.trim(),
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      };

      // 1) Get the latest doctor (ensures we patch against current data)
      const getRes = await axiosInstance.get<DoctorResponse>(
        `/doctors/${doctorId}`
      );

      const latest = getRes.data;

      const updatedReviewList: Review[] = Array.isArray(latest.reviewList)
        ? [...latest.reviewList, newReview]
        : [newReview];

      // 2) PATCH just the reviewList (json-server supports partial updates)
      const patchRes = await axiosInstance.patch(`/doctors/${doctorId}`, {
        reviewList: updatedReviewList,
      });

      if (patchRes.status >= 200 && patchRes.status < 300) {
        // 3) Notify parent so it can update local doctor state (rating count, list, etc.)
        const currentCount =
          typeof latest.reviews === "number"
            ? latest.reviews
            : Number(latest.reviews || 0);
        onAfterSubmit?.(updatedReviewList, currentCount + 1);

        // Clear form
        setReviewForm({ name: "", rating: 5, comment: "" });
        setReviewSuccess("Thanks! Your review was submitted.");
      } else {
        throw new Error("Failed saving review.");
      }
    } catch (err: any) {
      setReviewError(
        err?.message || "Something went wrong while posting your review."
      );
    } finally {
      setPostingReview(false);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-xl mt-6">
      <h4 className="font-bold mb-3">Add a Review</h4>

      <form onSubmit={handleSubmitReview}>
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-2 mb-3 border rounded-lg"
          value={reviewForm.name}
          onChange={(e) =>
            setReviewForm((f) => ({ ...f, name: e.target.value }))
          }
        />

        <select
          className="w-full p-2 mb-3 border rounded-lg"
          value={reviewForm.rating}
          onChange={(e) =>
            setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))
          }
        >
          <option value={5}>★★★★★ (5)</option>
          <option value={4}>★★★★☆ (4)</option>
          <option value={3}>★★★☆☆ (3)</option>
          <option value={2}>★★☆☆☆ (2)</option>
          <option value={1}>★☆☆☆☆ (1)</option>
        </select>

        <textarea
          placeholder="Write your review..."
          className="w-full p-2 mb-3 border rounded-lg"
          rows={4}
          value={reviewForm.comment}
          onChange={(e) =>
            setReviewForm((f) => ({ ...f, comment: e.target.value }))
          }
        />

        {reviewError && (
          <div className="text-red-600 text-sm mb-3">{reviewError}</div>
        )}
        {reviewSuccess && (
          <div className="text-green-600 text-sm mb-3">{reviewSuccess}</div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
          disabled={postingReview}
        >
          {postingReview ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
