"use client";
// app/doctor/[id]/page.tsx — SINGLE FILE
// Next.js 15 + TypeScript + Tailwind + framer-motion + react-icons + dayjs
// Uses env: NEXT_PUBLIC_API_BASE

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import {
  FaStar,
  FaRegStar,
  FaBookmark,
  FaRegBookmark,
  FaPaperPlane,
} from "react-icons/fa";
import {
  MdLocationOn,
  MdAccessTime,
  MdPhone,
  MdEmail,
  MdPublic,
  MdNavigateBefore,
  MdNavigateNext,
} from "react-icons/md";
import { useUser } from "@/context/UseContext-login";
import axios from "axios";
import axiosInstance from "@/utiles/axiosInstance";

// ================= Types =================
interface Doctor {
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
  fee?: number;
  yearsExperience?: number;
}

interface Prescription {
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

interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  date: string; // ISO
}

// ============== Config & Helpers ==============
const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
const fadeInUp = {
  initial: { y: 8, opacity: 0 },
  animate: { y: 0, opacity: 1 },
};

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

// Try newer endpoints first, then fall back to json-server style
async function fetchDoctor(doctorId: string): Promise<Doctor> {
  try {
    return await apiGet<Doctor>(`/doctors/${doctorId}`);
  } catch (e) {
    // fallback: sometimes id is under doctorId
    const list = await apiGet<Doctor[]>(`/doctors?doctorId=${doctorId}`);
    if (!list.length) throw e;
    return list[0];
  }
}

async function fetchReviews(doctorId: string): Promise<Review[]> {
  try {
    // proposed nested endpoint
    return await apiGet<Review[]>(
      `/doctors/${doctorId}/reviews?_sort=date&_order=desc`
    );
  } catch {
    return await apiGet<Review[]>(
      `/reviews?doctorId=${doctorId}&_sort=date&_order=desc`
    );
  }
}

async function postReview(payload: Review): Promise<Review> {
  try {
    // try nested
    return await apiPost<Review>(
      `/doctors/${payload.doctorId}/reviews`,
      payload
    );
  } catch {
    return await apiPost<Review>(`/reviews`, payload);
  }
}

async function fetchPrescriptions(
  doctorId: string,
  patientId: string // make patientId required
): Promise<Prescription[]> {
  try {
    // Fetch prescriptions filtered by both doctorId and patientId
    const query = `/prescriptions?doctorId=${doctorId}&patientId=${patientId}`;
    const response = await axiosInstance.get<Prescription[]>(query);

    return response.data;
  } catch (error) {
    console.error("Failed to fetch prescriptions:", error);
    return [];
  }
}

