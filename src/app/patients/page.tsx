"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi";
import { MdOutlineFilterAlt } from "react-icons/md";
import { BiExport } from "react-icons/bi";
import { FaEllipsisV, FaHistory } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import CreatePrescriptionModal from "@/components/CreatePrescriptionModal";
import Sidebar from "@/components/DoctorSlideBar";
import Link from "next/link";
import { useUser } from "@/context/UseContext-login";

// Dummy patient data
type Patient = {
  id: string;
  name: string;
  appointmentDate: string;
  age: number;
  dob: string;
  gender: string;
  diagnosis: string;
  status: "Stable" | "Mild" | "Critical";
  avatarUrl: string;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { user } = useUser();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("http://localhost:5000/appointments"); // Update port if needed
        const data = await res.json();

        console.log("All appointments:", data);

        // Filter appointments by logged-in doctor and completed status
        const doctorAppointments = data.filter(
          (item: any) => item.iscompleted === true && item.doctorId === user.id
        );

        console.log("Doctor's completed appointments:", doctorAppointments);

        // Map to Patient type
        const mappedPatients: Patient[] = doctorAppointments.map(
          (item: any) => ({
            id: item.id,
            name: item.patientName,
            appointmentDate: item.appointmentDate,
            age: 0, // You can calculate from DOB if available
            dob: "N/A",
            gender: item.gender,
            diagnosis: "N/A",
            status: ["Stable", "Mild", "Critical"].includes(item.HeathStatus)
              ? item.HeathStatus
              : "Stable",
            avatarUrl: "/avatars/default.jpg",
          })
        );

        setPatients(mappedPatients);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };

    fetchPatients();
  }, [user?.id]); // Add user.id as dependency

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 bg-gray-50 min-h-screen w-full">
        <div className="grid grid-cols-4 gap-6 mb-6">
          <SummaryCard label="Total patients" count={352} color="text-black" />
          <SummaryCard
            label="Mild patients"
            count={180}
            color="text-yellow-500"
          />
          <SummaryCard
            label="Stable patients"
            count={150}
            color="text-blue-500"
          />
          <SummaryCard
            label="Critical patients"
            count={22}
            color="text-red-500"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient.."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm bg-white"
              />
              <FiSearch
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm bg-white"
              >
                <option value="">All Status</option>
                <option value="Stable">Stable</option>
                <option value="Mild">Mild</option>
                <option value="Critical">Critical</option>
              </select>
              <MdOutlineFilterAlt
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>

          <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            <BiExport size={18} /> Export
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl shadow bg-white">
          <table className="min-w-full table-auto">
            <thead className="bg-blue-600 text-white text-left text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Last appointment</th>
                <th className="px-6 py-4 font-medium">Age</th>
                <th className="px-6 py-4 font-medium">Date of birth</th>
                <th className="px-6 py-4 font-medium">Gender</th>
                <th className="px-6 py-4 font-medium">Diagnosis</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((p) => (
                <tr key={p.id} className="border-b hover:bg-blue-50 text-sm">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src="/default/patient.png"
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <Link href={`/patients/${p.name}`}>{p.name}</Link>
                  </td>
                  <td className="px-6 py-4">{p.appointmentDate}</td>
                  <td className="px-6 py-4">{p.age}</td>
                  <td className="px-6 py-4">{p.dob}</td>
                  <td className="px-6 py-4">{p.gender}</td>
                  <td className="px-6 py-4">{p.diagnosis}</td>

                  <td className="px-6 py-4">
                    {editingPatientId === p.id ? (
                      <select
                        value={p.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value as Patient["status"];
                          try {
                            await fetch(
                              `http://localhost:5000/appointments/${p.id}`,
                              {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  HeathStatus: newStatus,
                                }),
                              }
                            );

                            setPatients((prev) =>
                              prev.map((patient) =>
                                patient.id === p.id
                                  ? { ...patient, status: newStatus }
                                  : patient
                              )
                            );

                            toast.success("Status updated successfully");
                          } catch (error) {
                            toast.error("Failed to update status");
                            console.error(error);
                          } finally {
                            setEditingPatientId(null);
                          }
                        }}
                        onBlur={() => setEditingPatientId(null)}
                        autoFocus
                        className={`cursor-pointer inline-block text-xs font-semibold px-3 py-1 rounded-full transition duration-200 focus:outline-none
                          ${
                            p.status === "Stable"
                              ? "bg-blue-100 text-blue-600"
                              : p.status === "Mild"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                          }
                        `}
                      >
                        <option value="Stable">Stable</option>
                        <option value="Mild">Mild</option>
                        <option value="Critical">Critical</option>
                      </select>
                    ) : (
                      <span
                        onClick={() => setEditingPatientId(p.id)}
                        className={`cursor-pointer inline-block px-3 py-1 text-xs rounded-full font-semibold transition duration-200 hover:opacity-80 ${
                          p.status === "Stable"
                            ? "bg-blue-100 text-blue-600"
                            : p.status === "Mild"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {p.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="relative inline-block text-left">
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === p.id ? null : p.id
                          )
                        }
                      >
                        <FaEllipsisV />
                      </button>

                      {openDropdownId === p.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                          <button
                            onClick={() => {
                              window.location.href = `/patients/${encodeURIComponent(
                                p.name
                              )}`;
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatient(p);
                              setOpenCreate(true);
                              setOpenDropdownId(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Add Prescription
                          </button>
                          <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Link
                              className="flex gap-2"
                              href={`/patients/History/${p.id}`}
                            >
                              <FaHistory
                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                size={18}
                              />
                              History
                            </Link>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-gray-500 mt-4">
          Showing {filteredPatients.length} of {patients.length} entries
        </div>
        {selectedPatient && (
          <CreatePrescriptionModal
            isOpen={openCreate}
            onClose={() => setOpenCreate(false)}
            appointmentId={selectedPatient.id}
            patientId={selectedPatient.id} // replace with actual patient.medicalNumber if available
            onCreated={() => {
              setOpenCreate(false);
              location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow rounded-2xl p-6 flex flex-col items-center text-center"
    >
      <h3 className="text-2xl font-bold mb-2">{count}</h3>
      <p className={`text-sm font-semibold ${color}`}>{label}</p>
    </motion.div>
  );
}
