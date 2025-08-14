import { MdPlumbing } from "react-icons/md";
import React from "react";
import Link from "next/link";

type Props = {
  patientName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "rescheduled";
  appointmentId: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  rescheduled: "bg-orange-100 text-orange-800",
};

export default function PrescriptionManagementCard({
  patientName,
  date,
  time,
  status,
  appointmentId,
}: Props) {
  return (
    <div className="border rounded-lg p-4 shadow-sm flex justify-between items-center">
      <div>
        <p className="font-semibold text-lg">{patientName}</p>
        <p className="text-sm text-gray-600">
          {date} at {time}
        </p>

        <p className="text-sm text-gray-500">ID: {appointmentId}</p>
      </div>
      <Link href={`/prescription/${appointmentId}`}>
        <button className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
          <MdPlumbing size={16} /> Add Prescription
        </button>
      </Link>
      <span
        className={`px-3 py-1 rounded-full text-sm capitalize ${statusColors[status]}`}
      >
        {status}
      </span>
    </div>
  );
}
