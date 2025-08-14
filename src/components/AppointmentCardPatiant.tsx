"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  FaCalendarAlt,
  FaTimesCircle,
  FaEllipsisH,
  FaFilePrescription,
  FaUserCircle,
} from "react-icons/fa";
import PrescriptionView from "./viewPrescription";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Appointment = {
  id: string;
  doctorName: string;
  doctorImage: string;
  appointmentDate: string;
  doctorId: string;
  appointmentTime: string;
  location: string;
  isCompleted: boolean;
  fee: string;
  specialization?: string;
  status?: string;
};

type Props = {
  appointment: Appointment;
  onReschedule?: () => void;
  onCancel?: () => void;
  onOther?: () => void;
  onViewDoctorProfile?: () => void; // New callback
};

export default function AppointmentCard({
  appointment,
  onReschedule,
  onCancel,
  onOther,
  onViewDoctorProfile,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Dropdown state + refs (for portal positioning & outside-click)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const isCompleted =
    appointment.isCompleted ||
    appointment.status?.toLowerCase() === "completed";

  const router = useRouter();

  // Fetch prescription (keeps behavior)
  const handleViewPrescription = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/prescriptions?appointmentId=${appointment.id}`
      );
      const data = await res.json();

      if (!data || data.length === 0) {
        toast.error("No prescription is given");
        return;
      }

      setPrescriptionData(data[0]);
      setShowModal(true);
    } catch (error) {
      toast.error("Error fetching prescription");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Compute dropdown position and open (rendered in portal)
  const openDropdown = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) {
      setDropdownOpen(true);
      return;
    }

    const rect = btn.getBoundingClientRect();

    // Estimated dropdown dimensions (Tailwind w-40 = 160px). We'll adjust if needed.
    const DROPDOWN_WIDTH = 160;
    const DROPDOWN_HEIGHT = 96; // ~ two options

    let left = rect.right + 8 + window.scrollX; // prefer to the right with small gap
    let top = rect.top + window.scrollY; // align top with button top

    // If overflowing right viewport, place to left of button
    if (left + DROPDOWN_WIDTH > window.scrollX + window.innerWidth) {
      left = rect.left - DROPDOWN_WIDTH - 8 + window.scrollX;
    }

    // If dropdown bottom would overflow, shift up
    if (top + DROPDOWN_HEIGHT > window.scrollY + window.innerHeight) {
      top = Math.max(
        window.scrollY + 8,
        window.scrollY + window.innerHeight - DROPDOWN_HEIGHT - 8
      );
    }

    setDropdownPos({ top, left });
    setDropdownOpen(true);
  }, []);

  // Toggle handler on the three dots
  const onToggleDropdown = (e?: MouseEvent) => {
    // prevent card-level clicks from interfering
    e?.stopPropagation();
    if (!dropdownOpen) openDropdown();
    else setDropdownOpen(false);
  };

  // Close when click outside dropdown or button
  useEffect(() => {
    if (!dropdownOpen) return;

    const handleOutside = (ev: MouseEvent) => {
      const target = ev.target as Node;
      const btn = buttonRef.current;
      const dd = dropdownRef.current;

      if (btn && btn.contains(target)) return;
      if (dd && dd.contains(target)) return;

      setDropdownOpen(false);
    };

    const handleEsc = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [dropdownOpen]);

  // Reposition on resize/scroll while open
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleResize = () => openDropdown();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [dropdownOpen, openDropdown]);

  // Click handlers for dropdown options
  const handleSelectViewPrescription = () => {
    setDropdownOpen(false);
    // open prescription modal
    handleViewPrescription();
  };

  const handleSelectDoctorProfile = () => {
    setDropdownOpen(false);
    if (onViewDoctorProfile) onViewDoctorProfile();
    router.push(`/PatientEnd_doctorProfle/${appointment.doctorId}`);
  };

  return (
    <div className="relative group bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden p-4 flex items-start gap-4">
      {/* Doctor Image */}
      <div className="shrink-0">
        <img
          src={appointment.profileImage}
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

      {/* Non-completed actions (same as before) */}
      {!isCompleted ? (
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
      ) : (
        // Completed: show three-dots button (hover) — clicking opens portal dropdown
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            ref={buttonRef}
            onClick={onToggleDropdown}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            className="flex items-center justify-center w-10 h-10 text-blue-500 bg-blue-100 rounded-full hover:bg-blue-200 transition"
            title="More options"
          >
            <FaEllipsisH className="text-lg" />
          </button>
        </div>
      )}

      {/* Dropdown portal */}
      {dropdownOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 9999,
            }}
            // small wrapper to allow click detection inside
          >
            <div className="w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={handleSelectViewPrescription}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
              >
                <FaFilePrescription className="text-base" />
                <span>{loading ? "Loading..." : "View Prescription"}</span>
              </button>

              <button
                onClick={handleSelectDoctorProfile}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
              >
                <FaUserCircle className="text-base" />
                <span>Doctor Profile</span>
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* Prescription Modal */}
      {showModal && prescriptionData && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full overflow-auto max-h-[90vh]">
            <PrescriptionView {...prescriptionData} />
            <div className="mt-4 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
