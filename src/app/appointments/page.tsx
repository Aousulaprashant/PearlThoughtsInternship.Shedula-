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
  doctorId: string;
  patientId: string;
  profileImage: string;
  status: string;
  specialization: string;
  isCompleted: boolean;
};

const SECTIONS = ["Pending", "Confirmed", "Rescheduled", "Cancelled"];

export default function AppointmentsPage() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("Pending");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [completedSearch, setCompletedSearch] = useState("");

  useEffect(() => {
    if (!user?.name) return;

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
        toast.error("Failed to load appointments");
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

  // Separate completed appointments
  const completedAppointments = appointments.filter((appt) => appt.isCompleted);
  const filteredCompletedAppointments = completedAppointments.filter((appt) =>
    appt.doctorName.toLowerCase().includes(completedSearch.toLowerCase())
  );

  // Filter for section tabs
  const filteredAppointments = appointments.filter((appt) => {
    const status = appt?.status?.toLowerCase();
    if (appt.isCompleted) return false;
    if (activeSection === "Pending") return status === "booked";
    if (activeSection === "Confirmed") return status === "confirmed";
    if (activeSection === "Rescheduled") return status === "rescheduled";
    if (activeSection === "Cancelled") return status === "cancelled";
    return false;
  });

  if (loading) return <p className="p-4">Loading appointments...</p>;

  return (
    <div className="p-6">
      <Toaster />
      <h2 className="text-2xl font-bold mb-6">My Appointments</h2>

      {/* Completed Appointments Section */}
      {completedAppointments.length > 0 && (
        <div className="mb-10 bg-blue-50 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-800 border-l-4 border-blue-500 pl-3">
              Completed Appointments
            </h3>
            <input
              type="text"
              placeholder="Search by doctor..."
              value={completedSearch}
              onChange={(e) => setCompletedSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {filteredCompletedAppointments.length > 0 ? (
              filteredCompletedAppointments.map((appt) => (
                <div key={appt.id} className="flex-shrink-0 w-80">
                  <AppointmentCard
                    appointment={appt}
                    onReschedule={() => handleReschedule(appt)}
                    onCancel={() => handleCancel(appt.id)}
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">No matches found.</p>
            )}
          </div>
        </div>
      )}

      {/* Active Section Tabs */}
      <div className="mb-10 bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
        <div className="flex gap-2 flex-wrap mb-4">
          {SECTIONS.map((section) => (
            <button
              key={section}
              className={`px-5 py-2 rounded-full border text-sm font-medium transition-all shadow-sm ${
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

        <h3 className="text-xl font-semibold text-blue-800 border-l-4 border-blue-500 pl-3 mb-4">
          {activeSection} Appointments
        </h3>

        {filteredAppointments.length === 0 ? (
          <p className="text-gray-500 italic">
            No appointments in this section.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
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
      </div>

      {/* Reschedule Modal */}
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
