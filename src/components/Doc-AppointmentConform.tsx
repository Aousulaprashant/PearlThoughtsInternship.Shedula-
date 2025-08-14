"use client";

import React from "react";
import Link from "next/link";
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
  RotateCcw,
} from "lucide-react";

type Appointment = {
  id: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  fee: string;
  status: string;
  iscompleted?: boolean;
};

type Props = {
  appointment: Appointment & { hasPrescription?: boolean };
  onConfirm: () => void;
  onReschedule: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onMarkNotCompleted?: () => void; // New optional handler
  onViewPrescription?: () => void; // handler for viewing prescription
  onAddPrescription?: () => void; // handler for adding prescription
};

export default function AppointmentCardDoctor({
  appointment,
  onConfirm,
  onReschedule,
  onCancel,
  onComplete,
  onMarkNotCompleted,
  onViewPrescription,
  onAddPrescription,
}: Props) {
  const isCompleted =
    appointment.iscompleted ||
    appointment.status?.toLowerCase() === "completed";

  return (
    <div className="relative group bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden p-4 flex items-start gap-4">
      <Link key={appointment.id} href={`/Docappointments/${appointment.id}`}>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-blue-900">
            {appointment.patientName}
          </h3>
          <div className="mt-1 text-sm text-gray-700 space-y-1">
            <p className="flex items-center gap-2">
              <CalendarDays size={16} className="text-indigo-500" />
              <span>
                <span className="font-medium text-gray-800">Date:</span>{" "}
                {appointment.appointmentDate}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Clock size={16} className="text-green-500" />
              <span>
                <span className="font-medium text-gray-800">Time:</span>{" "}
                {appointment.appointmentTime}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={16} className="text-rose-500" />
              <span>{appointment.location}</span>
            </p>
            {appointment.fee && (
              <p className="flex items-center gap-2 text-green-600 font-semibold">
                <IndianRupee size={16} /> ₹{appointment.fee}
              </p>
            )}
            <p className="flex items-center gap-2 text-xs text-blue-500">
              <ShieldCheck size={14} /> Status:{" "}
              <span className="capitalize">{appointment.status}</span>
            </p>
          </div>
        </div>
      </Link>

      {/* Floating Action Buttons */}
      <div className="absolute top-1/2 -translate-y-1/2 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {isCompleted ? (
          <>
            {appointment.hasPrescription ? (
              <button
                onClick={onViewPrescription}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
              >
                <CheckCircle size={16} />
                <span>View Prescription</span>
              </button>
            ) : (
              <button
                onClick={onAddPrescription}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
              >
                <CheckCircle size={16} />
                <span>Add Prescription</span>
              </button>
            )}

            <button
              onClick={onMarkNotCompleted}
              className="flex gap-2 px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              <RotateCcw size={16} />
              <span>Mark Not Completed</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onConfirm}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition"
            >
              <CheckCircle size={16} />
              <span>Confirm</span>
            </button>

            <button
              onClick={onReschedule}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
            >
              <RefreshCcw size={16} />
              <span>Reschedule</span>
            </button>

            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>

            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
            >
              <Check size={16} />
              <span>Completed</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
