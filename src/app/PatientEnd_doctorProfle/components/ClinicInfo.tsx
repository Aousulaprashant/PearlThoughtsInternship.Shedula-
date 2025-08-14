"use client";
import React from "react";
import {
  MdLocationOn,
  MdAccessTime,
  MdPhone,
  MdEmail,
  MdPublic,
} from "react-icons/md";
import type { Doctor } from "./types";

export function ClinicInfo({
  doctor,
  loading,
}: {
  doctor: Doctor | null;
  loading: boolean;
}) {
  if (loading)
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 animate-pulse">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        <div className="mt-3 h-3 w-11/12 bg-slate-200 rounded" />
        <div className="mt-2 h-3 w-9/12 bg-slate-200 rounded" />
      </div>
    );
  return (
    <aside className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <h3 className="font-semibold text-slate-800 mb-3">Clinic & Contact</h3>
      <ul className="space-y-3 text-sm text-slate-700">
        {doctor?.clinicName && (
          <li className="font-medium">{doctor.clinicName}</li>
        )}
        {doctor?.address && (
          <li className="flex items-start gap-2">
            <MdLocationOn className="mt-0.5" aria-hidden />{" "}
            <span>{doctor.address}</span>
          </li>
        )}
        {(doctor?.phone || doctor?.doctoremailOrphone) && (
          <li className="flex items-center gap-2">
            <MdPhone aria-hidden />{" "}
            <span>{doctor.phone || doctor.doctoremailOrphone}</span>
          </li>
        )}
        {doctor?.website && (
          <li className="flex items-center gap-2">
            <MdPublic aria-hidden />{" "}
            <a
              className="text-blue-600 hover:underline"
              href={doctor.website}
              target="_blank"
              rel="noreferrer"
            >
              Website
            </a>
          </li>
        )}
        {doctor?.doctoremailOrphone &&
          doctor.doctoremailOrphone.includes("@") && (
            <li className="flex items-center gap-2">
              <MdEmail aria-hidden />{" "}
              <a
                className="text-blue-600 hover:underline"
                href={`mailto:${doctor.doctoremailOrphone}`}
              >
                {doctor.doctoremailOrphone}
              </a>
            </li>
          )}
      </ul>

      {(doctor?.workingDays?.length || doctor?.workingHours?.length) && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <MdAccessTime aria-hidden /> Working Hours
          </h4>
          <div className="text-sm text-slate-600 space-y-1">
            {(doctor?.workingDays || []).map((d, i) => (
              <div key={`${d.start}-${i}`}>
                {d.start}
                {d.end ? ` - ${d.end}` : ""} •{" "}
                {doctor?.workingHours?.[i]?.start ??
                  doctor?.workingHours?.[0]?.start ??
                  ""}{" "}
                -{" "}
                {doctor?.workingHours?.[i]?.end ??
                  doctor?.workingHours?.[0]?.end ??
                  ""}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
