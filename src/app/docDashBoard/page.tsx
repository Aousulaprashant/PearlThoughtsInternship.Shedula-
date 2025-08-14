"use client";

import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/DoctorSlideBar";
import { useUser } from "@/context/UseContext-login";
import axiosInstance from "@/utiles/axiosInstance";
import toast from "react-hot-toast";
import moment from "moment";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

// For Calendar
import {
  Calendar,
  dateFnsLocalizer,
  DateCellWrapperProps,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, startOfWeek, getDay, format } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./styles.css";
import axios from "axios";
dayjs.extend(isSameOrAfter); // Extend once at the top

const COLORS = ["#3B82F6", "#FBBF24", "#10B981"]; // blue, yellow, green

// Setup react-big-calendar localizer
const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Dashboard = () => {
  const { user } = useUser();
  const [doctor, setDoctor] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  const today = dayjs().format("YYYY-MM-DD");
  const RATING_LABELS = ["Excellent", "Great", "Good", "Average"];
  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return; // wait until user is available

    axios
      .get(`http://localhost:5000/reviews?doctorId=${user.id}`)
      .then((res) => {
        setReviews(res.data);
        console.log("Fetched reviews:", res.data);
      })
      .catch((err) => {
        console.error("Failed to load reviews", err);
      });
  }, [user?.id]); // run when doctor ID changes

  const ratingStats = useMemo(() => {
    const counts = { Excellent: 0, Great: 0, Good: 0, Average: 0 };

    reviews.forEach((r) => {
      if (r.rating >= 5) counts.Excellent++;
      else if (r.rating >= 4) counts.Great++;
      else if (r.rating >= 3) counts.Good++;
      else counts.Average++;
    });

    const total = reviews.length || 1; // avoid division by zero

    return RATING_LABELS.map((label) => ({
      label,
      percentage: ((counts[label] / total) * 100).toFixed(1),
    }));
  }, [reviews]);

  useEffect(() => {
    if (!user || user.role !== "doctor") return;

    // Fetch doctor profile
    axiosInstance
      .get(`/doctors/${user.id}`)
      .then((res) => setDoctor(res.data))
      .catch(() => toast.error("Failed to load doctor profile"));

    // Fetch appointments for this doctor
    axiosInstance
      .get(`/appointments?doctorId=${user.id}`)
      .then((res) => setAppointments(res.data))
      .catch(() => toast.error("Failed to load appointments"));
  }, [user]);

  // Total unique patients
  const totalPatients = useMemo(() => {
    const uniquePatients = new Set(appointments.map((a) => a.patientId));
    return uniquePatients.size;
  }, [appointments]);

  // Today's appointments
  // Today's appointments (status confirmed, not completed)
  const todayAppointments = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          a.status === "confirmed" &&
          a.iscompleted === false &&
          dayjs(a.appointmentDate).isSame(dayjs(), "day")
      )
      .sort((a, b) => {
        const timeA = dayjs(a.appointmentTime, ["h:mm A"]);
        const timeB = dayjs(b.appointmentTime, ["h:mm A"]);
        return timeA.isBefore(timeB) ? -1 : 1;
      });
  }, [appointments]);

  // Upcoming appointments (status confirmed, not completed)
  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          a.status === "confirmed" &&
          a.iscompleted === false &&
          dayjs(a.appointmentDate).isAfter(dayjs(), "day")
      )
      .sort((a, b) => {
        if (a.appointmentDate !== b.appointmentDate) {
          return a.appointmentDate.localeCompare(b.appointmentDate);
        }
        const timeA = dayjs(a.appointmentTime, ["h:mm A"]);
        const timeB = dayjs(b.appointmentTime, ["h:mm A"]);
        return timeA.isBefore(timeB) ? -1 : 1;
      });
  }, [appointments]);

  // Pending appointment requests (status booked, not completed)
  const pendingAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.status === "booked" && a.iscompleted === false)
      .sort((a, b) => {
        if (a.appointmentDate !== b.appointmentDate) {
          return a.appointmentDate.localeCompare(b.appointmentDate);
        }
        const timeA = dayjs(a.appointmentTime, ["h:mm A"]);
        const timeB = dayjs(b.appointmentTime, ["h:mm A"]);
        return timeA.isBefore(timeB) ? -1 : 1;
      });
  }, [appointments]);

  const nextPatient = todayAppointments[0] || null;
  const todayPatients = todayAppointments.length;

  // Pie chart data
  const healthStatusData = useMemo(() => {
    const counts: Record<string, number> = { Stable: 0, Mild: 0, Critical: 0 };
    appointments
      .filter((a) => a.iscompleted === true)
      .forEach((a) => {
        const status = a.HeathStatus?.toLowerCase();
        if (status === "stable") counts.Stable++;
        else if (status === "mild") counts.Mild++;
        else if (status === "critical") counts.Critical++;
      });
    return [
      { name: "Stable", value: counts.Stable },
      { name: "Mild", value: counts.Mild },
      { name: "Critical", value: counts.Critical },
    ];
  }, [appointments]);

  // Calendar events placeholder from appointments
  const calendarEvents = useMemo(() => {
    return appointments.map((a) => ({
      title: a.patientName + " - " + a.primaryIssue,
      start: new Date(a.appointmentDate + " " + a.appointmentTime),
      end: new Date(a.appointmentDate + " " + a.appointmentTime),
    }));
  }, [appointments]);

  const CustomDateHeader = ({ date }: { date: Date }) => {
    const dayEvents = calendarEvents.filter((e) =>
      moment(e.start).isSame(date, "day")
    );

    if (dayEvents.length > 0) {
      // Show only the appointment block (blue-500, white text)
      return (
        <div
          style={{
            background: "#3B82F6",
            color: "white",
            borderRadius: "4px",
            padding: "4px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "0.75rem",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
          title={dayEvents[0].title}
        >
          {dayEvents[0].title}
        </div>
      );
    }

    // Default date number
    return <span>{date.getDate()}</span>;
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] font-sans">
      <div className="flex">
        <Sidebar />
        <main className="max-h-screen overflow-scroll flex-1 p-6">
          {/* HEADER */}
          <div className="bg-blue-600 text-white rounded-xl p-6 flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                Hello{" "}
                <span className="text-4xl text-cyan-400">
                  {user?.role === "doctor" ? `Dr. ${doctor?.name}` : user?.name}
                </span>
                ,
              </h1>
              <p className="text-sm mt-1">
                Have a nice day and don’t forget to take care of your health!
              </p>
            </div>
            <img
              src={doctor?.profileImage}
              alt="Doctor"
              className="h-28 rounded-3xl object-cover"
            />
          </div>

          {/* TOP STATS */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <p className="text-gray-500">Total Patients</p>
              <h2 className="text-2xl font-bold text-blue-500">
                {totalPatients}
              </h2>
              <p className="text-gray-400 text-sm">Till Today</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <p className="text-gray-500">Today Patients</p>
              <h2 className="text-2xl font-bold text-blue-500">
                {todayPatients}
              </h2>
              <p className="text-gray-400 text-sm">
                {dayjs().format("DD MMM YYYY")}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <p className="text-gray-500">Total Appointments</p>
              <h2 className="text-2xl font-bold text-blue-500">
                {appointments.length}
              </h2>
              <p className="text-gray-400 text-sm">All Time</p>
            </div>
          </div>

          {/* MIDDLE SECTION */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* PIE CHART */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-gray-700 font-semibold mb-4">
                Patients Summary {dayjs().format("MMMM YYYY")}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={healthStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {healthStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* TODAY APPOINTMENTS */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-gray-700 font-semibold mb-4">
                Today Appointments
              </h3>
              {todayAppointments.length > 0 ? (
                <ul>
                  {todayAppointments.slice(0, 4).map((appt, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between mb-3"
                    >
                      <div>
                        <p className="font-medium">{appt.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {appt.primaryIssue}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-500 px-2 py-1 rounded">
                        {appt.appointmentTime}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No appointments for today</p>
              )}
            </div>

            {/* UPCOMING APPOINTMENTS */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-gray-700 font-semibold mb-4">
                Upcoming Appointments
              </h3>
              {upcomingAppointments.length > 0 ? (
                <ul>
                  {upcomingAppointments.map((appt, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between mb-3"
                    >
                      <div>
                        <p className="font-medium">{appt.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {appt.primaryIssue}
                        </p>
                        <p className="text-xs text-gray-400">
                          {dayjs(appt.appointmentDate).format("DD MMM YYYY")}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-500 px-2 py-1 rounded">
                        {appt.appointmentTime}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No upcoming appointments</p>
              )}
            </div>

            {/* NEXT PATIENT */}
            {/* <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-gray-700 font-semibold mb-4">
                Next Patient Details
              </h3>
              {nextPatient ? (
                <div>
                  <p className="font-medium">{nextPatient.patientName}</p>
                  <p className="text-sm text-gray-500">
                    {nextPatient.primaryIssue}
                  </p>
                  <p className="text-sm mt-2 text-gray-500">
                    Status: {nextPatient.HeathStatus}
                  </p>
                  <p className="text-sm text-gray-500">
                    Time: {nextPatient.appointmentTime}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">No upcoming patients today</p>
              )}
            </div> */}
          </div>

          {/* NEW SECTIONS: 3-COLUMN GRID */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* 1. Patients Review (Static bars) */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-gray-700 font-semibold mb-4">
                Patients Review
              </h3>
              {ratingStats.map((item, idx) => (
                <div key={idx} className="mb-2">
                  <p className="text-sm text-gray-600">
                    {item.label} ({item.percentage}%)
                  </p>
                  <div className="bg-gray-200 h-3 rounded">
                    <div
                      className="h-3 rounded"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: COLORS[idx % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Appointment Requests (status = booked) */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-gray-700 font-semibold mb-4">
                Appointment Requests
              </h3>
              {pendingAppointments.length > 0 ? (
                <ul>
                  {pendingAppointments.slice(0, 5).map((appt, idx) => (
                    <li key={idx} className="flex items-center mb-3">
                      <img
                        src={appt.patientImage || "/default/patient.png"}
                        alt={appt.patientName}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                      />
                      <div>
                        <p className="font-medium">{appt.patientName}</p>
                        <p className="text-sm text-gray-500">
                          {appt.primaryIssue}
                        </p>
                        <p className="text-xs text-gray-400">
                          {dayjs(appt.appointmentDate).format("DD MMM YYYY")}{" "}
                          {appt.appointmentTime}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400">No pending appointments</p>
              )}
            </div>

            {/* 3. Calendar */}
            <div className="bg-white p-4 rounded-xl shadow">
              <h3 className="text-gray-700 font-semibold mb-4">Calendar</h3>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 300 }}
                views={["month"]}
                components={{
                  month: {
                    dateHeader: CustomDateHeader,
                  },
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
