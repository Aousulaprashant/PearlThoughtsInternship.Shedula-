"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utiles/axiosInstance";
import { useUser } from "@/context/UseContext-login";
import toast, { Toaster } from "react-hot-toast";
import AppointmentCardDoctor from "@/components/Doc-AppointmentConform";
import RescheduleModal from "@/components/RescheduleModal";
import Sidebar from "@/components/DoctorSlideBar";
import { useRouter } from "next/navigation";
import CreatePrescriptionModal from "@/components/CreatePrescriptionModal";

type Appointment = {
  id: string;
  doctorId: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  fee: string;
  status: string;
  patientId: string;
  doctorName: string;
  iscompleted: boolean;
};

type Prescription = {
  id: string;
  appointmentId: string;
  patientId: string;
  medicines?: any[];
};

const SECTIONS = [
  "Pending",
  "Confirmed",
  "Rescheduled",
  "Cancelled",
  "Completed",
];

export default function DoctorAppointments() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleopen, setRescheduleOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Pending");
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [completedSearch, setCompletedSearch] = useState("");
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Check if appointment has prescription
  const handleCloseModal = () => setIsModalOpen(false);
  const router = useRouter();

  const hasPrescription = (appointmentId: string) => {
    return prescriptions.some((p) => p.appointmentId === appointmentId);
  };

  useEffect(() => {
    if (!user || !user.id) return;

    const fetchData = async () => {
      try {
        // Fetch appointments and prescriptions in parallel
        const [apptRes, prescRes] = await Promise.all([
          axiosInstance.get("/appointments"),
          axiosInstance.get("/prescriptions"),
        ]);

        const doctorAppointments = apptRes.data.filter(
          (appt: Appointment) => appt.doctorId === user.id
        );

        setAppointments(doctorAppointments);
        setPrescriptions(prescRes.data);
      } catch (err) {
        console.error("Error fetching data", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    setRescheduleOpen(true);
    setSelectedAppt(appt);
  };

  const handleComplete = async (id: string) => {
    try {
      const apptToUpdate = appointments.find((appt) => appt.id === id);
      if (!apptToUpdate) return;

      const updated = { ...apptToUpdate, iscompleted: true };
      await axiosInstance.put(`/appointments/${id}`, updated);

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? updated : appt))
      );
      toast.success("Marked as completed");
    } catch (err) {
      toast.error("Failed to mark as completed");
    }
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

  const handleViewPrescription = (appt: Appointment) => {
    console.log("View Prescription for", appt.id);
    router.push(`/patients/${appt.patientName}`);
  };

  const handleAddPrescription = (appt: Appointment) => {
    setSelectedAppt(appt); // ✅ important!
    setIsModalOpen(true);
    console.log("Add Prescription for", appt.id);
  };

  const completedAppointments = appointments.filter((appt) => appt.iscompleted);
  const filteredCompletedAppointments = completedAppointments.filter((appt) =>
    appt.patientName.toLowerCase().includes(completedSearch.toLowerCase())
  );

  const filteredAppointments = appointments.filter((appt) => {
    const status = appt.status?.toLowerCase();
    if (activeSection === "Completed") return appt.iscompleted;
    if (appt.iscompleted) return false;
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
      <div className="flex-1 p-6 max-h-screen overflow-scroll">
        <Toaster />
        <h2 className="text-3xl font-extrabold text-blue-700 mb-6 border-b-4 border-blue-200 pb-2">
          Patient Appointments
        </h2>

        {completedAppointments.length > 0 && (
          <div className="mb-10 bg-blue-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-blue-800 border-l-4 border-blue-500 pl-3">
                Completed Appointments
              </h3>
              <input
                type="text"
                placeholder="Search by patient..."
                value={completedSearch}
                onChange={(e) => setCompletedSearch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {filteredCompletedAppointments.length > 0 ? (
                filteredCompletedAppointments.map((appt) => (
                  <div key={appt.id} className="flex-shrink-0 w-80">
                    <AppointmentCardDoctor
                      appointment={{
                        ...appt,
                        hasPrescription: hasPrescription(appt.id),
                      }}
                      onConfirm={() => handleConfirm(appt.id)}
                      onReschedule={() => handleReschedule(appt)}
                      onCancel={() => handleCancel(appt.id)}
                      onComplete={() => handleComplete(appt.id)}
                      onViewPrescription={() => handleViewPrescription(appt)}
                      onAddPrescription={() => handleAddPrescription(appt)}
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No matches found.</p>
              )}
            </div>
          </div>
        )}

        {/* Other sections */}
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

          <h3 className="text-2xl font-semibold text-blue-800 border-l-4 border-blue-500 pl-3 mb-4">
            {activeSection} Appointments
          </h3>

          {filteredAppointments.length === 0 ? (
            <p className="text-gray-500 italic">
              No appointments in this section.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              {filteredAppointments.map((appt) => (
                <AppointmentCardDoctor
                  key={appt.id}
                  appointment={{
                    ...appt,
                    hasPrescription: hasPrescription(appt.id),
                  }}
                  onConfirm={() => handleConfirm(appt.id)}
                  onReschedule={() => handleReschedule(appt)}
                  onCancel={() => handleCancel(appt.id)}
                  onComplete={() => handleComplete(appt.id)}
                  onViewPrescription={() => handleViewPrescription(appt)}
                  onAddPrescription={() => handleAddPrescription(appt)}
                />
              ))}
            </div>
          )}

          {selectedAppt && rescheduleopen && (
            <RescheduleModal
              appointment={selectedAppt}
              onClose={() => setSelectedAppt(null)}
              onSubmit={handleRescheduleSubmit}
            />
          )}
        </div>

        {selectedAppt && (
          <CreatePrescriptionModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            appointmentId={selectedAppt.id}
            patientId={selectedAppt.patientId}
            onCreated={() => {}}
          />
        )}
      </div>
    </div>
  );
}
