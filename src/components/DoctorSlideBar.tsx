"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaCalendarCheck,
  FaBell,
  FaCalendarAlt,
  FaPrescriptionBottle,
  FaHospital,
  FaUserInjured,
  FaFileMedical,
  FaClinicMedical,
  FaUserMd,
  FaStethoscope,
  FaStar,
  FaTools,
  FaFileAlt,
  FaCommentDots,
  FaQuestionCircle,
  FaCog,
} from "react-icons/fa";

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

const mainItems: NavItem[] = [
  { name: "Dashboard", href: "/docDashBoard", icon: <FaHospital /> },
  { name: "Appointment", href: "/Docappointments", icon: <FaCalendarCheck /> },
  { name: "Notifications", href: "/notifications", icon: <FaBell /> },
  { name: "Calendar", href: "/DocCalender", icon: <FaCalendarAlt /> },
  {
    name: "Prescription",
    href: "/prescription",
    icon: <FaPrescriptionBottle />,
  },
  { name: "Patient", href: "/patients", icon: <FaUserInjured /> },
  // { name: "Report", href: "/report", icon: <FaFileMedical /> },
  // { name: "Clinic", href: "/clinic", icon: <FaClinicMedical /> },
  // { name: "Staff", href: "/staff", icon: <FaUserMd /> },
  // { name: "Consultation", href: "/consultation", icon: <FaStethoscope /> },
];

const favoriteItems: NavItem[] = [
  { name: "VIP Patient", href: "/vip-patient", icon: <FaStar /> },
  // { name: "Equipment", href: "/equipment", icon: <FaTools /> },
  // { name: "Staff Report", href: "/staff-report", icon: <FaFileAlt /> },
];

const footerItems: NavItem[] = [
  // { name: "Feedback", href: "/feedback", icon: <FaCommentDots /> },
  // { name: "Help Center", href: "/help-center", icon: <FaQuestionCircle /> },
  // { name: "Settings", href: "/settings", icon: <FaCog /> },
];

const Sidebar = () => {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem) => (
    <Link
      key={item.name}
      href={item.href}
      className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all
        ${
          pathname === item.href
            ? "bg-white text-blue-600 font-semibold"
            : "text-white hover:bg-blue-500 hover:text-white"
        }`}
    >
      <span className="text-lg">{item.icon}</span>
      {item.name}
    </Link>
  );

  return (
    <aside className="w-64 m-0 h-screen bg-blue-600 p-4 flex flex-col justify-between">
      {/* Top section */}
      <div>
        <nav className="space-y-1 mb-6">{mainItems.map(renderNavItem)}</nav>

        <div className="text-xs text-white/70 uppercase mb-2 px-4">
          Favorite
        </div>
        <nav className="space-y-1">{favoriteItems.map(renderNavItem)}</nav>

        <nav className=" space-y-1 mt-4">{footerItems.map(renderNavItem)}</nav>
      </div>
    </aside>
  );
};

export default Sidebar;
