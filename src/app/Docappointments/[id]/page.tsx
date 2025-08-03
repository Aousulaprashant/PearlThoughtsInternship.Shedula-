"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@/context/UseContext-login";
import toast from "react-hot-toast";
import RescheduleModal from "@/components/RescheduleModal";
import Sidebar from "@/components/DoctorSlideBar";

type Appointment = {
  id: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  fee: string;
  status: string;
  patientId: string;
};

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const { user } = useUser();
  const router = useRouter();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAppointment = async () => {
      try {
        const res = await axios.get("http://localhost:5000/appointments");
        const all: Appointment[] = res.data;
        const target = all.find((a) => a.id === id);

        if (!target) throw new Error("Not found");

        setAppointment(target);
      } catch (err) {
        toast.error("Appointment not found");
        router.push("/Docappointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, router]);

  const handleStatusChange = async (status: string, updatedFields = {}) => {
    if (!appointment) return;

    const updated = { ...appointment, status, ...updatedFields };

    try {
      await axios.put(
        `http://localhost:5000/appointments/${appointment.id}`,
        updated
      );
      setAppointment(updated);
      toast.success(`Appointment ${status}`);
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleRescheduleSubmit = async (date: string, time: string) => {
    handleStatusChange("rescheduled", {
      appointmentDate: date,
      appointmentTime: time,
    });
    setRescheduleOpen(false);
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!appointment) return <p className="p-4">Appointment not found.</p>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 flex flex-col gap-4 w-full">
        <h2 className="text-2xl font-bold">Appointment Detail</h2>
        <div className="bg-white shadow rounded p-4 space-y-2 border w-full max-w-xl">
          <p>
            <strong>Patient:</strong> {appointment.patientName}
          </p>
          <p>
            <strong>Date:</strong> {appointment.appointmentDate}
          </p>
          <p>
            <strong>Time:</strong> {appointment.appointmentTime}
          </p>
          <p>
            <strong>Location:</strong> {appointment.location}
          </p>
          <p>
            <strong>Status:</strong> {appointment.status}
          </p>
          <p>
            <strong>Fee:</strong> ₹{appointment.fee}
          </p>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => handleStatusChange("confirmed")}
          >
            Confirm
          </button>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded"
            onClick={() => setRescheduleOpen(true)}
          >
            Reschedule
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() =>
              handleStatusChange("cancelled", { cancelledBy: "doctor" })
            }
          >
            Cancel
          </button>
        </div>

        {rescheduleOpen && (
          <RescheduleModal
            appointment={appointment}
            onClose={() => setRescheduleOpen(false)}
            onSubmit={handleRescheduleSubmit}
          />
        )}
      </div>
    </div>
  );
}
