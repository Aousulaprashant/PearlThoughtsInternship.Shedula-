"use client";
import React from "react";
import { MdMedicalServices } from "react-icons/md";

export function ServicesGrid({ services = [] as string[] }) {
  if (!services.length) return null;
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100">
      <h3 className="font-semibold text-slate-800 mb-4">Services Offered</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {services.map((s) => (
          <div
            key={s}
            className="group bg-white border border-blue-100 rounded-2xl p-4 shadow-sm ring-1 ring-blue-50 transition-transform duration-150 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-50 text-blue-700">
                <MdMedicalServices aria-hidden />
              </div>
              <div className="text-sm text-slate-700 font-medium">{s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
