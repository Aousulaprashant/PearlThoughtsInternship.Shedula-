"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaPills,
  FaUserMd,
  FaClock,
  FaCalendarAlt,
  FaFilePrescription,
  FaNotesMedical,
  FaInfoCircle,
  FaSpinner,
} from "react-icons/fa";
import axiosInstance from "@/utiles/axiosInstance";

interface Prescription {
  id: string;
  patientId?: string;
  appointmentId: string;
  medicine: string;
  dosage: string;
  duration: string;
  route?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  date: string;
}

interface Appointment {
  id: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
}

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const patientId = "u2";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [presRes, appRes] = await Promise.all([
          axiosInstance.get<Prescription[]>("/prescriptions"),
          axiosInstance.get<Appointment[]>("/appointments"),
        ]);

        const filteredPrescriptions = presRes.data.filter(
          (pres) => pres.patientId === patientId
        );

        setPrescriptions(filteredPrescriptions);
        setAppointments(appRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const getAppointmentDetails = (appointmentId: string) =>
    appointments.find((a) => a.id === appointmentId);

  if (loading) {
    return (
      <div className="text-center py-20 text-blue-600 text-xl flex justify-center items-center gap-3">
        <FaSpinner className="animate-spin" />
        Loading prescriptions...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-blue-800 mb-10 underline decoration-blue-400 underline-offset-4">
        <FaFilePrescription className="inline-block mr-2 mb-1" />
        My Prescriptions
      </h2>

      {prescriptions.length > 0 ? (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {prescriptions.map((pres, index) => {
            const appointment = getAppointmentDetails(pres.appointmentId);
            return (
              <li
                key={pres.id}
                className="relative group bg-white/20 backdrop-blur-lg p-6 rounded-2xl border border-gray-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="absolute top-4 right-4 text-blue-500 text-xl opacity-60 group-hover:opacity-100 transition">
                  <FaPills />
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {pres.medicine}
                </h3>

                <div className="space-y-1 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Dosage:</span> {pres.dosage}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span>{" "}
                    {pres.duration}
                  </p>
                  {pres.route && (
                    <p>
                      <span className="font-medium">Route:</span> {pres.route}
                    </p>
                  )}
                  {pres.frequency && (
                    <p>
                      <span className="font-medium">Frequency:</span>{" "}
                      {pres.frequency}
                    </p>
                  )}
                  {pres.startDate && (
                    <p>
                      <span className="font-medium">Start:</span>{" "}
                      {pres.startDate}
                    </p>
                  )}
                  {pres.endDate && (
                    <p>
                      <span className="font-medium">End:</span> {pres.endDate}
                    </p>
                  )}
                  {pres.notes && (
                    <p>
                      <FaNotesMedical className="inline-block mr-1 text-blue-400" />
                      {pres.notes}
                    </p>
                  )}
                  <p>
                    <FaCalendarAlt className="inline-block mr-1 text-blue-400" />
                    {pres.date}
                  </p>

                  {appointment && (
                    <>
                      <p>
                        <FaUserMd className="inline-block mr-1 text-blue-400" />
                        {appointment.doctorName}
                      </p>
                      <p>
                        <FaClock className="inline-block mr-1 text-blue-400" />
                        {appointment.appointmentDate} at{" "}
                        {appointment.appointmentTime}
                      </p>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center mt-20 text-gray-500 text-lg">
          <FaInfoCircle className="inline-block mr-2 mb-1 text-xl" />
          No prescriptions found for your account.
        </div>
      )}
    </div>
  );
}
