"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Appointments", href: "/Docappointments" },
  { name: "Notifications", href: "/notifications" },
  { name: "Calendar", href: "/DocCalender" },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow h-screen p-6">
      <h2 className="text-xl font-bold text-[#3f3d56] mb-8">
        <a href="/docDashBoard">Dashboard</a>
      </h2>
      <nav className="space-y-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block text-[#555] hover:text-blue-500 transition ${
              pathname === item.href ? "font-semibold text-blue-600" : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
