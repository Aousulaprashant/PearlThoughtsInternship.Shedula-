"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import toast from "react-hot-toast";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline, MdOutlineSaveAs } from "react-icons/md";
import { motion } from "framer-motion";

// Adjusted Prescription type
type Prescription = {
  id: string;
  appointmentId: string;
  patientId?: string;
  medicine: string;
  dosage: string;
  duration: string;
  notes: string;
  route?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  date: string;
};

export default function ViewPrescriptions() {
  const { id } = useParams();
  const appointmentId = id;
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [editModes, setEditModes] = useState<Record<string, boolean>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (appointmentId) fetchPrescriptions();
  }, [appointmentId]);

  async function fetchPrescriptions() {
    try {
      const res = await axios.get(`http://localhost:5000/prescriptions`);
      const filtered = res.data.filter(
        (p: Prescription) => p.appointmentId === appointmentId
      );
      setPrescriptions(filtered);
    } catch (err) {
      toast.error("Failed to fetch prescriptions");
    }
  }

  async function handleSave(presc: Prescription) {
    setSavingId(presc.id);
    try {
      await axios.patch(
        `http://localhost:5000/prescriptions/${presc.id}`,
        presc
      );
      toast.success("Prescription updated");
      setEditModes((prev) => ({ ...prev, [presc.id]: false }));
    } catch (err) {
      toast.error("Error updating");
    }
    setSavingId(null);
  }

  async function handleDelete(id: string) {
    const confirmIt = confirm("Are you sure you want to delete?");
    if (!confirmIt) return;

    setDeletingId(id);
    try {
      await axios.delete(`http://localhost:5000/prescriptions/${id}`);
      toast.success("Deleted successfully");
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      toast.error("Error deleting");
    }
    setDeletingId(null);
  }

  const renderField = (
    presc: Prescription,
    key: keyof Prescription,
    label: string,
    isTextarea = false
  ) => {
    const value = presc[key];
    const isEditing = editModes[presc.id];

    return (
      <div className="flex flex-col gap-1">
        <label className="text-gray-600 font-medium">{label}</label>
        {isEditing ? (
          <motion.div
            key={key as string}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {isTextarea ? (
              <textarea
                value={value || ""}
                onChange={(e) =>
                  setPrescriptions((prev) =>
                    prev.map((p) =>
                      p.id === presc.id ? { ...p, [key]: e.target.value } : p
                    )
                  )
                }
                className="border px-3 py-2 rounded-md resize-none w-full bg-white"
                rows={4}
              />
            ) : (
              <input
                value={value || ""}
                onChange={(e) =>
                  setPrescriptions((prev) =>
                    prev.map((p) =>
                      p.id === presc.id ? { ...p, [key]: e.target.value } : p
                    )
                  )
                }
                className="border px-3 py-2 rounded-md w-full bg-white"
              />
            )}
          </motion.div>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-gray-800">{value || "-"}</p>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ rotate: 10 }}
              onClick={() =>
                setEditModes((prev) => ({
                  ...prev,
                  [presc.id]: !prev[presc.id],
                }))
              }
              className="text-blue-500 hover:text-blue-700"
            >
              <FiEdit2 size={18} />
            </motion.button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-white text-gray-800 p-10">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Prescriptions</h1>

      {prescriptions.length === 0 ? (
        <p>No prescriptions found for this appointment.</p>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {prescriptions.map((presc) => (
            <div
              key={presc.id}
              className="border rounded-md p-6 shadow-md bg-gray-50"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Patient ID:</span>{" "}
                    {presc.patientId || "-"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Created on:</span>{" "}
                    {moment(presc.date).format("DD MMM YYYY")}
                  </p>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleSave(presc)}
                    disabled={savingId === presc.id}
                    className="flex items-center gap-2 px-4 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 transition text-sm"
                  >
                    <MdOutlineSaveAs />
                    {savingId === presc.id ? "Saving..." : "Save"}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleDelete(presc.id)}
                    disabled={deletingId === presc.id}
                    className="flex items-center gap-2 px-4 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition text-sm"
                  >
                    <MdDeleteOutline />
                    {deletingId === presc.id ? "Deleting..." : "Delete"}
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField(presc, "medicine", "Medicine")}
                {renderField(presc, "dosage", "Dosage")}
                {renderField(presc, "duration", "Duration")}
                {renderField(presc, "route", "Route")}
                {renderField(presc, "frequency", "Frequency")}
                {renderField(presc, "startDate", "Start Date")}
                {renderField(presc, "endDate", "End Date")}
                {renderField(presc, "notes", "Notes", true)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
