"use client";
import React from "react";
import { FaStar } from "react-icons/fa";
import type { Review } from "./types";

export function ReviewForm({
  doctorId,
  onSubmit,
  patientId,
}: {
  doctorId: string;
  patientId?: string;
  onSubmit: (payload: Omit<Review, "id" | "date">) => Promise<void> | void;
}) {
  const [rating, setRating] = React.useState(5);
  const [title, setTitle] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return alert("Please write a comment.");
    setSubmitting(true);
    try {
      await onSubmit({
        doctorId,
        patientId: patientId ?? "anonymous",
        rating,
        title,
        comment,
      } as Omit<Review, "id" | "date">);
      setTitle("");
      setComment("");
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3"
      aria-label="Write a review"
    >
      <div className="flex items-center gap-2">
        <div className="text-sm">Rating:</div>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="sr-only" htmlFor="review-title">
          Title
        </label>
        <input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        />
      </div>
      <div>
        <label className="sr-only" htmlFor="review-comment">
          Comment
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your feedback..."
          className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          rows={4}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow disabled:opacity-60"
          disabled={submitting}
          aria-label="Submit review"
        >
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </div>
    </form>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
            n <= value ? "text-yellow-500" : "text-slate-300"
          }`}
          onClick={() => onChange(n)}
          aria-pressed={n === value}
          aria-label={`${n} star`}
        >
          <FaStar />
        </button>
      ))}
    </div>
  );
}
