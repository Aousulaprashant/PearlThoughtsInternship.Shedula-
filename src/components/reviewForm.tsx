"use client";

import axiosInstance from "@/utiles/axiosInstance";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

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
  apiBaseUrl?: string;
  onAfterSubmit?: (newReviewList: Review[], newCount: number) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  doctorId,
  apiBaseUrl = "http://localhost:5000",
  onAfterSubmit,
}) => {
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });
  const [postingReview, setPostingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

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
      const newReview: Review = {
        doctorId,
        name: reviewForm.name.trim(),
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      };

      // POST directly to the reviews endpoint
      const postRes = await axiosInstance.post(`/reviews`, newReview);

      if (postRes.status >= 200 && postRes.status < 300) {
        onAfterSubmit?.(
          (prevReviews: Review[]) => [...prevReviews, newReview],
          (prevCount: number) => prevCount + 1
        );

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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-2xl shadow-md mt-8 border border-gray-100"
    >
      <h4 className="font-bold text-lg mb-4 text-gray-800">Add Your Review</h4>

      <form onSubmit={handleSubmitReview} className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={reviewForm.name}
          onChange={(e) =>
            setReviewForm((f) => ({ ...f, name: e.target.value }))
          }
        />

        {/* Star Rating */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            return (
              <motion.button
                type="button"
                key={i}
                onClick={() =>
                  setReviewForm((f) => ({ ...f, rating: starValue }))
                }
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="focus:outline-none"
              >
                <FaStar
                  size={28}
                  className={
                    starValue <= reviewForm.rating
                      ? "text-yellow-400 drop-shadow-sm"
                      : "text-gray-300"
                  }
                />
              </motion.button>
            );
          })}
          <span className="ml-2 text-sm text-gray-600">
            {reviewForm.rating} / 5
          </span>
        </div>

        <textarea
          placeholder="Write your review..."
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          value={reviewForm.comment}
          onChange={(e) =>
            setReviewForm((f) => ({ ...f, comment: e.target.value }))
          }
        />

        {reviewError && (
          <div className="text-red-600 text-sm">{reviewError}</div>
        )}
        {reviewSuccess && (
          <div className="text-green-600 text-sm">{reviewSuccess}</div>
        )}

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium shadow hover:bg-blue-600 transition-colors"
          disabled={postingReview}
        >
          {postingReview ? "Submitting…" : "Submit Review"}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ReviewForm;