// ============== Page (single file) ==============
export default function DoctorProfilePage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const { user } = useUser();
  const doctorId = params?.id as string;
  const patientId = (search?.get("patientId") || undefined) as
    | string
    | undefined;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;
    if (!doctorId) return;
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      fetchDoctor(doctorId),
      fetchReviews(doctorId),
      fetchPrescriptions(doctorId, user?.id),
    ])
      .then(([d, rv, prs]) => {
        if (!active) return;
        setDoctor(d);
        setReviews(Array.isArray(rv) ? rv : []);
        setPrescriptions(Array.isArray(prs) ? prs : []);
      })
      .catch((e) => active && setError((e as Error).message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [doctorId, patientId]);
  const reviewsPerPage = 2;

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  // Slice reviews for current page
  const currentReviews = useMemo(() => {
    const start = (currentPage - 1) * reviewsPerPage;
    return reviews.slice(start, start + reviewsPerPage);
  }, [currentPage, reviews]);

  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  // Generate page numbers with ellipsis if many pages
  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (
        (i === 2 && currentPage > 3) ||
        (i === totalPages - 1 && currentPage < totalPages - 2)
      ) {
        pages.push("...");
      }
    }
    return pages;
  };
  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((a, b) => a + (b.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const distribution = useMemo(() => {
    const counts: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    reviews.forEach((r) => {
      const k = Math.min(5, Math.max(1, Math.round(r.rating))) as
        | 1
        | 2
        | 3
        | 4
        | 5;
      counts[k] += 1;
    });
    return counts;
  }, [reviews]);

  // Optimistic review submit
  async function handleSubmitReview({
    rating,
    title,
    comment,
  }: {
    rating: number;
    title?: string;
    comment: string;
  }) {
    const payload: Review = {
      id: `r-${Date.now()}`,
      doctorId,
      patientId: patientId ?? "anonymous",
      rating,
      title,
      comment,
      date: new Date().toISOString(),
    };
    const tempId = `temp-${Date.now()}`;
    const optimistic = { ...payload, id: tempId } as Review;
    setReviews((s) => [optimistic, ...s]);
    try {
      const saved = await postReview(payload);
      setReviews((s) => s.map((r) => (r.id === tempId ? saved : r)));
    } catch (e) {
      setReviews((s) => s.filter((r) => r.id !== tempId));
      alert("Failed to post review. Please try again.");
    }
  }

  // -------------- Render --------------
  if (loading) return <PageSkeleton />;
  if (error)
    return (
      <div className="max-w-4xl mx-auto p-6 text-red-600">Error: {error}</div>
    );
  if (!doctor)
    return <div className="max-w-4xl mx-auto p-6">Doctor not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 pb-28">
      {/* pb for sticky bottom on mobile */}
      {/* Hero */}
      <motion.section
        {...fadeInUp}
        transition={{ duration: 0.35 }}
        className="bg-gradient-to-b from-blue-50 via-white to-white rounded-2xl p-6 shadow-lg border border-blue-50"
      >
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-shrink-0">
            <img
              src={doctor.profileImage || "/placeholder-doc.png"}
              alt={`${doctor.name} profile`}
              width={144}
              height={144}
              className="rounded-full object-cover shadow-md ring-2 ring-blue-50"
            />
          </div>

          <div className="flex-1 w-full">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">
              {doctor.name.toUpperCase()}
              {doctor.specialty && (
                <span className="block md:inline md:ml-2 text-sm text-slate-500">
                  — {doctor.specialty}
                </span>
              )}
            </h1>
            {doctor.qualification && (
              <p className="mt-2 text-sm text-slate-600">
                {doctor.qualification}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm shadow-sm ring-1 ring-blue-100">
                <Stars value={avgRating} />
                <span className="font-medium">
                  {reviews.length ? avgRating.toFixed(1) : "New"}
                </span>
              </div>
              <div className="text-sm text-slate-500">
                {reviews.length} reviews
              </div>
              {doctor.yearsExperience != null && (
                <span className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 shadow-sm">
                  {doctor.yearsExperience}+ yrs
                </span>
              )}
              {doctor.fee != null && (
                <span className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 shadow-sm">
                  Fee ₹{doctor.fee}
                </span>
              )}
            </div>
          </div>

          <HeroActions />
        </div>
      </motion.section>

      {/* Grid */}
      <motion.section
        {...fadeInUp}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid md:grid-cols-3 gap-6 mt-6"
      >
        {/* Left */}
        <div className="md:col-span-2 space-y-6">
          <AboutCard doctor={doctor} />
          <ServicesCard services={doctor.services || []} />
          <PrescriptionsCard prescriptions={prescriptions} />
        </div>
        {/* Right */}
        <div className="md:col-span-1 space-y-6">
          <ClinicInfoCard doctor={doctor} />
        </div>
      </motion.section>

      {/* Reviews */}
      <motion.section
        {...fadeInUp}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-6 bg-white p-6 rounded-2xl shadow-md border border-blue-100"
      >
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 bg-blue-50 rounded-2xl p-4 ring-1 ring-blue-100">
            <div className="text-sm text-slate-600">Average Rating</div>
            <div className="mt-1 text-4xl font-bold text-slate-800">
              {reviews.length ? avgRating.toFixed(1) : "—"}
            </div>
            <div className="mt-2" aria-hidden>
              <Stars value={avgRating} />
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

            {!reviews.length ? (
              <p className="mt-2 text-sm text-slate-500">
                No reviews yet — be the first to leave feedback.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {currentReviews.map((r) => (
                  <li key={r.id} className="border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">
                          {r.title || "Patient"}
                        </div>
                        <div aria-hidden className="flex">
                          <Stars value={r.rating} />
                        </div>
                      </div>
                      <time
                        className="text-sm text-slate-500"
                        dateTime={r.date}
                      >
                        {dayjs(r.date).format("DD MMM YYYY")}
                      </time>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{r.comment}</p>
                  </li>
                ))}
              </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center gap-2 justify-center">
                {/* Previous Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border
      ${
        currentPage === 1
          ? "opacity-40 cursor-not-allowed border-gray-300 bg-gray-100"
          : "bg-white border-blue-400 hover:bg-blue-50 shadow-sm"
      } transition`}
                >
                  <MdNavigateBefore size={22} className="text-blue-500" />
                </motion.button>

                {/* Page Numbers */}
                {renderPageNumbers().map((p, idx) =>
                  typeof p === "number" ? (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToPage(p)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border text-sm font-medium
          ${
            p === currentPage
              ? "bg-blue-500 text-white border-blue-500 shadow-md"
              : "bg-white border-gray-300 hover:bg-blue-50 text-gray-700"
          } transition`}
                    >
                      {p}
                    </motion.button>
                  ) : (
                    <span
                      key={idx}
                      className="px-2 py-1 text-gray-400 font-semibold"
                    >
                      {p}
                    </span>
                  )
                )}

                {/* Next Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border
      ${
        currentPage === totalPages
          ? "opacity-40 cursor-not-allowed border-gray-300 bg-gray-100"
          : "bg-white border-blue-400 hover:bg-blue-50 shadow-sm"
      } transition`}
                >
                  <MdNavigateNext size={22} className="text-blue-500" />
                </motion.button>
              </div>
            )}

            {/* Review form */}
            <div className="mt-6 border-t pt-5">
              <ReviewForm onSubmit={handleSubmitReview} />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Sticky bottom (mobile) */}
      <div className="md:hidden fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur border-t border-blue-100 p-3">
        <div className="max-w-6xl mx-auto flex gap-2">
          <button
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl shadow"
            aria-label="Book Appointment"
          >
            Book Appointment
          </button>
          <button
            className="flex-1 border border-blue-100 px-4 py-2 rounded-xl"
            aria-label="Write a Review"
          >
            Write Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= Inline UI Bits (still single file) =================
function HeroActions() {
  const [saved, setSaved] = useState(false);
  return (
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
        <FaPaperPlane aria-hidden /> Message
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
  );
}

function AboutCard({ doctor }: { doctor: Doctor }) {
  const [expanded, setExpanded] = useState(false);
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
          <h3 className="text-md font-semibold text-slate-800">
            Qualifications
          </h3>
          <p className="mt-1 text-sm text-slate-600">{doctor.qualification}</p>
        </div>
      )}
      {!!doctor?.languages?.length && (
        <div className="mt-4">
          <h3 className="text-md font-semibold text-slate-800">Languages</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {doctor.languages!.map((l) => (
              <span
                key={l}
                className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 shadow-sm"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ServicesCard({ services }: { services: string[] }) {
  if (!services?.length) return null;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <h3 className="font-semibold text-slate-800 mb-4">Services Offered</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s}
            className="group bg-white border border-blue-100 rounded-2xl p-4 shadow-sm ring-1 ring-blue-50 transition-transform duration-150 hover:scale-[1.02]"
          >
            <div className="text-sm text-slate-700 font-medium">{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrescriptionsCard({
  prescriptions,
}: {
  prescriptions: Prescription[];
}) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <h3 className="text-lg font-semibold text-slate-800">Prescriptions</h3>
      {!prescriptions?.length ? (
        <p className="mt-2 text-sm text-slate-500">
          No prescriptions found for this doctor.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {prescriptions.map((pres) => (
            <details key={pres.id} className="border rounded-xl p-4">
              <summary className="font-medium cursor-pointer">
                {dayjs(pres.date).format("DD MMM, YYYY")} —{" "}
                {pres.medicines.length} medicine
                {pres.medicines.length > 1 ? "s" : ""}
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
                    {m.notes && (
                      <div className="text-xs text-slate-500 mt-1">
                        Notes: {m.notes}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {/* <div className="mt-3">
                <button
                  className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow"
                  aria-label="Download Prescription"
                 
                >
                  Download PDF
                </button>
              </div> */}
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

function ClinicInfoCard({ doctor }: { doctor: Doctor }) {
  return (
    <aside className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <h3 className="font-semibold text-slate-800 mb-3">Clinic & Contact</h3>
      <ul className="space-y-3 text-sm text-slate-700">
        {doctor?.clinicName && (
          <li className="font-medium">{doctor.clinicName}</li>
        )}
        {doctor?.address && (
          <li className="flex items-start gap-2">
            <MdLocationOn className="mt-0.5" aria-hidden />{" "}
            <span>{doctor.address}</span>
          </li>
        )}
        {(doctor?.phone || doctor?.doctoremailOrphone) && (
          <li className="flex items-center gap-2">
            <MdPhone aria-hidden />{" "}
            <span>{doctor.phone || doctor.doctoremailOrphone}</span>
          </li>
        )}
        {doctor?.website && (
          <li className="flex items-center gap-2">
            <MdPublic aria-hidden />{" "}
            <a
              className="text-blue-600 hover:underline"
              href={doctor.website}
              target="_blank"
              rel="noreferrer"
            >
              Website
            </a>
          </li>
        )}
        {doctor?.doctoremailOrphone &&
          doctor.doctoremailOrphone.includes("@") && (
            <li className="flex items-center gap-2">
              <MdEmail aria-hidden />{" "}
              <a
                className="text-blue-600 hover:underline"
                href={`mailto:${doctor.doctoremailOrphone}`}
              >
                {doctor.doctoremailOrphone}
              </a>
            </li>
          )}
      </ul>
      {(doctor?.workingDays?.length || doctor?.workingHours?.length) && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <MdAccessTime aria-hidden /> Working Hours
          </h4>
          <div className="text-sm text-slate-600 space-y-1">
            {(doctor?.workingDays || []).map((d, i) => (
              <div key={`${d.start}-${i}`}>
                {d.start}
                {d.end ? ` - ${d.end}` : ""} •{" "}
                {doctor?.workingHours?.[i]?.start ??
                  doctor?.workingHours?.[0]?.start ??
                  ""}{" "}
                -{" "}
                {doctor?.workingHours?.[i]?.end ??
                  doctor?.workingHours?.[0]?.end ??
                  ""}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
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

function ReviewForm({
  onSubmit,
}: {
  onSubmit: (v: {
    rating: number;
    title?: string;
    comment: string;
  }) => void | Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return alert("Please write a comment.");
    setSubmitting(true);
    try {
      await onSubmit({ rating, title, comment });
      setTitle("");
      setComment("");
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handle} className="space-y-3" aria-label="Write a review">
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

function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 animate-pulse">
      <div className="bg-white rounded-2xl p-6 shadow border border-blue-50">
        <div className="h-24 w-24 bg-slate-200 rounded-full" />
        <div className="mt-4 h-6 w-64 bg-slate-200 rounded" />
        <div className="mt-2 h-4 w-40 bg-slate-200 rounded" />
      </div>
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow border border-blue-50"
            >
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-11/12 bg-slate-200 rounded" />
                <div className="h-3 w-10/12 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow border border-blue-50 h-40"></div>
        </div>
      </div>
    </div>
  );
}
