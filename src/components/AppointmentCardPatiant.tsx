"use client";

import React from "react";
import { FaCalendarAlt, FaTimesCircle, FaEllipsisH } from "react-icons/fa";

type Appointment = {
  id: string;
  doctorName: string;
  doctorImage: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  fee: string;
  specialization?: string;
};

type Props = {
  appointment: Appointment;
  onReschedule?: () => void;
  onCancel?: () => void;
  onOther?: () => void;
};

export default function AppointmentCard({
  appointment,
  onReschedule,
  onCancel,
  onOther,
}: Props) {
  return (
    <div className="relative group bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden p-4 flex items-start gap-4">
      {/* Doctor Image */}
      <div className="shrink-0">
        <img
          src={appointment.doctorImage}
          alt={appointment.doctorName}
          className="w-20 h-20 object-cover rounded-full border-4 border-blue-100"
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-blue-900">
          {appointment.doctorName}
        </h3>
        <p className="text-sm text-gray-500">{appointment.location}</p>

        <div className="mt-1 text-sm text-gray-700 space-y-1">
          <p>
            <span className="font-medium text-gray-800">Date:</span>{" "}
            {appointment.appointmentDate}
          </p>
          <p>
            <span className="font-medium text-gray-800">Time:</span>{" "}
            {appointment.appointmentTime}
          </p>
          <p className="text-green-600 font-semibold">{appointment.fee}</p>
          <p className="text-xs text-blue-500">
            Specialty: {appointment.specialization || "General"}
          </p>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={onReschedule}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
        >
          <FaCalendarAlt className="text-base" />
          <span>Reschedule</span>
        </button>

        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
        >
          <FaTimesCircle className="text-base" />
          <span>Cancel</span>
        </button>

        <button
          onClick={onOther}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
        >
          <FaEllipsisH className="text-base" />
          <span>More</span>
        </button>
      </div>
    </div>
  );
}
