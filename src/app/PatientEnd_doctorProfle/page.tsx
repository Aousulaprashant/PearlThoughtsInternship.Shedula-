// ===============================
// Doctor Profile — Production-Ready Page (Patient View)
// Stack: Next.js 15 (App Router) + TypeScript + Tailwind CSS + framer-motion + react-icons + dayjs
// Theme: blue-500
// ===============================
//
// QUICK SETUP
// 1) Install deps:
//    npm i framer-motion react-icons dayjs
//    # optional: npm i swr (not required for this version)
// 2) Ensure env: NEXT_PUBLIC_API_BASE (e.g. http://localhost:3000 for json-server)
// 3) Tailwind is assumed configured. Primary is blue-500 via default palette.
// 4) Place files as indicated below under /app/doctor/[id]/...
// 5) Start json-server with resources: doctors, prescriptions, reviews
//
// =============================================
// FILE: app/doctor/[id]/page.tsx
// =============================================
/*
"use client";
import React from "react";
import { DoctorProfilePage } from "./components/DoctorProfilePage";

export default function Page({ params, searchParams }: { params: { id: string }; searchParams: { patientId?: string } }) {
  const doctorId = params.id;
  const patientId = searchParams?.patientId; // supply from auth or query
  return <DoctorProfilePage doctorId={doctorId} patientId={patientId} />;
}

// =============================================
// FILE: app/doctor/[id]/components/types.ts
// =============================================
export interface Doctor {
  id: string;
  doctorId: string;
  name: string;
  profileImage?: string;
  digitalSignature?: string;
  specialty?: string;
  qualification?: string;
  about?: string;
  clinicName?: string;
  address?: string;
  phone?: string;
  doctoremailOrphone?: string;
  website?: string;
  workingDays?: { start: string; end?: string }[];
  workingHours?: { start: string; end: string }[];
  services?: string[];
  languages?: string[];
}

export interface Prescription {
  id: string;
  appointmentId?: string;
  patientId?: string;
  doctorId?: string;
  date: string;
  medicines: Array<{
    medicine: string;
    dosage?: string;
    duration?: string;
    notes?: string;
    route?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  date: string; // ISO
}

// =============================================
// FILE: app/doctor/[id]/components/hooks.ts
// =============================================
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Doctor, Prescription, Review } from "./types";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function apiPost<T>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

export function useDoctor(doctorId: string) {
  const [data, setData] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiGet<Doctor>(`/doctors/${doctorId}`)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [doctorId]);

  return { data, loading, error };
}

export function usePrescriptions(doctorId: string, patientId?: string) {
  const [data, setData] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let q = `/prescriptions?doctorId=${doctorId}`;
    if (patientId) q += `&patientId=${patientId}`;
    let active = true;
    setLoading(true);
    apiGet<Prescription[]>(q)
      .then((d) => active && setData(Array.isArray(d) ? d : []))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [doctorId, patientId]);

  return { data, loading, error };
}

export function useReviews(doctorId: string) {
  const [data, setData] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    apiGet<Review[]>(`/reviews?doctorId=${doctorId}&_sort=date&_order=desc`)
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const average = useMemo(() => {
    if (!data.length) return 0;
    return data.reduce((a, b) => a + (b.rating || 0), 0) / data.length;
  }, [data]);

  const distribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<1 | 2 | 3 | 4 | 5, number>;
    data.forEach((r) => {
      const key = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[key] += 1;
    });
    return counts;
  }, [data]);

  const postReview = useCallback(
    async (payload: Omit<Review, "id" | "date"> & { id?: string; date?: string }) => {
      const tempId = `temp-${Date.now()}`;
      const optimistic: Review = {
        id: tempId,
        date: new Date().toISOString(),
        ...payload,
      } as Review;
      setData((s) => [optimistic, ...s]);
      try {
        const saved = await apiPost<Review>("/reviews", {
          ...payload,
          id: payload.id ?? `r-${Date.now()}`,
          date: new Date().toISOString(),
        });
        setData((s) => s.map((r) => (r.id === tempId ? saved : r)));
        return { ok: true } as const;
      } catch (e) {
        setData((s) => s.filter((r) => r.id !== tempId));
        return { ok: false, error: (e as Error).message } as const;
      }
    },
    []
  );

  return { data, loading, error, average, distribution, refresh, postReview };
}

// =============================================
// FILE: app/doctor/[id]/components/DoctorProfilePage.tsx
// =============================================
"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import Image from "next/image";
import { DoctorHero } from "./DoctorHero";
import { ClinicInfo } from "./ClinicInfo";
import { ServicesGrid } from "./ServicesGrid";
import { PrescriptionsList } from "./PrescriptionsList";
import { ReviewsSection } from "./ReviewsSection";
import { useDoctor, usePrescriptions, useReviews } from "./hooks";
import type { Doctor } from "./types";

const fadeInUp = { initial: { y: 8, opacity: 0 }, animate: { y: 0, opacity: 1 } };

export function DoctorProfilePage({ doctorId, patientId }: { doctorId: string; patientId?: string }) {
  const { data: doctor, loading: loadingDoctor } = useDoctor(doctorId);
  const { data: prescriptions, loading: loadingPres } = usePrescriptions(doctorId, undefined);
  const reviewsHook = useReviews(doctorId);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <AnimatePresence>
        <motion.div {...fadeInUp} transition={{ duration: 0.35 }}>
          <DoctorHero doctor={doctor as Doctor | null} loading={loadingDoctor} averageRating={reviewsHook.average} reviewsCount={reviewsHook.data.length} />
        </motion.div>

        <motion.div {...fadeInUp} transition={{ duration: 0.35, delay: 0.05 }} className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 space-y-6">
            <AboutCard doctor={doctor as Doctor | null} loading={loadingDoctor} />
            <PrescriptionsList prescriptions={prescriptions} loading={loadingPres} />
          </div>
          <div className="md:col-span-1 space-y-6">
            <ClinicInfo doctor={doctor as Doctor | null} loading={loadingDoctor} />
            <StickyCTA />
          </div>
        </motion.div>

        <motion.div {...fadeInUp} transition={{ duration: 0.35, delay: 0.1 }} className="mt-6">
          <ReviewsSection
            doctorId={doctorId}
            reviews={reviewsHook.data}
            average={reviewsHook.average}
            distribution={reviewsHook.distribution}
            loading={reviewsHook.loading}
            onSubmit={async (payload) => {
              const res = await reviewsHook.postReview({ ...payload });
              if (!res.ok) alert("Failed to post review. Please try again.");
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AboutCard({ doctor, loading }: { doctor: Doctor | null; loading: boolean }) {
  const [expanded, setExpanded] = React.useState(false);
  if (loading) return <SkeletonCard title="About" />;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <h2 className="text-lg font-semibold text-slate-800">About</h2>
      <div className="mt-2 text-sm text-slate-600">
        <AnimatePresence initial={false}>
          <motion.div
            key={expanded ? "expanded" : "collapsed"}
            initial={{ height: 72, overflow: "hidden" }}
            animate={{ height: expanded ? "auto" : 72 }}
            exit={{ height: 72 }}
            transition={{ duration: 0.3 }}
          >
            {doctor?.about || "No bio provided."}
          </motion.div>
        </AnimatePresence>
        {doctor?.about && doctor.about.length > 220 && (
          <button
            onClick={() => setExpanded((s) => !s)}
            className="mt-2 text-blue-600 hover:underline focus:outline-none focus-visible:ring focus-visible:ring-blue-300 rounded px-1"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {doctor?.qualification && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-slate-800">Qualifications</h3>
          <p className="mt-1 text-sm text-slate-600">{doctor.qualification}</p>
        </div>
      )}

      {!!doctor?.languages?.length && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-slate-800">Languages</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {doctor.languages!.map((l) => (
              <span key={l} className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 shadow-sm">
                {l}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StickyCTA() {
  return (
    <div className="hidden md:block sticky top-4 bg-white p-4 rounded-2xl shadow-md border border-blue-100">
      <div className="text-slate-700 text-sm">Ready to visit?</div>
      <div className="mt-3 flex gap-2">
        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300" aria-label="Book Appointment">
          Book Appointment
        </button>
        <button className="flex-1 border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300" aria-label="Write a Review">
          Write Review
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">Secure & private. You’ll get confirmation via SMS/email.</p>
    </div>
  );
}

function SkeletonCard({ title }: { title: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 animate-pulse">
      <div className="h-5 w-40 bg-slate-200 rounded" aria-hidden />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full bg-slate-200 rounded" />
        <div className="h-3 w-11/12 bg-slate-200 rounded" />
        <div className="h-3 w-10/12 bg-slate-200 rounded" />
      </div>
      <span className="sr-only">Loading {title}</span>
    </div>
  );
}

// =============================================
// FILE: app/doctor/[id]/components/DoctorHero.tsx
// =============================================
"use client";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaStar, FaRegStar, FaBookmark, FaRegBookmark, FaPaperPlane } from "react-icons/fa";
import type { Doctor } from "./types";

export function DoctorHero({ doctor, loading, averageRating, reviewsCount }: { doctor: Doctor | null; loading: boolean; averageRating: number; reviewsCount: number; }) {
  const [saved, setSaved] = React.useState(false);

  if (loading) return (
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
              <span className="block md:inline md:ml-2 text-sm text-slate-500">— {doctor.specialty}</span>
            )}
          </h1>
          {doctor?.qualification && (
            <p className="mt-2 text-sm text-slate-600">{doctor.qualification}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm shadow-sm ring-1 ring-blue-100">
              <Stars value={averageRating} />
              <span className="font-medium">{averageRating ? averageRating.toFixed(1) : "New"}</span>
            </div>
            <div className="text-sm text-slate-500" aria-label={`${reviewsCount} reviews`}>
              {reviewsCount} reviews
            </div>
            {doctor?.services?.length ? (
              <div className="text-xs text-slate-500">• {doctor.services.length} services</div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300" aria-label="Book Appointment">
            Book Appointment
          </button>
          <button className="border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 flex items-center gap-2" aria-label="Message Doctor">
            <FaPaperPlane aria-hidden className="shrink-0" /> Message
          </button>
          <button
            onClick={() => setSaved((s) => !s)}
            className="px-4 py-2 rounded-xl hover:bg-blue-50 border border-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 flex items-center gap-2"
            aria-pressed={saved}
            aria-label={saved ? "Remove bookmark" : "Save doctor"}
          >
            {saved ? <FaBookmark /> : <FaRegBookmark />} {saved ? "Saved" : "Save"}
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
      {[1, 2, 3, 4, 5].map((n) => (n <= full ? <FaStar key={n} className="text-yellow-500" /> : <FaRegStar key={n} className="text-slate-300" />))}
    </div>
  );
}

// =============================================
// FILE: app/doctor/[id]/components/ClinicInfo.tsx
// =============================================
"use client";
import React from "react";
import { MdLocationOn, MdAccessTime, MdPhone, MdEmail, MdPublic } from "react-icons/md";
import type { Doctor } from "./types";

export function ClinicInfo({ doctor, loading }: { doctor: Doctor | null; loading: boolean }) {
  if (loading) return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 animate-pulse">
      <div className="h-5 w-40 bg-slate-200 rounded" />
      <div className="mt-3 h-3 w-11/12 bg-slate-200 rounded" />
      <div className="mt-2 h-3 w-9/12 bg-slate-200 rounded" />
    </div>
  );
  return (
    <aside className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <h3 className="font-semibold text-slate-800 mb-3">Clinic & Contact</h3>
      <ul className="space-y-3 text-sm text-slate-700">
        {doctor?.clinicName && (
          <li className="font-medium">{doctor.clinicName}</li>
        )}
        {doctor?.address && (
          <li className="flex items-start gap-2"><MdLocationOn className="mt-0.5" aria-hidden /> <span>{doctor.address}</span></li>
        )}
        {(doctor?.phone || doctor?.doctoremailOrphone) && (
          <li className="flex items-center gap-2"><MdPhone aria-hidden /> <span>{doctor.phone || doctor.doctoremailOrphone}</span></li>
        )}
        {doctor?.website && (
          <li className="flex items-center gap-2"><MdPublic aria-hidden /> <a className="text-blue-600 hover:underline" href={doctor.website} target="_blank" rel="noreferrer">Website</a></li>
        )}
        {(doctor?.doctoremailOrphone && doctor.doctoremailOrphone.includes("@")) && (
          <li className="flex items-center gap-2"><MdEmail aria-hidden /> <a className="text-blue-600 hover:underline" href={`mailto:${doctor.doctoremailOrphone}`}>{doctor.doctoremailOrphone}</a></li>
        )}
      </ul>

      {(doctor?.workingDays?.length || doctor?.workingHours?.length) && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2"><MdAccessTime aria-hidden /> Working Hours</h4>
          <div className="text-sm text-slate-600 space-y-1">
            {(doctor?.workingDays || []).map((d, i) => (
              <div key={`${d.start}-${i}`}>{d.start}{d.end ? ` - ${d.end}` : ""} • {(doctor?.workingHours?.[i]?.start ?? doctor?.workingHours?.[0]?.start) ?? ""} - {(doctor?.workingHours?.[i]?.end ?? doctor?.workingHours?.[0]?.end) ?? ""}</div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

// =============================================
// FILE: app/doctor/[id]/components/ServicesGrid.tsx
// =============================================
"use client";
import React from "react";
import { MdMedicalServices } from "react-icons/md";

export function ServicesGrid({ services = [] as string[] }) {
  if (!services.length) return null;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <h3 className="font-semibold text-slate-800 mb-4">Services Offered</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s} className="group bg-white border border-blue-100 rounded-2xl p-4 shadow-sm ring-1 ring-blue-50 transition-transform duration-150 hover:scale-[1.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-50 text-blue-700"><MdMedicalServices aria-hidden /></div>
              <div className="text-sm text-slate-700 font-medium">{s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
// FILE: app/doctor/[id]/components/PrescriptionsList.tsx
// =============================================
"use client";
import React from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import type { Prescription } from "./types";

export function PrescriptionsList({ prescriptions, loading }: { prescriptions: Prescription[]; loading: boolean }) {
  if (loading) return <Skeleton />;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <h3 className="text-lg font-semibold text-slate-800">Prescriptions</h3>
      {!prescriptions?.length ? (
        <EmptyState />
      ) : (
        <div className="mt-3 space-y-3">
          {prescriptions.map((pres) => (
            <details key={pres.id} className="border rounded-xl p-4">
              <summary className="font-medium cursor-pointer">
                {dayjs(pres.date).format("DD MMM, YYYY")} — {pres.medicines.length} medicine{pres.medicines.length > 1 ? "s" : ""}
              </summary>
              <ul className="mt-3 text-sm text-slate-700 divide-y">
                {pres.medicines.map((m, i) => (
                  <li key={`${pres.id}-${i}`} className="py-2">
                    <div className="font-semibold">{m.medicine}</div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                      {m.dosage && <span>Dosage: {m.dosage}</span>}
                      {m.duration && <span>Duration: {m.duration}</span>}
                      {m.route && <span>Route: {m.route}</span>}
                    </div>
                    {m.notes && <div className="text-xs text-slate-500 mt-1">Notes: {m.notes}</div>}
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <button className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow" aria-label="Download Prescription">
                  Download PDF
                </button>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 animate-pulse">
      <div className="h-5 w-48 bg-slate-200 rounded" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-4 w-11/12 bg-slate-200 rounded" />
        <div className="h-4 w-10/12 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-2 text-sm text-slate-500">
      No prescriptions found for this doctor.
    </div>
  );
}

// =============================================
// FILE: app/doctor/[id]/components/ReviewsSection.tsx
// =============================================
"use client";
import React from "react";
import dayjs from "dayjs";
import { FaStar, FaRegStar } from "react-icons/fa";
import type { Review } from "./types";
import { ReviewForm } from "./ReviewForm";

export function ReviewsSection({ doctorId, reviews, average, distribution, loading, onSubmit }: {
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
          <div className="mt-1 text-4xl font-bold text-slate-800">{average ? average.toFixed(1) : "—"}</div>
          <div className="mt-2 flex items-center gap-1" aria-hidden>
            <Stars value={average} />
          </div>
          <div className="mt-4 space-y-2" aria-label="Rating distribution">
            {[5, 4, 3, 2, 1].map((n) => (
              <Bar key={n} label={`${n} star`} count={distribution[n as 1 | 2 | 3 | 4 | 5]} total={reviews.length} />
            ))}
          </div>
        </div>

        <div className="md:flex-1">
          <h3 className="text-lg font-semibold text-slate-800">Patient Reviews</h3>
          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !reviews.length ? (
            <p className="mt-2 text-sm text-slate-500">No reviews yet — be the first to leave feedback.</p>
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
                    <time className="text-sm text-slate-500" dateTime={r.date}>{dayjs(r.date).format("DD MMM YYYY")}</time>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 border-t pt-5">
            <ReviewForm
              doctorId={doctorId}
              onSubmit={onSubmit}
            />
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
      {[1, 2, 3, 4, 5].map((n) => (n <= full ? <FaStar key={n} className="text-yellow-500" /> : <FaRegStar key={n} className="text-slate-300" />))}
    </div>
  );
}

function Bar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2" role="group" aria-label={`${label} reviews`}>
      <span className="w-14 text-xs text-slate-600">{label}</span>
      <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-slate-600 text-right">{count}</span>
    </div>
  );
}

// =============================================
// FILE: app/doctor/[id]/components/ReviewForm.tsx
// =============================================
"use client";
import React from "react";
import { FaStar } from "react-icons/fa";
import type { Review } from "./types";

export function ReviewForm({ doctorId, onSubmit, patientId }: {
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
      await onSubmit({ doctorId, patientId: patientId ?? "anonymous", rating, title, comment } as Omit<Review, "id" | "date">);
      setTitle("");
      setComment("");
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-label="Write a review">
      <div className="flex items-center gap-2">
        <div className="text-sm">Rating:</div>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="sr-only" htmlFor="review-title">Title</label>
        <input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        />
      </div>
      <div>
        <label className="sr-only" htmlFor="review-comment">Comment</label>
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

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Select rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${n <= value ? "text-yellow-500" : "text-slate-300"}`}
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

// =============================== END OF FILES ===============================
*/
