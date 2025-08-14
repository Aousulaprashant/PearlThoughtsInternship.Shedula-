"use client";
import React from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import type { Prescription } from "./types";

export function PrescriptionsList({
  prescriptions,
  loading,
}: {
  prescriptions: Prescription[];
  loading: boolean;
}) {
  if (loading) return <Skeleton />;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <h3 className="text-lg font-semibold text-slate-800">Prescriptions</h3>
      {!prescriptions?.length ? (
        <EmptyState />
      ) : (
        <div className="mt-3 space-y-3">
          {prescriptions.map((pres) => (
            <details key={pres.id} className="border rounded-xl p-4">
              <summary className="font-medium cursor-pointer">
                {dayjs(pres.date).format("DD MMM, YYYY")} —{" "}
                {pres.medicines.length} medicine
                {pres.medicines.length > 1 ? "s" : ""}
              </summary>
              <ul className="mt-3 text-sm text-slate-700 divide-y">
                {pres.medicines.map((m, i) => (
                  <li key={`${pres.id}-${i}`} className="py-2">
                    <div className="font-semibold">{m.medicine}</div>
                    <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                      {m.dosage && <span>Dosage: {m.dosage}</span>}
                      {m.duration && <span>Duration: {m.duration}</span>}
                      {m.route && <span>Route: {m.route}</span>}
                    </div>
                    {m.notes && (
                      <div className="text-xs text-slate-500 mt-1">
                        Notes: {m.notes}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <button
                  className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow"
                  aria-label="Download Prescription"
                >
                  Download PDF
                </button>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 animate-pulse">
      <div className="h-5 w-48 bg-slate-200 rounded" />
      <div className="mt-4 space-y-2">
        <div className="h-4 w-full bg-slate-200 rounded" />
        <div className="h-4 w-11/12 bg-slate-200 rounded" />
        <div className="h-4 w-10/12 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-2 text-sm text-slate-500">
      No prescriptions found for this doctor.
    </div>
  );
}
