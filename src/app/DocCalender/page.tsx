"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import {
  CheckCircle,
  RefreshCcw,
  XCircle,
  X,
  CalendarDays,
  Clock,
  Check,
} from "lucide-react";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import axios from "axios";

import { useUser } from "@/context/UseContext-login";
import Sidebar from "@/components/DoctorSlideBar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-styles.css";
import { ArrowLeft, ArrowRight } from "lucide-react";

import toast from "react-hot-toast";
import CalendarHeader from "./HeaderCalender";

const localizer = momentLocalizer(moment);

type Appointment = {
  id: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  location: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  status: string;
};

export default function CalendarPage() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<CalendarEvent[]>([]);
  const [currentRange, setCurrentRange] = useState<{ start: Date; end: Date }>({
    start: moment().startOf("month").toDate(),
    end: moment().endOf("month").toDate(),
  });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const [currentView, setCurrentView] = useState<Views>("month");

  const DnDCalendar = withDragAndDrop(Calendar);

  const handleEventDrop = async ({ event, start, end }: any) => {
    try {
      const newDate = moment(start).format("YYYY-MM-DD");
      const newTime = moment(start).format("HH:mm");

      const updatedData = {
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: "rescheduled",
      };

      await axios.patch(
        `http://localhost:5000/appointments/${event.id}`,
        updatedData
      );

      setAppointments((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? {
                ...e,
                start,
                end,
                status: "rescheduled",
              }
            : e
        )
      );

      toast.success("Appointment rescheduled via drag");
    } catch (err) {
      console.error("Error during drag reschedule:", err);
      toast.error("Failed to reschedule appointment");
    }
  };

  const handleViewChange = (newView: Views) => {
    setCurrentView(newView);
  };
  const handleNavigate = (date: Date, view?: Views) => {
    setCurrentDate(date); // <- update view date
    const resolvedView = view ?? currentView;

    let start: Date, end: Date;

    if (resolvedView === "month") {
      start = moment(date).startOf("month").toDate();
      end = moment(date).endOf("month").toDate();
    } else if (resolvedView === "week") {
      start = moment(date).startOf("week").toDate();
      end = moment(date).endOf("week").toDate();
    } else {
      start = moment(date).startOf("day").toDate();
      end = moment(date).endOf("day").toDate();
    }

    setCurrentRange({ start, end });
  };

  const fetchAppointments = useCallback(
    async (range: { start: Date; end: Date }) => {
      try {
        const res = await axios.get("http://localhost:5000/appointments");
        const allAppointments: Appointment[] = res.data;

        const doctorAppointments = allAppointments.filter((appt) => {
          const apptDate = new Date(appt.appointmentDate);
          return (
            appt.doctorId === user?.id &&
            apptDate >= range.start &&
            apptDate <= range.end
          );
        });

        const events: CalendarEvent[] = doctorAppointments.map((appt) => {
          const [hours, minutesPart] = appt.appointmentTime
            .replace(/(am|pm)/i, "")
            .trim()
            .split(":");
          let hour = parseInt(hours);
          const minutes = parseInt(minutesPart) || 0;

          if (appt.appointmentTime.toLowerCase().includes("pm") && hour < 12)
            hour += 12;

          const [year, month, day] = appt.appointmentDate
            .split("-")
            .map(Number);
          const start = new Date(year, month - 1, day, hour, minutes);
          const end = new Date(start.getTime() + 30 * 60 * 1000);

          return {
            ...appt,
            id: appt.id,
            title: `Patient: ${appt.patientName} (${appt.status})`,
            start,
            end,
            allDay: false,
            status: appt.status,
          };
        });

        setAppointments(events);
      } catch (err) {
        console.error("Error fetching appointments", err);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (!user?.id) return;
    fetchAppointments(currentRange);
  }, [fetchAppointments, currentRange, user?.id]);

  const handleRangeChange = (range: any, view: Views) => {
    let start: Date, end: Date;

    if (view === "day") {
      start = moment(range).startOf("day").toDate();
      end = moment(range).endOf("day").toDate();
    } else if (Array.isArray(range)) {
      start = range[0];
      end = range[range.length - 1];
    } else if (range?.start && range?.end) {
      start = range.start;
      end = range.end;
    } else {
      return;
    }

    setCurrentRange({ start, end });
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedEvent) return;

    if (newStatus === "rescheduled") {
      setShowRescheduleModal(true);
      return;
    }

    const updatedAppointment = {
      ...selectedEvent,
      status: newStatus,
    };

    try {
      await axios.put(
        `http://localhost:5000/appointments/${selectedEvent.id}`,
        updatedAppointment
      );

      toast.success(`Appointment ${newStatus}`);

      setAppointments((prev) =>
        prev.map((event) =>
          event.id === selectedEvent.id ? updatedAppointment : event
        )
      );

      setShowModal(false);
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedEvent || !newDate || !newTime) {
      toast.error("Please select date and time");
      return;
    }

    const updatedData = {
      appointmentDate: newDate,
      appointmentTime: newTime,
      status: "rescheduled",
    };

    try {
      await axios.patch(
        `http://localhost:5000/appointments/${selectedEvent.id}`,
        updatedData
      );

      toast.success("Appointment rescheduled");

      setAppointments((prev) =>
        prev.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                start: new Date(`${newDate}T${newTime}`),
                end: new Date(
                  new Date(`${newDate}T${newTime}`).getTime() + 30 * 60000
                ),
                status: "rescheduled",
              }
            : event
        )
      );

      setShowRescheduleModal(false);
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to reschedule");
      console.error(err);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="h-[90vh] p-4">
        <h2 className="text-xl font-bold mb-4">
          Doctor's Appointment Calendar
        </h2>

        <DnDCalendar
          className="custom-calendar"
          localizer={localizer}
          events={appointments}
          startAccessor="start"
          endAccessor="end"
          onNavigate={(date, view) => handleNavigate(date, view ?? currentView)}
          components={{
            toolbar: (props) => {
              const { label, onNavigate, onView, view } = props;

              return (
                <div className="rbc-toolbar flex justify-between items-center mb-4 gap-4 flex-wrap">
                  {/* Left Section: Navigation */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigate("PREV")}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      onClick={() => onNavigate("TODAY")}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => onNavigate("NEXT")}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  {/* Center: Label */}
                  <div className="font-bold text-lg">{label}</div>

                  {/* Right Section: View Switch */}
                  <div className="space-x-2">
                    {["month", "week", "day"].map((v) => (
                      <button
                        key={v}
                        onClick={() => onView(v)}
                        className={`px-3 py-1 rounded ${
                          view === v
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            },
          }}
          defaultView="month"
          onSelectEvent={(event) => {
            setSelectedEvent(event);
            setShowModal(true);
          }}
          view={currentView}
          onView={handleViewChange}
          views={["month", "week", "day"]}
          style={{ height: "100%", minWidth: "900px" }}
          onRangeChange={handleRangeChange}
          onEventDrop={handleEventDrop} // <-- Drag event handler
          draggableAccessor={() => true} // <-- Make all events draggable
          popup
          eventPropGetter={(event) => {
            let bg = "#3b82f6";
            if (event.status === "cancelled") bg = "#ef4444";
            else if (event.status === "rescheduled") bg = "#f59e0b";
            else if (event.status === "confirmed") bg = "#10b981";

            return {
              style: {
                backgroundColor: bg,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "4px 8px",
              },
              title: `Patient: ${event.title}`,
            };
          }}
          date={currentDate} // <- controls what is rendered
          onNavigate={handleNavigate}
        />

        {showModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transition-all duration-300 border border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-4">
                <h3 className="text-2xl font-semibold text-blue-600 mb-1">
                  Appointment Details
                </h3>
                <p className="text-gray-500 text-sm">
                  Manage appointment status with quick actions
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="text-blue-500" />
                  <span className="font-medium">Date:</span>{" "}
                  {moment(selectedEvent.start).format("YYYY-MM-DD")}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-green-500" />
                  <span className="font-medium">Time:</span>{" "}
                  {moment(selectedEvent.start).format("hh:mm A")} -{" "}
                  {moment(selectedEvent.end).format("hh:mm A")}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Patient:</span>{" "}
                  {selectedEvent.title.split("(")[0]}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>{" "}
                  {selectedEvent.status.charAt(0).toUpperCase() +
                    selectedEvent.status.slice(1)}
                </div>
              </div>

              <div className="flex justify-around mt-6 gap-2">
                <button
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full shadow-md"
                  onClick={() => handleStatusChange("confirmed")}
                >
                  <CheckCircle size={18} />
                  Confirm
                </button>

                <button
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full shadow-md"
                  onClick={() => handleStatusChange("rescheduled")}
                >
                  <RefreshCcw size={18} />
                  Reschedule
                </button>

                <button
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md"
                  onClick={() => handleStatusChange("cancelled")}
                >
                  <XCircle size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showRescheduleModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
            <div className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 transition-all duration-300">
              {/* Close Button */}
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-4">
                <h3 className="text-2xl font-semibold text-indigo-600 mb-1">
                  Reschedule Appointment
                </h3>
                <p className="text-gray-500 text-sm">
                  Choose a new date and time
                </p>
              </div>

              <div className="space-y-4">
                {/* New Date Input */}
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays size={16} className="text-indigo-500" />
                    New Date:
                  </div>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </label>

                {/* New Time Input */}
                <label className="block text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={16} className="text-green-500" />
                    New Time:
                  </div>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </label>
              </div>

              <div className="flex justify-between gap-4 mt-6">
                <button
                  onClick={handleRescheduleSubmit}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow"
                >
                  <Check size={18} />
                  Submit
                </button>

                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-black"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
