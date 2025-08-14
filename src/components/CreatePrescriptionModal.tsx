"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";
import {
  FaPills,
  FaCalendarAlt,
  FaNotesMedical,
  FaUser,
  FaPhoneAlt,
  FaAddressCard,
} from "react-icons/fa";
import { MdMedicalServices, MdBadge, MdNumbers } from "react-icons/md";
import toast from "react-hot-toast";

type CreatePrescriptionProps = {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  patientId: string;
  onCreated: () => void;
};

type MedicineEntry = {
  medicine: string;
  dosage: string;
  duration: string;
  notes: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate: string;
  specialInstructions: string;
  refills: string;
};

type PrescriptionData = {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAge?: string;
  patientGender?: string;
  patientContact?: string;
  patientAddress?: string;
  patientAllergies?: string;
  patientWeight?: string;
  patientHeight?: string;
  doctorName: string;
  doctorQualification?: string;
  doctorLicenseNo?: string;
  doctorSpecialization: string;
  doctorContact?: string;
  clinicName: string;
  clinicAddress?: string;
  date: string;
  diagnosis?: string;
  followUpDate?: string;
  additionalNotes?: string;
  advice?: string;
  vitals?: any;
  medicines: MedicineEntry[];
  uniquePrescriptionId: string;
  qrCode?: string;
};

export default function CreatePrescriptionModal({
  isOpen,
  onClose,
  appointmentId,
  patientId,
  onCreated,
}: CreatePrescriptionProps) {
  const { register, handleSubmit, reset } = useForm<MedicineEntry>();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: MedicineEntry) {
    setLoading(true);
    try {
      // Step 1: Get appointment details
      const appointmentRes = await axios.get(
        `http://localhost:5000/appointments/${appointmentId}`
      );
      const appointment = appointmentRes.data;

      // Step 2: Check for existing prescription
      const res = await axios.get(
        `http://localhost:5000/prescriptions?appointmentId=${appointmentId}`
      );

      if (res.data.length > 0) {
        // Update existing
        const existing = res.data[0];
        const updatedMedicines = [...(existing.medicines || []), data];
        await axios.patch(
          `http://localhost:5000/prescriptions/${existing.id}`,
          {
            ...existing,
            medicines: updatedMedicines,
          }
        );
      } else {
        // Step 3: Create new with full legal fields
        const newPrescription: PrescriptionData = {
          appointmentId,
          patientId: appointment.patientId || patientId,
          patientName: appointment.patientName,
          patientAge: appointment.patientAge || "",
          patientGender: appointment.gender || "",
          patientContact: appointment.phoneNumber || "",
          patientAddress: appointment.patientAddress || "",
          patientAllergies: appointment.allergies || "",
          patientWeight: appointment.patientWeight || "",
          patientHeight: appointment.patientHeight || "",
          doctorName: appointment.doctorName,
          doctorQualification: appointment.doctorQualification || "MBBS",
          doctorLicenseNo: appointment.doctorLicenseNo || "LIC-0001",
          doctorSpecialization: appointment.specialization,
          doctorContact: appointment.phone || "",
          clinicName: appointment.clinicName || appointment.location,
          clinicAddress: appointment.clinicAddress || "",
          date: new Date().toISOString().split("T")[0],
          diagnosis: appointment.diagnosis || "",
          followUpDate: appointment.followUpDate || "",
          additionalNotes: appointment.additionalNotes || "",
          advice: appointment.advice || "",
          vitals: appointment.vitals || {},
          medicines: [data],
          uniquePrescriptionId: `RX-${Date.now()}`,
          qrCode: "", // can generate QR later
        };

        await axios.post(
          "http://localhost:5000/prescriptions",
          newPrescription
        );
      }

      onCreated();
      toast.success("Prescription created successfully!");
      reset();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("Failed to create prescription");
    }
    setLoading(false);
  }

  const InputField = ({
    icon: Icon,
    placeholder,
    name,
    type = "text",
    required = false,
  }: {
    icon: React.ElementType;
    placeholder: string;
    name: keyof MedicineEntry;
    type?: string;
    required?: boolean;
  }) => (
    <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
      <Icon className="text-blue-600 mr-2" size={20} />
      <input
        type={type}
        {...register(name, required ? { required: true } : {})}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
      />
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 relative"
          >
            <button
              onClick={() => {
                reset();
                onClose();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
            >
              <AiOutlineClose size={20} />
            </button>

            <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
              Create Prescription
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  icon={FaPills}
                  placeholder="Medicine Name"
                  name="medicine"
                  required
                />
                <InputField
                  icon={MdMedicalServices}
                  placeholder="Dosage"
                  name="dosage"
                  required
                />
                <InputField
                  icon={FaNotesMedical}
                  placeholder="Duration"
                  name="duration"
                  required
                />
                <InputField
                  icon={MdMedicalServices}
                  placeholder="Route (e.g. Oral)"
                  name="route"
                />
                <InputField
                  icon={FaNotesMedical}
                  placeholder="Frequency (e.g. 2 times/day)"
                  name="frequency"
                />
                <InputField
                  icon={FaCalendarAlt}
                  type="date"
                  placeholder="Start Date"
                  name="startDate"
                />
                <InputField
                  icon={FaCalendarAlt}
                  type="date"
                  placeholder="End Date"
                  name="endDate"
                />
                <InputField
                  icon={FaNotesMedical}
                  placeholder="Special Instructions"
                  name="specialInstructions"
                />
                <InputField
                  icon={MdNumbers}
                  placeholder="Refills Allowed"
                  name="refills"
                />
              </div>

              <div className="flex items-start border rounded-lg px-3 py-2 shadow-sm bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
                <FaNotesMedical className="text-blue-600 mr-2 mt-1" size={20} />
                <textarea
                  {...register("notes")}
                  placeholder="Notes / Additional Instructions"
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 h-24 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    onClose();
                  }}
                  className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-semibold shadow-md"
                >
                  {loading ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
