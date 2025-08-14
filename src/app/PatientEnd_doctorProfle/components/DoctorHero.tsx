"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  FaStar,
  FaRegStar,
  FaBookmark,
  FaRegBookmark,
  FaPaperPlane,
} from "react-icons/fa";
import type { Doctor } from "./types";

export function DoctorHero({
  doctor,
  loading,
  averageRating,
  reviewsCount,
}: {
  doctor: Doctor | null;
  loading: boolean;
  averageRating: number;
  reviewsCount: number;
}) {
  const [saved, setSaved] = React.useState(false);

  if (loading)
    return (
      <div className="bg-gradient-to-b from-blue-50 via-white to-white rounded-2xl p-6 shadow-lg border border-blue-50 animate-pulse">
        <div className="h-24 w-24 bg-slate-200 rounded-full" />
        <div className="mt-4 h-6 w-64 bg-slate-200 rounded" />
        <div className="mt-2 h-4 w-40 bg-slate-200 rounded" />
      </div>
    );

  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-white rounded-2xl p-6 shadow-lg border border-blue-50">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-shrink-0">
          <Image
            src={doctor?.profileImage || "/placeholder-doc.png"}
            alt={`${doctor?.name ?? "Doctor"} profile photo`}
            width={144}
            height={144}
            className="rounded-full object-cover shadow-md ring-2 ring-blue-50"
          />
        </div>
        <div className="flex-1 w-full">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
            {doctor?.name}
            {doctor?.specialty && (
              <span className="block md:inline md:ml-2 text-sm text-slate-500">
                — {doctor.specialty}
              </span>
            )}
          </h1>
          {doctor?.qualification && (
            <p className="mt-2 text-sm text-slate-600">
              {doctor.qualification}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm shadow-sm ring-1 ring-blue-100">
              <Stars value={averageRating} />
              <span className="font-medium">
                {averageRating ? averageRating.toFixed(1) : "New"}
              </span>
            </div>
            <div
              className="text-sm text-slate-500"
              aria-label={`${reviewsCount} reviews`}
            >
              {reviewsCount} reviews
            </div>
            {doctor?.services?.length ? (
              <div className="text-xs text-slate-500">
                • {doctor.services.length} services
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label="Book Appointment"
          >
            Book Appointment
          </button>
          <button
            className="border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 flex items-center gap-2"
            aria-label="Message Doctor"
          >
            <FaPaperPlane aria-hidden className="shrink-0" /> Message
          </button>
          <button
            onClick={() => setSaved((s) => !s)}
            className="px-4 py-2 rounded-xl hover:bg-blue-50 border border-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 flex items-center gap-2"
            aria-pressed={saved}
            aria-label={saved ? "Remove bookmark" : "Save doctor"}
          >
            {saved ? <FaBookmark /> : <FaRegBookmark />}{" "}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center" aria-hidden>
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
