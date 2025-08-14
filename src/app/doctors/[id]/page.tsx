// app/doctors/[id]/page.tsx
"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import ReviewForm from "@/components/reviewForm";
import { useUser } from "@/context/UseContext-login";
import AppointmentConfirmationModal from "@/components/AppointmentSuccess";
import Receiptpage from "@/components/Reciptpage";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import ReceiptPage from "@/components/Reciptpage";
import axiosInstance from "@/utiles/axiosInstance";
import { useRouter } from "next/navigation";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

type Review = {
  name: string;
  date: string;
  rating: number;
  comment: string;
};

type Doctor = {
  id: string;
  name: string;
  profileImage: any;
  address: string;
  specialty?: string;
  specialization?: string; // some data might use this key
  degree?: string;
  about: string;
  workingDays: any;
  patients?: string;
  reviews: string | number;
  experience?: string;
  rating: string | number;
  service?: string;
  availability?: {
    days?: string; // e.g. "Monday to Friday"
    workingHours?: string; // e.g. "10 AM to 3 PM" or "10:30 am to 3:00 pm"
  };
  workingHours: any;
  image: string;
  location: string;
  phone: string;
  fee: string;
  title?: string;
  services: string[];
  reviewList: Review[];
};

// ---------- helpers (pure) ----------
const WEEKDAY_INDEX: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function parseAllowedWeekdays(daysStr?: string): Set<number> {
  // Supports "Monday to Friday", "Mon-Fri", "Monday, Wednesday, Friday", etc.
  if (!daysStr) return new Set([0, 1, 2, 3, 4, 5, 6]); // default: all days
  const s = daysStr.toLowerCase().replace(/\s+/g, " ").trim();

  // range style
  const rangeMatch = s.match(
    /(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*(to|-)\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/
  );
  if (rangeMatch) {
    const start = WEEKDAY_INDEX[rangeMatch[1]];
    const end = WEEKDAY_INDEX[rangeMatch[3]];
    const set = new Set<number>();
    let i = start;
    while (true) {
      set.add(i);
      if (i === end) break;
      i = (i + 1) % 7;
    }
    return set;
  }

  // comma list style
  const list = s
    .split(/,|\band\b/)
    .map((x) => x.trim())
    .filter(Boolean);

  const set = new Set<number>();
  for (const part of list) {
    const idx = WEEKDAY_INDEX[part];
    if (typeof idx === "number") set.add(idx);
  }
  // fallback: all days if parsing failed
  return set.size ? set : new Set([0, 1, 2, 3, 4, 5, 6]);
}

function getNextNDatesFiltered(
  startDate: Date,
  n: number,
  allowedWeekdays: Set<number>
): Date[] {
  const out: Date[] = [];
  const d = new Date(startDate);
  // start from today (truncate time)
  d.setHours(0, 0, 0, 0);
  while (out.length < n) {
    if (allowedWeekdays.has(d.getDay())) {
      out.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function formatDateDisplay(date: Date): string {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" }); // Tue
  return `${weekday} ${date.getDate()}`; // "Tue 15"
}

function toMinutesFrom12Hour(t: string): number {
  // accepts "10 AM", "3 PM", "10:30 am", "12:00 Am"
  const cleaned = t.trim().toLowerCase();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2] || "0", 10);
  const meridiem = match[3];

  if (meridiem === "pm" && hours < 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function minutesTo12Hour(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const period = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

function generateTimeSlotsFromWindow(
  windowStr?: string,
  intervalMinutes = 30
): string[] {
  // windowStr like "10 AM to 3 PM"
  if (!windowStr) return [];
  const parts = windowStr.toLowerCase().split(/\s*to\s*/);
  if (parts.length !== 2) return [];
  const startMin = toMinutesFrom12Hour(parts[0].trim());
  const endMin = toMinutesFrom12Hour(parts[1].trim());
  if (
    !Number.isFinite(startMin) ||
    !Number.isFinite(endMin) ||
    endMin <= startMin
  )
    return [];

  const slots: string[] = [];
  for (let t = startMin; t < endMin; t += intervalMinutes) {
    slots.push(minutesTo12Hour(t));
  }
  return slots;
}
// ------------------------------------

const DoctorDetails = () => {
  const { id } = useParams();
  const [doctorData, setDoctorData] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  const { user, setUser } = useUser();
  const router = useRouter();

  const [dateOffset, setDateOffset] = useState(0); // which page of the 4-day window
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [dateList, setDateList] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<any | false>(
    false
  );
  const [formData, setFormData] = useState({
    patientName: "",
    phoneNumber: "",
    gender: "",
    paymentMethod: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axiosInstance.get(`/doctors/${id}`);
        const data = res.data as Doctor;
        setDoctorData(data);
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDoctor();
  }, [id]);

  // when doctor data loads, compute dates & times
  useEffect(() => {
    if (!doctorData) return;

    // --- 1️⃣ Convert workingDays to string for parsing ---
    const allowedDaysStr = doctorData.workingDays
      ?.map((day: any) => `${day.start} to ${day.end}`)
      .join(", "); // e.g., "Tuesday to Saturday"

    // --- 2️⃣ Convert 24-hour workingHours to 12-hour string ---
    const convert24to12 = (hourStr: string) => {
      const [h, m] = hourStr.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12}:${m.toString().padStart(2, "0")} ${period}`;
    };

    const workingTimeStr = doctorData.workingHours
      ?.map((h: any) => `${convert24to12(h.start)} to ${convert24to12(h.end)}`)
      .join(", "); // e.g., "11:00 AM to 8:00 PM"

    // --- 3️⃣ Parse allowed weekdays ---
    const allowedWeekdays = parseAllowedWeekdays(allowedDaysStr);

    // --- 4️⃣ Generate next 28 valid dates ---
    const upcoming = getNextNDatesFiltered(new Date(), 28, allowedWeekdays);
    setDateList(upcoming);
    setDateOffset(0);
    setSelectedDateIndex(0);

    // --- 5️⃣ Generate time slots from working hours ---
    const slots = generateTimeSlotsFromWindow(workingTimeStr, 30);
    setAvailableSlots(slots);
    setSelectedTime(slots[0] || "");
  }, [doctorData]);

  // currently visible 4-day window
  const visibleDates = useMemo(() => {
    return dateList.slice(dateOffset, dateOffset + 4);
  }, [dateList, dateOffset]);

  const handleAppontmentBooking = async () => {
    const chosenDate = dateList[selectedDateIndex];
    if (
      !formData.phoneNumber ||
      !formData.gender ||
      !selectedTime ||
      !chosenDate
    ) {
      alert("Please fill all required fields.");
      return;
    }
    const now = new Date();
    const payload = {
      ...formData,
      patientName: user?.name,
      patientId: user?.id,
      doctorId: doctorData?.id,
      doctorName: doctorData?.name,
      doctorImage: doctorData?.image,
      specialization: doctorData?.specialization || specialtyText,
      fee: doctorData?.fee,
      location: doctorData?.location,
      phone: doctorData?.phone,
      status: "booked",
      iscompleted: false,
      rating: doctorData?.rating,
      reviews: doctorData?.reviews,
      appointmentDate: chosenDate.toISOString().split("T")[0],
      appointmentTime: selectedTime,
      createdOnDate: now.toISOString().split("T")[0], // YYYY-MM-DD
      createdOnTime: now.toTimeString().split(" ")[0], // HH:MM:SS
      createdTimestamp: now.toISOString(), // Full ISO timestamp
    };

    try {
      const res = await axiosInstance.post("/appointments", payload);

      if (res.status === 201) {
        setAppointmentDetails(payload); // This sets data for Receipt
        toastr.success("Appointment created successfully!");

        // Delay PDF download until DOM is ready
        setTimeout(() => {
          downloadReceiptAsPDF(); // download receipt
        }, 800); // short delay ensures the DOM renders the hidden receipt

        router.push("/appointments");
      } else {
        alert("Failed to save appointment. Try again.");
        toastr.error("Something went wrong!");
      }
    } catch (err) {
      console.error("Error booking appointment:", err);
      alert("Something went wrong.");
    }
  };

  const canPrev = dateOffset > 0;
  const canNext = dateOffset + 4 < dateList.length;

  if (loading) return <div className="p-6">Loading doctor details...</div>;
  if (!doctorData || (doctorData as any).error)
    return <div className="p-6">Doctor not found.</div>;

  const specialtyText =
    doctorData?.specialty || doctorData?.specialization || "";

  return (
    <div className="p-6">
      <div className="bg-blue-600 text-white p-6 rounded-xl flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {doctorData.name.toUpperCase()}
          </h2>
          <p className="text-blue-200">{specialtyText}</p>
          <p className="mt-1 font-medium">{doctorData.title}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
            <span>📍 {doctorData.address}</span>
            <span>💵 Fee: {doctorData.fee}</span>
            <span>📞 {doctorData.phone}</span>
          </div>
          <div className="mt-2 text-yellow-300 font-bold text-lg">
            ⭐ {doctorData.rating}{" "}
            <span className="text-sm text-white font-normal">
              ({doctorData.reviews} Reviews)
            </span>
          </div>
        </div>
        <img
          src={doctorData.profileImage}
          alt="Doctor"
          className="w-36 h-36 rounded-xl object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div>
          <h3 className="font-bold text-lg mb-2">About the Doctor</h3>
          <p className="text-gray-700 mb-4">{doctorData.about}</p>

          <h3 className="font-bold text-lg mb-2">Services</h3>
          <ul className="list-disc list-inside text-gray-700">
            {doctorData?.services?.map((service: string) => (
              <li key={service}>{service}</li>
            ))}
          </ul>

          <h3 className="font-bold text-lg mt-6 mb-2">
            Patient Reviews & Ratings
          </h3>
          <div>
            {doctorData?.reviewList?.map((review: any, idx: number) => (
              <div key={idx} className="bg-gray-100 p-4 rounded-xl mb-4">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{review.name}</span>
                  <span className="text-gray-500">{review.date}</span>
                </div>
                <div className="text-blue-600 text-sm font-medium">
                  Excellent
                </div>
                <div className="text-yellow-500 mb-2">
                  {"★".repeat(review.rating)}
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
          {doctorData && (
            <ReviewForm
              doctorId={doctorData.id}
              apiBaseUrl="http://localhost:5000"
              onAfterSubmit={(newReviewList, newCount) => {
                setDoctorData((prev): Doctor | null =>
                  prev
                    ? {
                        ...prev,
                        reviewList: newReviewList as Review[],
                        reviews: (typeof prev.reviews === "number"
                          ? newCount
                          : String(newCount)) as string | number,
                      }
                    : prev
                );
              }}
            />
          )}
        </div>

        {/* Booking Panel */}
        <div className="relative overflow-hidden rounded-2xl p-8 bg-white shadow-2xl border border-gray-200">
          <motion.h3
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-extrabold text-xl mb-4 tracking-wide text-blue-700"
          >
            Book Your Appointment
          </motion.h3>

          {/* Available Days */}
          <div className="mb-6 space-y-3">
            <label className="font-semibold text-gray-700">Select Date</label>
            <div className="flex justify-between items-center">
              <select
                className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                value={
                  dateList[selectedDateIndex]
                    ? `${dateList[selectedDateIndex].getFullYear()}-${dateList[
                        selectedDateIndex
                      ].getMonth()}`
                    : ""
                }
                onChange={(e) => {
                  const [y, m] = e.target.value.split("-").map(Number);
                  const newDate = new Date(y, m, 1);
                  const allowed = parseAllowedWeekdays(
                    doctorData?.availability?.days
                  );
                  const upcoming = getNextNDatesFiltered(newDate, 28, allowed);
                  setDateList(upcoming);
                  setDateOffset(0);
                  setSelectedDateIndex(0);
                }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={`${new Date().getFullYear()}-${i}`}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}{" "}
                    {new Date().getFullYear()}
                  </option>
                ))}
              </select>

              {/* Prev/Next */}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    canPrev && setDateOffset((p) => Math.max(0, p - 1))
                  }
                  disabled={!canPrev}
                  className="disabled:opacity-30 bg-gray-200 hover:bg-gray-300 transition p-2 rounded-full"
                >
                  &lt;
                </button>
                <button
                  onClick={() =>
                    canNext &&
                    setDateOffset((p) => Math.min(dateList.length - 4, p + 1))
                  }
                  disabled={!canNext}
                  className="disabled:opacity-30 bg-gray-200 hover:bg-gray-300 transition p-2 rounded-full"
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* Date Slots */}
            <div className="grid grid-cols-2 gap-3">
              {visibleDates.map((date, idx) => {
                const globalIndex = dateOffset + idx;
                const isSelected = globalIndex === selectedDateIndex;
                const label = date.toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                });
                return (
                  <button
                    key={label}
                    onClick={() => setSelectedDateIndex(globalIndex)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition
              ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-6">
            <label className="font-semibold text-gray-700 block mb-2">
              Select Time
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSlots.length ? (
                availableSlots.map((time, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTime(time)}
                    className={`px-4 py-2 rounded-full text-sm border font-medium transition-all
              ${
                selectedTime === time
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : "bg-white hover:bg-gray-100 border-gray-300"
              }`}
                  >
                    {time}
                  </button>
                ))
              ) : (
                <span className="text-xs text-gray-500">No slots.</span>
              )}
            </div>
          </div>

          {/* Patient Info */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-3 mb-6">
              {/* <input
                type="text"
                name="patientName"
                placeholder="Patient Name"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.patientName}
                onChange={handleChange}
              /> */}
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <select
                name="gender"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Payment */}
            <div className="mb-6 space-y-3">
              <h4 className="font-semibold text-gray-700">Payment Method</h4>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash"
                    checked={formData.paymentMethod === "Cash"}
                    onChange={handleChange}
                  />
                  Cash
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Credit or Debit Card"
                    checked={formData.paymentMethod === "Credit or Debit Card"}
                    onChange={handleChange}
                  />
                  Card
                </label>
              </div>
              <input
                type="text"
                name="cardNumber"
                placeholder="Card Number"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.cardNumber}
                onChange={handleChange}
              />
              <div className="flex gap-3">
                <input
                  type="text"
                  name="expiry"
                  placeholder="Exp. Date"
                  className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.expiry}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="cvv"
                  placeholder="CVV"
                  className="w-1/2 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.cvv}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:to-blue-700 text-white font-semibold shadow-lg transition-all hover:scale-[1.01]"
              onClick={handleAppontmentBooking}
            >
              Confirm Booking
            </button>
          </motion.div>
        </div>
      </div>

      <div>
        <AppointmentConfirmationModal
          isOpen={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
        />
        {appointmentDetails && (
          <ReceiptPage appointmentDetails={appointmentDetails} />
        )}
      </div>
    </div>
  );
};

const downloadReceiptAsPDF = async () => {
  const receiptElement = document.getElementById("receipt");
  if (!receiptElement) return;

  // Temporarily show the receipt for rendering
  receiptElement.style.display = "block";

  // Wait for the DOM to paint
  await new Promise((resolve) => setTimeout(resolve, 300));

  const canvas = await html2canvas(receiptElement);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF();
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("appointment_receipt.pdf");

  // Hide the receipt again
  receiptElement.style.display = "none";
};

export default DoctorDetails;
