"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@/utiles/axiosInstance";
import { useUser } from "@/context/UseContext-login";
import toast from "react-hot-toast";
import RescheduleModal from "@/components/RescheduleModal";
import Sidebar from "@/components/DoctorSlideBar";
import {
  CalendarDays,
  Clock,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle,
  RefreshCcw,
  X,
  Check,
} from "lucide-react";
import CreatePrescriptionModal from "@/components/CreatePrescriptionModal";

type Appointment = {
  id: string;
  patientName: string;
  phoneNumber: string;
  gender: string;
  HeathStatus: string;
  paymentMethod: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  doctorImage: string;
  specialization: string;
  fee: string;
  location: string;
  phone: string;
  status: string;
  rating: string;
  reviews: string;
  appointmentDate: string;
  appointmentTime: string;
  isCompleted: boolean;
};

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [editingHealth, setEditingHealth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState("");
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (!id) return;

    fetchAppointment();
  }, [id, router]);

  const fetchAppointment = async () => {
    try {
      const res = await axiosInstance.get("/appointments");
      const all: Appointment[] = res.data;
      const target = all.find((a) => a.id === id);

      if (!target) throw new Error("Not found");

      setAppointment(target);
      setHealthStatus(target.HeathStatus || "");
    } catch (err) {
      toast.error("Appointment not found");
      router.push("/Docappointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string, updatedFields = {}) => {
    if (!appointment) return;

    const updated = { ...appointment, status, ...updatedFields };

    try {
      await axiosInstance.put(`/appointments/${appointment.id}`, updated);
      setAppointment(updated);
      toast.success(`Appointment ${status}`);
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const toggleCompletion = async () => {
    if (!appointment) return;
    const updated = { ...appointment, isCompleted: !appointment.isCompleted };

    try {
      await axiosInstance.put(`/appointments/${appointment.id}`, updated);
      setAppointment(updated);
      toast.success(
        `Marked as ${updated.isCompleted ? "Completed" : "Not Completed"}`
      );
    } catch (err) {
      toast.error("Failed to update completion status");
    }
  };

  const handleRescheduleSubmit = async (date: string, time: string) => {
    handleStatusChange("rescheduled", {
      appointmentDate: date,
      appointmentTime: time,
    });
    setRescheduleOpen(false);
  };

  const handleHealthStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;
    setHealthStatus(newStatus);

    if (!appointment) return;

    try {
      const updated = { ...appointment, HeathStatus: newStatus };
      await axiosInstance.put(`/appointments/${appointment.id}`, updated);
      setAppointment(updated);
      toast.success("Health status updated");
    } catch (err) {
      toast.error("Failed to update health status");
    }
  };

  if (loading)
    return (
      <p className="p-6 text-blue-600 font-medium animate-pulse">Loading...</p>
    );

  if (!appointment)
    return (
      <p className="p-6 text-red-600 font-medium">Appointment not found.</p>
    );

  return (
    <div className="flex min-h-screen bg-gradient-to-tr from-indigo-50 to-white">
      <Sidebar />
      <div className="p-8 w-full max-w-6xl mx-auto animate-fade-in">
        <h1 className="text-4xl font-bold text-indigo-700 mb-8 border-b pb-4 tracking-wide">
          🩺 Appointment Overview
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Appointment Info */}
          <div className="rounded-xl p-6 shadow-xl border bg-white hover:shadow-2xl transition duration-300">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" />
              Appointment Info
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-2">
                <CalendarDays size={18} />
                <b>Date:</b> {appointment.appointmentDate}
              </li>
              <li className="flex items-center gap-2">
                <Clock size={18} />
                <b>Time:</b> {appointment.appointmentTime}
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={18} />
                <b>Location:</b> {appointment.location}
              </li>
              <li className="flex items-center gap-2">
                <IndianRupee size={18} />
                <b>Fee:</b> {appointment.fee}
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={18} />
                <b>Status:</b>{" "}
                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm">
                  {appointment.status}
                </span>
              </li>
              {appointment.isCompleted && (
                <li className="text-green-600 font-medium flex items-center gap-2 mt-2">
                  <CheckCircle size={18} /> Marked as Completed
                </li>
              )}
            </ul>
          </div>

          {/* Patient Info */}
          <div className="rounded-xl p-6 shadow-xl border bg-white hover:shadow-2xl transition duration-300">
            <h2 className="text-2xl font-semibold text-green-700 mb-4">
              Patient Info
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li>
                <b>Name:</b> {appointment.patientName}
              </li>
              <li>
                <b>Gender:</b> {appointment.gender}
              </li>
              <li>
                <b>Phone:</b> {appointment.phoneNumber}
              </li>
              <li>
                <b>Payment:</b> {appointment.paymentMethod}
              </li>
              {appointment.paymentMethod !== "Cash" && (
                <>
                  <li>
                    <b>Card #:</b> {appointment.cardNumber}
                  </li>
                  <li>
                    <b>Expiry:</b> {appointment.expiry}
                  </li>
                </>
              )}
            </ul>

            {/* Health Status */}
            <div className="mt-6 flex gap-3">
              <label className="block font-semibold text-gray-800 mb-1">
                Health Status
              </label>
              {!editingHealth ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 font-medium">
                    {healthStatus || "Not Set"}
                  </span>
                  <button
                    onClick={() => setEditingHealth(true)}
                    className="bg-indigo-100 text-indigo-700 p-1 rounded hover:bg-indigo-200"
                  >
                    <Check size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <select
                    value={healthStatus}
                    onChange={handleHealthStatusChange}
                    className="border px-3 py-2 rounded bg-gray-50"
                  >
                    <option value="">Select Status</option>
                    <option value="Stable">Stable</option>
                    <option value="Mild">Mild</option>
                    <option value="Critical">Critical</option>
                  </select>
                  <button
                    onClick={() => setEditingHealth(false)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conditional Action Buttons */}
        <div className="mt-12 flex flex-wrap gap-5">
          {appointment.isCompleted ? (
            <>
              <button
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow flex items-center gap-2"
                onClick={() => handleOpenModal()}
              >
                <ShieldCheck size={18} />
                Add Prescription
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 shadow flex items-center gap-2"
                onClick={toggleCompletion}
              >
                <X size={18} />
                Mark as Not Completed
              </button>

              <CreatePrescriptionModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                appointmentId={appointment.id}
                patientId={appointment.patientId}
                onCreated={() => {}}
              />
            </>
          ) : (
            <>
              <button
                className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 shadow flex items-center gap-2"
                onClick={() => handleStatusChange("confirmed")}
              >
                <CheckCircle size={18} />
                Confirm
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 shadow flex items-center gap-2"
                onClick={() => setRescheduleOpen(true)}
              >
                <RefreshCcw size={18} />
                Reschedule
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow flex items-center gap-2"
                onClick={() =>
                  handleStatusChange("cancelled", { cancelledBy: "doctor" })
                }
              >
                <X size={18} />
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow flex items-center gap-2"
                onClick={toggleCompletion}
              >
                <Check size={18} />
                Mark as Completed
              </button>
            </>
          )}
        </div>

        {rescheduleOpen && (
          <RescheduleModal
            appointment={appointment}
            onClose={() => setRescheduleOpen(false)}
            onSubmit={() => alert("created")}
          />
        )}
      </div>
    </div>
  );
}
