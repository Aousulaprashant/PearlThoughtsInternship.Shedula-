"use client";

import React from "react";
import Sidebar from "@/components/DoctorSlideBar";
import { useUser } from "@/context/UseContext-login"; // ⬅️ context hook

const Dashboard = () => {
  const { user } = useUser(); // ⬅️ get user from context

  return (
    <div className="min-h-screen bg-[#f6f9fc] font-sans">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome Card */}
          <div className="bg-blue-600 text-white rounded-xl p-6 flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                Hello{" "}
                {user?.role === "doctor" ? `Dr. ${user?.name}` : user?.name},
              </h1>
              <p className="text-sm mt-1">
                Have a nice day and don’t forget to take care of your health!
              </p>
              <p className="text-sm mt-2 underline cursor-pointer">
                Health Tips →
              </p>
            </div>
            <img src={user?.image} alt="Doctors" className="h-28 rounded-4xl" />
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Appointments", value: "2,854", change: "+8%" },
              { label: "Total Patients", value: "1,728", change: "+8%" },
              { label: "Total Doctors", value: "245", change: "+2%" },
              { label: "Total Specialties", value: "18", change: "+8%" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-xl shadow text-center"
              >
                <p className="text-gray-700 text-sm mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-[#333]">{stat.value}</p>
                <p className="text-xs text-green-500">{stat.change} Increase</p>
              </div>
            ))}
          </div>

          {/* Placeholder for Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-[#333] mb-4">
                Appointment Bookings
              </h3>
              <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                <span>Lorem ipsum dolor sit amet.</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-[#333] mb-4">
                Top Patient Locations
              </h3>
              <div className="h-40 bg-gray-100 rounded flex items-center justify-center text-gray-500">
                <span>Lorem ipsum dolor sit amet.</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
