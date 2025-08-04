"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utiles/axiosInstance";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/context/UseContext-login";
import AppointmentCard from "@/components/AppointmentCardPatiant";
import RescheduleModal from "@/components/RescheduleModal";

type Appointment = {
  id: string;
  userId?: string;
  patientName?: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  fee: string;
  patientId: string;
  doctorImage: string;
  specialization: string;
};

const SECTIONS = ["Pending", "Confirmed", "Rescheduled", "Cancelled"];

export default function AppointmentsPage() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("Pending");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!user?.id && !user?.name) return;

    const fetchAppointments = async () => {
      try {
        const res = await axiosInstance.get("/appointments");
        const allAppointments: Appointment[] = res.data;

        const userAppointments = allAppointments.filter(
          (appt) =>
            appt.patientId === user.id ||
            appt.patientName?.toLowerCase() === user.name?.toLowerCase()
        );

        setAppointments(userAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const handleCancel = async (id: string) => {
    try {
      await axiosInstance.delete(`/appointments/${id}`);
      setAppointments((prev) => prev.filter((appt) => appt.id !== id));
      toast.success("Appointment cancelled");
    } catch (err) {
      toast.error("Failed to cancel appointment");
    }
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppt(appointment);
  };

  const handleRescheduleSubmit = async (newDate: string, newTime: string) => {
    if (!selectedAppt) return;

    try {
      const updated = {
        ...selectedAppt,
        appointmentDate: newDate,
        appointmentTime: newTime,
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
    const status = appt?.status?.toLowerCase();

    if (activeSection === "Pending") {
      return status === "booked";
    } else if (activeSection === "Confirmed") {
      return status === "confirmed";
    } else if (activeSection === "Rescheduled") {
      return status === "rescheduled";
    } else if (activeSection === "cancelled") {
      return status === "cancelled";
    }
    return false;
  });

  if (loading) return <p className="p-4">Loading appointments...</p>;

  return (
    <div className="p-6">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">My Appointments</h2>

      <div className="flex gap-2 mb-6 flex-wrap">
        {SECTIONS.map((section) => (
          <button
            key={section}
            className={`px-4 py-2 rounded-full border text-sm font-medium ${
              activeSection === section
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-700 border-gray-300"
            } hover:bg-blue-500 hover:text-white transition`}
            onClick={() => setActiveSection(section)}
          >
            {section}
          </button>
        ))}
      </div>

      {filteredAppointments.length === 0 ? (
        <p className="text-gray-600">No appointments in this section.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAppointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onReschedule={() => handleReschedule(appt)}
              onCancel={() => handleCancel(appt.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedAppt && (
        <RescheduleModal
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onSubmit={handleRescheduleSubmit}
        />
      )}
    </div>
  );
}
