"use client";

import { useEffect, useState, useMemo, useRef } from "react";

import {
  FaEdit,
  FaCapsules,
  FaUserCircle,
  FaCalendarCheck,
  FaTrashAlt,
  FaClock,
  FaStickyNote,
  FaDownload,
  FaUserMd,
  FaUser,
  FaVenusMars,
  FaPhoneAlt,
  FaEnvelope,
  FaIdCard,
  FaNotesMedical,
} from "react-icons/fa";

import { toPng } from "html-to-image";
import { useParams } from "next/navigation";
import Sidebar from "@/components/DoctorSlideBar";
import PrescriptionView from "@/components/viewPrescription";
import AddMedicineForm from "@/components/Addmedicine";
import CreatePrescriptionModal from "@/components/CreatePrescriptionModal";
import EditPrescriptionModal from "@/components/EditPrescriptionModal";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useUser } from "@/context/UseContext-login";
import { GiHeartBeats } from "react-icons/gi";

type Appointment = {
  id: string;
  patientName: string;
  phoneNumber: string;
  gender: string;
  appointmentDate: string;
  appointmentTime?: string;
  doctorName?: string;
  specialization?: string;
  location?: string;
  fee?: string;
  email?: string;
  primaryIssue: any;
  status?: string;
  isCompleted?: boolean;
  diagnosis?: string;
};

type Medicine = {
  medicine: string;
  dosage?: string;
  duration?: string;
  route?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
};

type Prescription = {
  id: string;
  appointmentId: string;
  patientId: string;
  date: string;
  diagnosis?: string;
  medicines: Medicine[];
  advice?: string[];
  notes?: string;
  doctorName?: string;
  doctorSpecialization?: string;
  clinicName?: string;
  clinicAddress?: string;
  followUpDate?: string;
  vitals?: Record<string, any>;
};

