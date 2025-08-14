"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { useRouter } from "next/navigation";
import CreatePrescriptionModal from "@/components/CreatePrescriptionModal";
import EditPrescriptionModal from "@/components/EditPrescriptionModal";

import { motion } from "framer-motion";
import { AiOutlinePlus, AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { MdOutlineFilterAlt } from "react-icons/md";
import { FaSortAmountDownAlt } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
import Sidebar from "@/components/DoctorSlideBar";

const FloatingActionButton = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    whileHover={{ scale: 1.16, rotate: 5 }}
    className="p-3 rounded-full bg-white shadow-lg hover:shadow-2xl transition-all cursor-pointer border border-indigo-200"
  >
    {children}
  </motion.div>
);

type Appointment = {
  id: string;
  patientName: string;
  patientId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  isCompleted: boolean;
};

type Prescription = {
  id: string;
  appointmentId: string;
};

export default function PrescriptionDashboard() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortType, setSortType] = useState("newToOld");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState("");
  const [expandedRowIds, setExpandedRowIds] = useState<string[]>([]);

  const toggleRow = (appointmentId: string) => {
    setExpandedRowIds((prev) =>
      prev.includes(appointmentId)
        ? prev.filter((id) => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const appointmentsRes = await axios.get(
      "http://localhost:5000/appointments"
    );
    const prescriptionsRes = await axios.get(
      "http://localhost:5000/prescriptions"
    );
    setAppointments(appointmentsRes.data);
    setPrescriptions(prescriptionsRes.data);
  }

  const filteredAppointments = appointments.filter((a) => {
    console.log(a);
    const matchesSearch = a.patientName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      !statusFilter || a.status?.toLowerCase() === statusFilter.toLowerCase();

    const isCompleted = a.isCompleted === true;

    return matchesSearch && matchesStatus && isCompleted;
  });

  function openCreateModal(appt: Appointment) {
    setSelectedAppt(appt);
    setOpenCreate(true);
  }

  function openEditModal(prescriptionId: string) {
    setSelectedPrescriptionId(prescriptionId);
    setOpenEdit(true);
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="w-full overflow-auto max-h-screen px-6 py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-semibold text-blue-700 mb-8"
          >
            🧾 Prescription Management
          </motion.h1>

          <div className="flex flex-wrap gap-4 mb-8 items-center">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border pl-10 pr-4 py-2 rounded-md w-64 bg-white shadow-sm focus:outline-blue-500 text-sm"
              />
              <FiSearch
                className="absolute left-3 top-2.5 text-gray-500"
                size={18}
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="border pl-10 pr-4 py-2 rounded-md w-56 bg-white shadow-sm focus:outline-blue-500 text-sm"
              >
                <option value="newToOld">Newest to Oldest</option>
                <option value="oldToNew">Oldest to Newest</option>
              </select>
              <FaSortAmountDownAlt
                className="absolute left-3 top-2.5 text-gray-500"
                size={18}
              />
            </div>
          </div>

          {/* Appointment Cards */}
          <div className="grid gap-6">
            {filteredAppointments.map((appt) => {
              const prescription = prescriptions.find(
                (p) => p.appointmentId === appt.id
              );
              const statusColor =
                appt.status === "confirmed"
                  ? "bg-green-500"
                  : appt.status === "rescheduled"
                  ? "bg-yellow-400"
                  : "bg-gray-400";

              return (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  whileHover={{ scale: 1.01 }}
                  className="group relative p-6 rounded-lg shadow-md bg-white border border-gray-200 hover:border-blue-400 transition-all"
                >
                  <div className="flex justify-between items-start">
                    {/* Patient Info */}
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-1">
                        {appt.patientName} — {appt.appointmentTime}
                      </h2>
                      <p className="text-sm text-gray-500 mb-2">
                        {moment(appt.appointmentDate).format(
                          "dddd, MMMM Do YYYY"
                        )}
                      </p>
                      <span
                        className={`${statusColor} text-white text-xs px-2 py-1 rounded-full`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    {/* Floating Action Buttons */}
                    <motion.div
                      className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-6 right-6"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {prescription ? (
                        <>
                          <FloatingActionButton>
                            <AiOutlineEye
                              size={22}
                              onClick={() =>
                                router.push(`/patients/${appt.patientName}`)
                              }
                              className="text-green-600 hover:text-green-700"
                            />
                          </FloatingActionButton>
                          <FloatingActionButton>
                            <AiOutlineEdit
                              size={22}
                              onClick={() => openEditModal(prescription.id)}
                              className="text-yellow-500 hover:text-yellow-600"
                            />
                          </FloatingActionButton>
                        </>
                      ) : (
                        <FloatingActionButton>
                          <AiOutlinePlus
                            size={22}
                            onClick={() => openCreateModal(appt)}
                            className="text-blue-600 hover:text-blue-700"
                          />
                        </FloatingActionButton>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Modals */}
          {selectedAppt && (
            <CreatePrescriptionModal
              isOpen={openCreate}
              onClose={() => setOpenCreate(false)}
              appointmentId={selectedAppt.id}
              patientId={selectedAppt.patientId}
              onCreated={fetchData}
            />
          )}
          {selectedPrescriptionId && (
            <EditPrescriptionModal
              isOpen={openEdit}
              onClose={() => setOpenEdit(false)}
              prescriptionId={selectedPrescriptionId}
              onUpdated={fetchData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
