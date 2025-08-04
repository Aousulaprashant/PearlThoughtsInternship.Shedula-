"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utiles/axiosInstance";
import { useUser } from "@/context/UseContext-login";
import toast, { Toaster } from "react-hot-toast";
import AppointmentCardDoctor from "@/components/Doc-AppointmentConform";
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
  doctorName: string;
};

const SECTIONS = ["Pending", "Confirmed", "Rescheduled", "Cancelled"];

export default function DoctorAppointments() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("Pending");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!user || !user.name) return;

    const fetchAppointments = async () => {
      try {
        const res = await axiosInstance.get("/appointments");
        const allAppointments: Appointment[] = res.data;

        const doctorAppointments = allAppointments.filter(
          (appt) => appt.doctorName?.toLowerCase() === user.name.toLowerCase()
        );

        setAppointments(doctorAppointments);
      } catch (err) {
        console.error("Error fetching appointments", err);
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleCancel = async (id: string) => {
    try {
      const apptToUpdate = appointments.find((appt) => appt.id === id);
      if (!apptToUpdate) return;

      const updated = {
        ...apptToUpdate,
        status: "cancelled",
        cancelledBy: "doctor",
      };

      await axiosInstance.put(`/appointments/${id}`, updated);

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? updated : appt))
      );

      toast.success("Appointment cancelled");
    } catch (err) {
      toast.error("Failed to cancel");
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      const apptToUpdate = appointments.find((appt) => appt.id === id);
      if (!apptToUpdate) return;

      const updated = { ...apptToUpdate, status: "confirmed" };

      await axiosInstance.put(`/appointments/${id}`, updated);

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? updated : appt))
      );

      toast.success("Appointment confirmed");
    } catch (err) {
      toast.error("Failed to confirm");
    }
  };

  const handleReschedule = (appt: Appointment) => {
    setSelectedAppt(appt);
  };

  const handleRescheduleSubmit = async (newDate: string, newTime: string) => {
    if (!selectedAppt) return;

    try {
      const updated = {
        ...selectedAppt,
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: "rescheduled",
      };

      await axiosInstance.put(`/appointments/${selectedAppt.id}`, updated);

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === selectedAppt.id ? updated : appt))
      );

      toast.success("Appointment rescheduled");
    } catch (err) {
      toast.error("Failed to reschedule");
    } finally {
      setSelectedAppt(null);
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    const status = appt.status?.toLowerCase();
    if (activeSection === "Pending") return status === "booked";
    if (activeSection === "Confirmed") return status === "confirmed";
    if (activeSection === "Rescheduled") return status === "rescheduled";
    if (activeSection === "Cancelled") return status === "cancelled";
    return false;
  });

  if (!user || loading) return <p className="p-4">Loading appointments...</p>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <Toaster />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Patient Appointments
        </h2>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {SECTIONS.map((section) => (
            <button
              key={section}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                activeSection === section
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-700 border-gray-300 hover:bg-blue-100 hover:border-blue-400"
              }`}
              onClick={() => setActiveSection(section)}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Appointments */}
        {filteredAppointments.length === 0 ? (
          <p className="text-gray-600">No appointments in this section.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredAppointments.map((appt) => (
              <AppointmentCardDoctor
                key={appt.id}
                href={``}
                appointment={appt}
                onConfirm={() => handleConfirm(appt.id)}
                onReschedule={() => handleReschedule(appt)}
                onCancel={() => handleCancel(appt.id)}
              />
            ))}
          </div>
        )}

        {/* Reschedule Modal */}
        {selectedAppt && (
          <RescheduleModal
            appointment={selectedAppt}
            onClose={() => setSelectedAppt(null)}
            onSubmit={handleRescheduleSubmit}
          />
        )}
      </div>
    </div>
  );
}