export default function PatientPage() {
  const { patientName } = useParams();
  const { user } = useUser();

  // States
  const [activeTab, setActiveTab] = useState<
    "profile" | "history" | "prescriptions"
  >("profile");
  const [loading, setLoading] = useState(true);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>(
    []
  );
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [openAddMedicine, setOpenAddMedicine] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedMedicineIndex, setSelectedMedicineIndex] = useState<
    number | null
  >(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const [primaryIssuesList, setPrimaryIssuesList] = useState<
    { category: string; issues: string[] }[]
  >([]);
  const [editingPrimaryIssue, setEditingPrimaryIssue] = useState(false);
  const [selectedPrimaryIssue, setSelectedPrimaryIssue] = useState<string>("");

  // Refs for PDF generation
  const historyRef = useRef<HTMLDivElement>(null);

  // Fetch data

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const apptRes = await fetch("http://localhost:5000/appointments");
      const apptData: any = await apptRes.json();

      const prescRes = await fetch("http://localhost:5000/prescriptions");
      const prescData: any = await prescRes.json();

      // Filter appointments belonging to logged-in doctor

      const doctorAppts = apptData.filter((a: any) => a.doctorId === user?.id);

      // Then filter by patientName
      const matchedAppts = doctorAppts
        .filter(
          (a: any) =>
            a.patientName.toLowerCase() ===
            decodeURIComponent(patientName as string).toLowerCase()
        )
        .sort(
          (a: any, b: any) =>
            new Date(b.appointmentDate).getTime() -
            new Date(a.appointmentDate).getTime()
        );

      if (!matchedAppts.length) {
        setPatientInfo(null);
        setPatientAppointments([]);
        setPrescriptions([]);
        setLoading(false);
        return;
      }

      const firstAppt = matchedAppts[0];
      setPatientInfo({
        name: firstAppt.patientName,
        gender: firstAppt.gender,
        phone: firstAppt.phoneNumber,
        email: firstAppt.email || "Not Provided",
        medicalNumber: firstAppt.id,
        status: firstAppt.status || "N/A",
        primaryIssue: firstAppt.primaryIssue || "",
      });
      setSelectedStatus(firstAppt.status);
      setSelectedPrimaryIssue(firstAppt.primaryIssue || "");

      // Filter prescriptions belonging to these appointments
      const matchedPrescriptions = prescData.filter((p: any) =>
        matchedAppts.some((a: any) => a.id === p.appointmentId)
      );

      setPatientAppointments(matchedAppts);
      setPrescriptions(matchedPrescriptions);
    } catch (error) {
      console.error("Failed to fetch patient data", error);
      toast.error("Failed to fetch patient data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientName) fetchPatientData();
  }, [patientName]);

  // Health Status update
  const updateHealthStatus = async (newStatus: string) => {
    if (!patientInfo) return;
    try {
      await fetch(
        `http://localhost:5000/appointments/${patientInfo.medicalNumber}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      setSelectedStatus(newStatus);
      setEditingStatus(false);
      setPatientAppointments((aps) =>
        aps.map((a) =>
          a.id === patientInfo.medicalNumber ? { ...a, status: newStatus } : a
        )
      );
    } catch {
      toast.error("Failed to update health status");
    }
  };

  // Primary Issue update
  const updatePrimaryIssue = async (newIssue: string) => {
    if (!patientInfo?.medicalNumber) {
      toast.error("No appointment name found");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/appointments/${patientInfo.medicalNumber}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ primaryIssue: newIssue }),
        }
      );

      if (!res.ok) {
        // Read text instead of JSON if error
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const updatedData = await res.json(); // Only parse JSON if ok
      console.log("Updated:", updatedData);

      setPatientInfo((prev: any) => ({ ...prev, primaryIssue: newIssue }));
      setSelectedPrimaryIssue(newIssue);
      setEditingPrimaryIssue(false);
      toast.success("Primary issue updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update primary issue");
    }
  };

  // Fetch primary issues list
  useEffect(() => {
    fetch("http://localhost:5000/PrimaryIssue")
      .then(async (res) => {
        if (!res.ok) {
          // Get text for debugging
          const errorText = await res.text();
          throw new Error(
            `PrimaryIssue fetch failed: ${res.status} ${errorText}`
          );
        }
        return res.json();
      })
      .then((data) => setPrimaryIssuesList(data))
      .catch((err) => {
        console.error("Failed to fetch primary issues", err);
        setPrimaryIssuesList([]); // fallback to empty
      });
  }, []);

  const filteredAppointments = useMemo(() => {
    if (!filterStartDate && !filterEndDate) return patientAppointments;
    return patientAppointments.filter((appt) => {
      const apptDate = new Date(appt.appointmentDate);
      if (filterStartDate && apptDate < new Date(filterStartDate)) return false;
      if (filterEndDate && apptDate > new Date(filterEndDate)) return false;
      return true;
    });
  }, [patientAppointments, filterStartDate, filterEndDate]);

  const prescByAppointment = useMemo(() => {
    const map = new Map<string, Prescription>();
    prescriptions.forEach((p) => map.set(p.appointmentId, p));
    return map;
  }, [prescriptions]);

  // Patch the internal parseColor function

  const downloadPDF = async () => {
    if (!historyRef.current) return;

    try {
      const dataUrl = await toPng(historyRef.current, {
        cacheBust: true,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Patient_History.pdf");
    } catch (err) {
      console.error("PDF download error:", err);
    }
  };

  if (loading)
    return (
      <div className="p-6 flex justify-center items-center text-blue-500 font-semibold animate-pulse">
        Loading patient data...
      </div>
    );
  if (!patientInfo)
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Patient not found.
      </div>
    );

  const totalAppointments = patientAppointments.length;
  const totalPrescriptions = prescriptions.length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="max-h-screen overflow-scroll flex-grow p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <section className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <FaUserCircle className="text-blue-500 text-7xl" />
            <div>
              <h1 className="text-4xl font-extrabold text-blue-700">
                {patientInfo.name}
              </h1>
              <p className="text-gray-700">
                Gender:{" "}
                <span className="font-semibold">{patientInfo.gender}</span> |
                Phone:{" "}
                <span className="font-semibold">{patientInfo.phone}</span> |
                Email:{" "}
                <span className="font-semibold">{patientInfo.email}</span>
              </p>
              <p className="mt-1 text-gray-600">
                Medical Number:{" "}
                <span className="font-semibold">
                  {patientInfo.medicalNumber}
                </span>
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Health Status</p>
            {!editingStatus ? (
              <div className="flex items-center gap-2 justify-center">
                <span
                  className={`px-3 py-1 rounded-full font-semibold ${
                    selectedStatus === "stable"
                      ? "bg-green-200 text-green-800"
                      : selectedStatus === "mild"
                      ? "bg-yellow-200 text-yellow-800"
                      : selectedStatus === "critical"
                      ? "bg-red-200 text-red-800"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {selectedStatus || "N/A"}
                </span>
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => setEditingStatus(true)}
                >
                  <FaEdit />
                </button>
              </div>
            ) : (
              <select
                value={selectedStatus}
                onChange={(e) => updateHealthStatus(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1"
              >
                <option value="stable">Stable</option>
                <option value="mild">Mild</option>
                <option value="critical">Critical</option>
              </select>
            )}
          </div>
        </section>

        {/* Tabs */}
        <nav className="flex space-x-6 border-b border-gray-300 pb-3 text-blue-700 font-semibold text-lg">
          {[
            { label: "Profile", value: "profile", icon: <FaUserCircle /> },
            { label: "History", value: "history", icon: <FaClock /> },
            {
              label: "Prescriptions",
              value: "prescriptions",
              icon: <FaCapsules />,
            },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value as any)}
              className={`flex items-center gap-2 pb-1 border-b-4 ${
                activeTab === tab.value
                  ? "border-blue-600"
                  : "border-transparent"
              } hover:border-blue-400 transition`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <section>
          {activeTab === "profile" && (
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-3xl shadow-2xl border border-gray-200 max-w-5xl mx-auto backdrop-blur-lg">
              <h2 className="text-3xl font-bold mb-6 text-blue-800 flex items-center gap-3">
                <FaUserMd className="text-blue-600" />
                Patient Profile
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/70 shadow-sm hover:shadow-md transition-all">
                  <FaUser className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Name</p>
                    <p className="text-lg font-medium text-gray-900">
                      {patientInfo.name}
                    </p>
                  </div>
                </div>

                {/* Gender */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/70 shadow-sm hover:shadow-md transition-all">
                  <FaVenusMars className="text-pink-500 text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Gender
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {patientInfo.gender}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/70 shadow-sm hover:shadow-md transition-all">
                  <FaPhoneAlt className="text-green-500 text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Phone</p>
                    <p className="text-lg font-medium text-gray-900">
                      {patientInfo.phone}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/70 shadow-sm hover:shadow-md transition-all">
                  <FaEnvelope className="text-orange-500 text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Email</p>
                    <p className="text-lg font-medium text-gray-900">
                      {patientInfo.email}
                    </p>
                  </div>
                </div>

                {/* Medical Number */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/70 shadow-sm hover:shadow-md transition-all">
                  <FaIdCard className="text-purple-500 text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Medical Number
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {patientInfo.medicalNumber}
                    </p>
                  </div>
                </div>

                {/* Primary Issue */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/70 shadow-sm hover:shadow-md transition-all">
                  <FaNotesMedical className="text-red-500 text-xl mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-500 flex items-center gap-2">
                      Primary Issue
                      {!editingPrimaryIssue && (
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => setEditingPrimaryIssue(true)}
                        >
                          <FaEdit />
                        </button>
                      )}
                    </p>
                    <div className="mt-1">
                      {editingPrimaryIssue ? (
                        <select
                          value={selectedPrimaryIssue}
                          onChange={(e) => updatePrimaryIssue(e.target.value)}
                          className="rounded-lg border border-gray-300 px-3 py-2 w-full shadow-sm focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">-- Select Issue --</option>
                          {primaryIssuesList.map((group, idx) => (
                            <optgroup key={idx} label={group.category}>
                              {group.issues.map((issue, i) => (
                                <option key={i} value={issue}>
                                  {issue}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      ) : patientInfo.primaryIssue ? (
                        <p className="text-lg font-medium text-gray-900">
                          {patientInfo.primaryIssue}
                        </p>
                      ) : (
                        <span className="text-red-500 italic">
                          Please add/select primary issue
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Current Health Status */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/70 shadow-sm hover:shadow-md transition-all">
                  <GiHeartBeats className="text-pink-500 text-xl" />
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      Current Health Status
                    </p>
                    <p className="text-lg font-medium text-gray-900">
                      {selectedStatus || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 max-w-7xl">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-3">
                  <FaClock /> Medical History
                </h2>

                <div className="flex gap-4 items-center">
                  <div className="flex flex-col">
                    <label
                      htmlFor="startDate"
                      className="text-gray-700 font-semibold text-sm"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      className="border border-gray-300 rounded px-3 py-1"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      max={filterEndDate || undefined}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label
                      htmlFor="endDate"
                      className="text-gray-700 font-semibold text-sm"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      className="border border-gray-300 rounded px-3 py-1"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      min={filterStartDate || undefined}
                    />
                  </div>

                  <button
                    onClick={() => {
                      setFilterStartDate("");
                      setFilterEndDate("");
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Clear Filters
                  </button>

                  <button
                    onClick={downloadPDF}
                    className="ml-4 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                    aria-label="Download medical history as PDF"
                  >
                    <FaDownload />
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Analytics */}
              <div className="mb-6 flex gap-6 max-w-4xl flex-wrap">
                <div className="bg-blue-100 text-blue-700 rounded-2xl p-4 flex-1 min-w-[180px] text-center shadow">
                  <p className="text-xl font-extrabold">{totalAppointments}</p>
                  <p className="font-semibold">Total Appointments</p>
                </div>
                <div className="bg-blue-100 text-blue-700 rounded-2xl p-4 flex-1 min-w-[180px] text-center shadow">
                  <p className="text-xl font-extrabold">{totalPrescriptions}</p>
                  <p className="font-semibold">Total Prescriptions</p>
                </div>
              </div>

              {/* History List */}
              <div
                ref={historyRef}
                className="space-y-8 max-w-5xl mx-auto bg-white p-6 rounded-3xl shadow-lg border border-gray-200"
              >
                {filteredAppointments.length === 0 && (
                  <p className="text-center italic text-gray-500">
                    No appointments found in this date range.
                  </p>
                )}
                {filteredAppointments.map((appt) => {
                  const presc = prescByAppointment.get(appt.id);
                  return (
                    <article
                      key={appt.id}
                      className="border border-gray-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <header className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-blue-600 font-semibold text-lg">
                            {new Date(appt.appointmentDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                            {appt.appointmentTime &&
                              ` • ${appt.appointmentTime}`}
                          </p>
                          <p className="font-semibold text-gray-800">
                            {appt.doctorName || "Clinic Doctor"}
                          </p>
                          <p className="text-gray-600">
                            {appt.specialization || ""}
                          </p>
                          <p className="text-gray-600">{appt.location || ""}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-700 font-bold text-lg">
                            {appt.fee ? `₹${appt.fee}` : "-"}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                              appt.status === "stable"
                                ? "bg-green-200 text-green-800"
                                : appt.status === "mild"
                                ? "bg-yellow-200 text-yellow-800"
                                : appt.status === "critical"
                                ? "bg-red-200 text-red-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {appt.status || "N/A"}
                          </span>
                        </div>
                      </header>

                      <div className="mb-4">
                        <h4 className="text-blue-600 font-semibold mb-1">
                          Diagnosis
                        </h4>
                        <p>{presc?.diagnosis || appt.primaryIssue || "N/A"}</p>
                      </div>

                      <div>
                        <h4 className="text-blue-600 font-semibold mb-2 flex items-center gap-2">
                          <FaCapsules /> Prescriptions
                        </h4>
                        {presc?.medicines?.length ? (
                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                            {presc.medicines.map((med, i) => (
                              <li key={i}>
                                <span className="font-semibold">
                                  {med.medicine}
                                </span>{" "}
                                {med.dosage ? `- ${med.dosage}` : ""}{" "}
                                {med.duration ? `(${med.duration})` : ""}{" "}
                                {med.notes ? `• ${med.notes}` : ""}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="italic text-gray-400">
                            No prescription found
                          </p>
                        )}
                      </div>

                      {presc?.advice && presc.advice.length > 0 && (
                        <div className="mt-3">
                          <h5 className="font-semibold text-blue-600">
                            Advices
                          </h5>
                          <ul className="list-disc list-inside text-gray-700">
                            {presc.advice.map((advic, i) => (
                              <li key={i}>{advic}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 max-w-5xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-3">
                  <FaCapsules /> Prescriptions
                </h2>
                <button
                  onClick={() => setOpenAddMedicine(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                >
                  ➕ Add Medicine
                </button>
              </div>

              {prescriptions.length === 0 && (
                <p className="italic text-gray-500">No prescriptions found.</p>
              )}

              {prescriptions.map((presc, idx) => (
                <div key={presc.id} className="mb-8  ">
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="font-semibold text-blue-600">
                        Date:{" "}
                        {new Date(presc.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-gray-800 font-semibold">
                        Doctor: {presc.doctorName || "Clinic Doctor"}
                      </p>
                    </div>
                    <div className="text-right">
                      {/* Optional controls for edit/delete could go here */}
                    </div>
                  </div>

                  <PrescriptionView
                    patientName={patientInfo.name}
                    patientId={patientInfo.medicalNumber}
                    patientAge={patientInfo.age}
                    patientGender={patientInfo.gender}
                    clinicAddress={patientInfo.address}
                    medicines={presc.medicines as any}
                    doctorName={presc.doctorName || "Clinic Doctor"}
                    date={presc.date}
                    advice={presc.advice || []}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modals */}
        {openAddMedicine && (
          <AddMedicineForm
            isOpen={openAddMedicine}
            onClose={() => setOpenAddMedicine(false)}
            onSave={async (newMed) => {
              // For demo, just add to first prescription if exists
              if (!prescriptions.length) {
                toast.error("No prescriptions to add medicine to.");
                return;
              }
              const presc = prescriptions[0];
              const updatedMeds = [...presc.medicines, newMed];
              try {
                await fetch(`http://localhost:5000/prescriptions/${presc.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ medicines: updatedMeds }),
                });
                // Refresh
                fetchPatientData();
                setOpenAddMedicine(false);
                toast.success("Medicine added");
              } catch {
                toast.error("Failed to add medicine");
              }
            }}
          />
        )}

        {openCreate && (
          <CreatePrescriptionModal
            isOpen={openCreate}
            onClose={() => setOpenCreate(false)}
            prescriptionId={prescriptions[0]?.id || ""}
            onCreated={fetchPatientData}
          />
        )}

        {openEdit && selectedMedicineIndex !== null && (
          <EditPrescriptionModal
            isOpen={openEdit}
            onClose={() => setOpenEdit(false)}
            prescriptionId={prescriptions[0]?.id || ""}
            medicineIndex={selectedMedicineIndex}
            currentMedicine={prescriptions[0]?.medicines[selectedMedicineIndex]}
            onUpdated={fetchPatientData}
          />
        )}
      </main>
    </div>
  );
}
