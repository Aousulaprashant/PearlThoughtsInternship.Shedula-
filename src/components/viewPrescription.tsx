"use client";

import { motion } from "framer-motion";
import {
  FaPills,
  FaUserMd,
  FaCalendarAlt,
  FaNotesMedical,
  FaEye,
  FaDownload,
  FaEyeSlash,
} from "react-icons/fa";
import { MdMedicalServices, MdAssignment, MdFavorite } from "react-icons/md";
import { GiStethoscope, GiHeartBeats } from "react-icons/gi";
import PrintPrescription, {
  PrintPrescriptionHandle,
} from "./printPriscription";
import { useEffect, useRef, useState } from "react";
import { useUser } from "@/context/UseContext-login";
import axiosInstance from "@/utiles/axiosInstance";

interface Medicine {
  medicine: any;
  dosage: string;
  duration: string;
  route?: string;
  frequency?: string;
  notes?: string;
}

interface VitalSigns {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
}

interface PrescriptionViewProps {
  patientName: string;
  patientId: string;
  patientAge: number; // Added
  patientGender: string; // Added
  medicines: Medicine[];
  doctorName: string;
  doctorSpecialization?: string;
  clinicName?: string;
  clinicAddress: string; // Added
  date: string;
  diagnosis?: string;
  followUpDate?: string;
  additionalNotes?: string;
  advice?: string[];
  vitals?: VitalSigns;
}

export default function PrescriptionView({
  patientName,
  patientId,
  patientAge,
  patientGender,
  medicines,
  doctorName,
  doctorSpecialization,
  clinicName,
  clinicAddress,
  date,
  diagnosis,
  followUpDate,
  additionalNotes,
  advice,
  vitals,
}: PrescriptionViewProps) {
  const printRef = useRef<PrintPrescriptionHandle>(null);
  const handlePrint = () => {
    printRef.current?.print();
  };

  const { user } = useUser();
  const [preview, setpreview] = useState(false);
  const [docsignature, setdocsignature] = useState<string>("");

  useEffect(() => {
    const getSignatureUrl = async () => {
      try {
        const res = await axiosInstance.get(`/doctors?id=${user?.id}`);
        console.log("Response data:", res.data);
        if (res.data && res.data.length > 0) {
          setdocsignature(res.data[0].digitalSignature);
        } else {
          console.error("Doctor not found or data is empty");
        }
      } catch (error) {
        console.error("Error fetching signature:", error);
      }
    };

    getSignatureUrl();
  }, [doctorName]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-xl shadow-xl rounded-2xl border border-gray-200 p-8 w-full max-w-4xl"
    >
      <div id="prescription-content">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5 mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaUserMd className="text-blue-600 text-xl" /> {user?.name}
            </h2>
            {doctorSpecialization && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <GiStethoscope className="text-green-500" />{" "}
                {doctorSpecialization}
              </p>
            )}
            {clinicName && (
              <p className="text-xs text-gray-500">{clinicName}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-800">{patientName}</p>
            <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
              ID: {patientId}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="mb-6 flex items-center text-sm text-gray-500 gap-2">
          <FaCalendarAlt className="text-purple-500" />
          <span className="font-medium">
            {new Date(date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Vital Signs */}
        {vitals &&
          (vitals.bloodPressure || vitals.heartRate || vitals.temperature) && (
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <GiHeartBeats className="text-red-500" /> Vital Signs
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                {vitals.bloodPressure && <p>BP: {vitals.bloodPressure}</p>}
                {vitals.heartRate && <p>HR: {vitals.heartRate} bpm</p>}
                {vitals.temperature && <p>Temp: {vitals.temperature}°C</p>}
              </div>
            </div>
          )}

        {/* Medicines */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700">
                <th className="px-4 py-3 text-left">Medicine</th>
                <th className="px-4 py-3 text-left">Dosage</th>
                <th className="px-4 py-3 text-left">Duration</th>
                <th className="px-4 py-3 text-left">Route</th>
                <th className="px-4 py-3 text-left">Frequency</th>
                <th className="px-4 py-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {medicines.length > 0 ? (
                medicines.map((med, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-blue-50/50"
                    } hover:bg-blue-100/60 transition`}
                  >
                    <td className="px-4 py-3 flex items-center gap-2 font-medium">
                      <FaPills className="text-blue-500" /> {med.medicine}
                    </td>
                    <td className="px-4 py-3">{med.dosage}</td>
                    <td className="px-4 py-3">{med.duration}</td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                        {med.route || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{med.frequency || "—"}</td>
                    <td className="px-4 py-3">{med.notes || "—"}</td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No medicines prescribed
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Additional Info */}
        {(diagnosis || additionalNotes || followUpDate) && (
          <div className="mt-6 space-y-3">
            {diagnosis && (
              <div className="flex items-start gap-2">
                <MdAssignment className="text-red-500 mt-0.5" />
                <p className="text-gray-700">
                  <span className="font-semibold">Diagnosis:</span> {diagnosis}
                </p>
              </div>
            )}
            {additionalNotes && (
              <div className="flex items-start gap-2">
                <FaNotesMedical className="text-green-500 mt-0.5" />
                <p className="text-gray-700">
                  <span className="font-semibold">Notes:</span>{" "}
                  {additionalNotes}
                </p>
              </div>
            )}
            {followUpDate && (
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-purple-500" />
                <p className="text-gray-700">
                  <span className="font-semibold">Follow-up:</span>{" "}
                  {new Date(followUpDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Advice
        {advice && advice.length > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2 mb-2">
              <MdFavorite className="text-green-600" /> Doctor's Advice
            </h3>
            <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1">
              {advice.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )} */}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          <FaEye /> Print
        </button>
        <button
          onClick={() => setpreview(!preview)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          {preview ? (
            <>
              <FaEyeSlash /> Close
            </>
          ) : (
            <>
              <FaEye /> View
            </>
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500 italic">
        ⚕ This prescription is part of the patient's official medical record.
        Please follow the directions provided by your healthcare provider.
      </div>
      {preview && (
        <PrintPrescription
          ref={printRef}
          patientName={patientName}
          patientId={patientId}
          patientAge={patientAge || 30} // fallback
          patientGender={patientGender || "Male"} // fallback
          medicines={medicines}
          doctorName={doctorName}
          specialization={doctorSpecialization || ""}
          clinicName={clinicName || ""}
          clinicAddress={clinicAddress || "123 Default Street, City"} // fallback
          date={date}
          docsignature={docsignature}
          // advice={advice || []}
        />
      )}
    </motion.div>
  );
}
