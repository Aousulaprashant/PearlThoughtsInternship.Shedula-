"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaFileMedical,
  FaPills,
} from "react-icons/fa";
import toast from "react-hot-toast";
import PrescriptionView from "@/components/viewPrescription"; // you already have this

type Appointment = {
  id: string;
  patientName: string;
  phoneNumber?: string;
  gender?: string;
  appointmentDate: string;
  appointmentTime?: string;
  doctorName?: string;
  specialization?: string;
  fee?: string;
  isCompleted?: boolean;
  status?: string;
  location?: string;
  // ...other fields from db
};

type Medicine = {
  medicine: string;
  dosage?: string;
  duration?: string;
  route?: string;
  frequency?: string;
  notes?: string;
};

type Prescription = {
  id: string;
  appointmentId: string;
  patientId?: string;
  patientName?: string;
  date?: string;
  diagnosis?: string;
  medicines?: Medicine[];
  advices?: string[];
  additionalNotes?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  clinicName?: string;
  clinicAddress?: string;
  followUpDate?: string;
  vitals?: Record<string, any>;
};

export default function PatientHistoryPage() {
  const { patined_id } = useParams(); // matches your folder name
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [baseAppointment, setBaseAppointment] = useState<Appointment | null>(
    null
  );
  const [history, setHistory] = useState<
    (Appointment & { prescription?: Prescription | null })[]
  >([]);
  const [openPrescription, setOpenPrescription] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);

  useEffect(() => {
    if (!patined_id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1) Fetch the appointment used in the URL (this must exist)
        const apptRes = await axios.get<Appointment>(
          `http://localhost:5000/appointments/${encodeURIComponent(patined_id)}`
        );
        const appt = apptRes.data;
        setBaseAppointment(appt);

        // 2) Fetch all appointments for same patientName (most recent first)
        const apptsRes = await axios.get<Appointment[]>(
          `http://localhost:5000/appointments?patientName=${encodeURIComponent(
            appt.patientName
          )}&_sort=appointmentDate&_order=desc`
        );
        const appts = apptsRes.data || [];

        // 3) For each appointment, fetch prescription(s) by appointmentId
        const enriched = await Promise.all(
          appts.map(async (a) => {
            try {
              const presRes = await axios.get<Prescription[]>(
                `http://localhost:5000/prescriptions?appointmentId=${encodeURIComponent(
                  a.id
                )}`
              );
              const pres =
                presRes.data && presRes.data.length ? presRes.data[0] : null;
              return { ...a, prescription: pres };
            } catch (err) {
              return { ...a, prescription: null };
            }
          })
        );

        setHistory(enriched);
      } catch (err: any) {
        console.error("Failed to load history:", err);
        if (err?.response?.status === 404) {
          toast.error("Appointment not found (invalid id in URL).");
        } else {
          toast.error("Failed to load patient history.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patined_id]);

  const openOrToastPrescription = (prescription: Prescription | null) => {
    if (!prescription) {
      toast.error("No prescription is given");
      return;
    }
    setSelectedPrescription(prescription);
    setOpenPrescription(true);
  };

  if (loading)
    return (
      <div className="p-10 flex justify-center items-center text-blue-500 font-semibold text-lg animate-pulse">
        Loading patient history...
      </div>
    );
  if (!baseAppointment)
    return (
      <div className="p-10 text-center text-red-600 font-semibold text-lg">
        No appointment found for this id.
      </div>
    );

  const totalPrescriptions = history.filter((h) => h.prescription).length;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-3 text-blue-500 hover:text-blue-700 font-semibold mb-6 transition-colors duration-300"
        aria-label="Go back"
      >
        <FaArrowLeft className="text-xl" />
        Back to Patient List
      </button>

      {/* Header */}
      <section className="bg-white shadow-lg rounded-2xl px-8 py-6 mb-8 border border-gray-200">
        <h1 className="text-4xl font-extrabold text-blue-500 tracking-tight">
          {baseAppointment.patientName}
        </h1>
        <p className="mt-1 text-gray-600 text-lg">
          Visits:{" "}
          <span className="font-semibold text-blue-600">{history.length}</span>{" "}
          • Prescriptions:{" "}
          <span className="font-semibold text-blue-600">
            {totalPrescriptions}
          </span>
        </p>
      </section>

      {/* Appointment History List */}
      <section className="space-y-6">
        {history.length === 0 && (
          <p className="text-center text-gray-400 italic text-lg">
            No past appointments found for this patient.
          </p>
        )}

        {history.map((h) => (
          <article
            key={h.id}
            className="bg-white rounded-3xl shadow-md border border-gray-200 p-6 flex flex-col md:flex-row justify-between gap-6
              hover:shadow-xl transition-shadow duration-300"
          >
            {/* Left info */}
            <div className="flex flex-col flex-grow space-y-3">
              {/* Date & time */}
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium tracking-wide">
                <FaCalendarAlt className="text-blue-500" />
                <time
                  dateTime={h.appointmentDate}
                  className="select-none"
                  title={new Date(h.appointmentDate).toLocaleString()}
                >
                  {new Date(h.appointmentDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
                {h.appointmentTime && (
                  <span className="ml-3 text-gray-400 font-normal">
                    • {h.appointmentTime}
                  </span>
                )}
              </div>

              {/* Doctor Info */}
              <h3 className="text-2xl font-semibold text-gray-800">
                {h.doctorName || "Clinic Doctor"}
              </h3>
              <p className="text-gray-600 font-medium">
                {h.specialization ? `${h.specialization} • ` : ""}
                {h.location || ""}
              </p>

              {/* Diagnosis */}
              <p className="text-gray-700 text-base mt-3 leading-relaxed">
                <span className="font-semibold text-blue-600">Diagnosis: </span>
                {h.prescription?.diagnosis ?? (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </p>
            </div>

            {/* Right side fee & button */}
            <div className="flex flex-col items-end justify-between space-y-4">
              <div className="text-blue-500 font-bold text-lg">
                {h.fee ? `₹ ${h.fee}` : "-"}
              </div>

              <button
                onClick={() => openOrToastPrescription(h.prescription ?? null)}
                className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                  text-white font-semibold rounded-xl shadow-md transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label={`View prescription for appointment on ${h.appointmentDate}`}
              >
                <FaFileMedical className="text-xl" />
                View Prescription
              </button>
            </div>

            {/* Medicines preview */}
            <div className="mt-4 md:mt-6 border-t border-gray-200 pt-4 md:col-span-full">
              {h.prescription?.medicines?.length ? (
                <>
                  <h4 className="font-semibold text-blue-500 mb-2 flex items-center gap-2 text-lg">
                    <FaPills /> Medicines
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm max-w-xl">
                    {h.prescription.medicines!.map((m, idx) => (
                      <li key={idx} className="leading-snug">
                        <span className="font-semibold text-gray-900">
                          {m.medicine}
                        </span>{" "}
                        {m.dosage ? `— ${m.dosage}` : ""}{" "}
                        {m.duration ? `(${m.duration})` : ""}{" "}
                        {m.notes ? `· ${m.notes}` : ""}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="italic text-gray-400 text-sm">
                  No prescription for this visit
                </p>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* Prescription Modal */}
      {openPrescription && selectedPrescription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative">
            <header className="flex justify-between items-center mb-6">
              <h2
                id="modal-title"
                className="text-3xl font-extrabold text-blue-600 tracking-wide"
              >
                Prescription Details
              </h2>
              <button
                onClick={() => setOpenPrescription(false)}
                className="text-gray-400 hover:text-red-600 transition-colors duration-300 text-lg font-semibold"
                aria-label="Close prescription modal"
              >
                ✕
              </button>
            </header>

            <div>
              <PrescriptionView
                patientName={
                  selectedPrescription.patientName ||
                  baseAppointment.patientName
                }
                patientId={selectedPrescription.patientId || baseAppointment.id}
                patientAge={(selectedPrescription as any)?.patientAge || 0}
                patientGender={
                  (selectedPrescription as any)?.patientGender ||
                  baseAppointment.gender ||
                  "N/A"
                }
                medicines={selectedPrescription.medicines || []}
                doctorName={
                  selectedPrescription.doctorName ||
                  baseAppointment.doctorName ||
                  "Clinic Doctor"
                }
                doctorSpecialization={
                  selectedPrescription.doctorSpecialization ||
                  baseAppointment.specialization
                }
                clinicName={selectedPrescription.clinicName || ""}
                clinicAddress={
                  (selectedPrescription as any)?.clinicAddress || ""
                }
                date={
                  selectedPrescription.date || baseAppointment.appointmentDate
                }
                diagnosis={selectedPrescription.diagnosis}
                followUpDate={(selectedPrescription as any)?.followUpDate}
                additionalNotes={selectedPrescription.additionalNotes}
                advice={selectedPrescription.advices || []}
                vitals={(selectedPrescription as any)?.vitals}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
