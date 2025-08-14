"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineClose } from "react-icons/ai";

type EditPrescriptionProps = {
  isOpen: boolean;
  onClose: () => void;
  prescriptionId: string;
  onUpdated: () => void;
};

type FormValues = {
  medicine: string;
  dosage: string;
  duration: string;
  notes: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate: string;
};

export default function EditPrescriptionModal({
  isOpen,
  onClose,
  prescriptionId,
  onUpdated,
}: EditPrescriptionProps) {
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prescriptionId && isOpen) {
      fetchPrescription();
    }
  }, [prescriptionId, isOpen]);

  async function fetchPrescription() {
    try {
      const res = await axios.get(
        `http://localhost:5000/prescriptions/${prescriptionId}`
      );
      reset(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function onSubmit(data: FormValues) {
    setLoading(true);
    try {
      await axios.patch(
        `http://localhost:5000/prescriptions/${prescriptionId}`,
        data
      );
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

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
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
            >
              <AiOutlineClose size={20} />
            </button>

            <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
              Edit Prescription
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  {...register("medicine", { required: true })}
                  placeholder="Medicine Name"
                  className="input-style"
                />
                <input
                  {...register("dosage", { required: true })}
                  placeholder="Dosage"
                  className="input-style"
                />
                <input
                  {...register("duration", { required: true })}
                  placeholder="Duration"
                  className="input-style"
                />
                <input
                  {...register("route")}
                  placeholder="Route (e.g. Oral)"
                  className="input-style"
                />
                <input
                  {...register("frequency")}
                  placeholder="Frequency (e.g. 2 times/day)"
                  className="input-style"
                />
                <input
                  type="date"
                  {...register("startDate")}
                  className="input-style"
                />
                <input
                  type="date"
                  {...register("endDate")}
                  className="input-style"
                />
              </div>

              <textarea
                {...register("notes")}
                placeholder="Notes / Instructions"
                className="input-style h-24 resize-none"
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-semibold shadow-md"
                >
                  {loading ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
