"use client";
import Link from "next/link";
import { Appointment, Prescription } from "@/types";

type Props = {
  appointment: Appointment;
  prescription?: Prescription;
};

export default function PrescriptionCard({ appointment, prescription }: Props) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        marginBottom: "1rem",
      }}
    >
      <h4>Patient: {appointment.patientName}</h4>
      <p>Status: {appointment.status}</p>

      {!prescription ? (
        <Link href={`/prescription/create/${appointment.id}`}>
          <button>Create Prescription</button>
        </Link>
      ) : (
        <>
          <Link href={`/prescription/edit/${prescription.id}`}>
            <button>Edit Prescription</button>
          </Link>
          <Link href={`/prescription/view/${prescription.id}`}>
            <button>View Prescription</button>
          </Link>
        </>
      )}
    </div>
  );
}
