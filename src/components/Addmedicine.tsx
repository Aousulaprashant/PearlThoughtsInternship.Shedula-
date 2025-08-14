"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPills,
  FaSyringe,
  FaRegClock,
  FaRoute,
  FaCalendarAlt,
  FaStickyNote,
} from "react-icons/fa";

type Medicine = {
  medicine: string;
  dosage: string;
  duration: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
};

interface AddMedicineFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Medicine) => void;
}

export default function AddMedicineForm({
  isOpen,
  onClose,
  onSave,
}: AddMedicineFormProps) {
  const [formData, setFormData] = useState<Medicine>({
    medicine: "",
    dosage: "",
    duration: "",
    route: "",
    frequency: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.medicine.trim()) {
      alert("Medicine name is required");
      return;
    }
    onSave(formData);
    onClose();
    setFormData({
      medicine: "",
      dosage: "",
      duration: "",
      route: "",
      frequency: "",
      startDate: "",
      endDate: "",
      notes: "",
    });
  };

  const Field = ({
    icon,
    children,
  }: {
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-500 bg-white shadow-sm">
      <span className="text-blue-500 mr-3">{icon}</span>
      {children}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg space-y-5 border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
              <FaPills className="text-blue-500" /> Add New Medicine
            </h2>

            {/* Form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field icon={<FaPills />}>
                <input
                  type="text"
                  name="medicine"
                  placeholder="Medicine Name"
                  value={formData.medicine}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                />
              </Field>
              <Field icon={<FaSyringe />}>
                <input
                  type="text"
                  name="dosage"
                  placeholder="Dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                />
              </Field>
              <Field icon={<FaRegClock />}>
                <input
                  type="text"
                  name="duration"
                  placeholder="Duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                />
              </Field>
              <Field icon={<FaRoute />}>
                <input
                  type="text"
                  name="route"
                  placeholder="Route (e.g., Oral)"
                  value={formData.route}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                />
              </Field>
              <Field icon={<FaRegClock />}>
                <input
                  type="text"
                  name="frequency"
                  placeholder="Frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                />
              </Field>
              <Field icon={<FaCalendarAlt />}>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                />
              </Field>
              <Field icon={<FaCalendarAlt />}>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                />
              </Field>
            </div>

            {/* Notes */}
            <Field icon={<FaStickyNote />}>
              <textarea
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full outline-none bg-transparent resize-none"
                rows={3}
              />
            </Field>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow"
              >
                Save Medicine
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
