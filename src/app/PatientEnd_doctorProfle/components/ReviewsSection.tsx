"use client";
import React from "react";
import dayjs from "dayjs";
import { FaStar, FaRegStar } from "react-icons/fa";
import type { Review } from "./types";
import { ReviewForm } from "./ReviewForm";

export function ReviewsSection({
  doctorId,
  reviews,
  average,
  distribution,
  loading,
  onSubmit,
}: {
  doctorId: string;
  reviews: Review[];
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  loading: boolean;
  onSubmit: (payload: Omit<Review, "id" | "date">) => Promise<void> | void;
}) {
  return (
    <section className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 bg-blue-50 rounded-2xl p-4 ring-1 ring-blue-100">
          <div className="text-sm text-slate-600">Average Rating</div>
          <div className="mt-1 text-4xl font-bold text-slate-800">
            {average ? average.toFixed(1) : "—"}
          </div>
          <div className="mt-2 flex items-center gap-1" aria-hidden>
            <Stars value={average} />
          </div>
          <div className="mt-4 space-y-2" aria-label="Rating distribution">
            {[5, 4, 3, 2, 1].map((n) => (
              <Bar
                key={n}
                label={`${n} star`}
                count={distribution[n as 1 | 2 | 3 | 4 | 5]}
                total={reviews.length}
              />
            ))}
          </div>
        </div>

        <div className="md:flex-1">
          <h3 className="text-lg font-semibold text-slate-800">
            Patient Reviews
          </h3>
          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-slate-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : !reviews.length ? (
            <p className="mt-2 text-sm text-slate-500">
              No reviews yet — be the first to leave feedback.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{r.title || "Patient"}</div>
                      <div className="flex" aria-hidden>
                        <Stars value={r.rating} />
                      </div>
                    </div>
                    <time className="text-sm text-slate-500" dateTime={r.date}>
                      {dayjs(r.date).format("DD MMM YYYY")}
                    </time>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 border-t pt-5">
            <ReviewForm doctorId={doctorId} onSubmit={onSubmit} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <div className="flex" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) =>
        n <= full ? (
          <FaStar key={n} className="text-yellow-500" />
        ) : (
          <FaRegStar key={n} className="text-slate-300" />
        )
      )}
    </div>
  );
}

function Bar({
  label,
  count,
  total,
}: {
  label: string;
  count: number;
  total: number;
}) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label={`${label} reviews`}
    >
      <span className="w-14 text-xs text-slate-600">{label}</span>
      <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-slate-600 text-right">{count}</span>
    </div>
  );
}
