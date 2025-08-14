"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { MdOutlineArrowForwardIos } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import Sidebar from "@/components/DoctorSlideBar";
import CreatePrescriptionModal from "@/components/CreatePrescriptionModal";

type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  gender: string;
  isCompleted: boolean;
  appointmentDate: string;
};
type Prescription = {
  appointmentId: string;
  medicine: string;
  dosage: string;
  frequency: string;
  instructions: string;
};

export default function PrescriptionPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const router = useRouter();

  const fetchData = async () => {
    try {
      const res1 = await fetch("http://localhost:5000/appointments");
      const appointmentsData = await res1.json();
      const completedAppointments = appointmentsData.filter(
        (item: any) => item.isCompleted === true
      );
      setAppointments(completedAppointments);

      const res2 = await fetch("http://localhost:5000/prescriptions");
      const prescriptionsData = await res2.json();
      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAppointments = appointments.filter((a) =>
    a.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPrescriptionsByAppointment = (appointmentId: string) => {
    return prescriptions.filter((p) => p.appointmentId === appointmentId);
  };

  const isRowExpanded = (appointmentId: string) =>
    expandedRows.includes(appointmentId);

  const toggleRow = (appointmentId: string) => {
    if (isRowExpanded(appointmentId)) {
      setExpandedRows((prev) => prev.filter((id) => id !== appointmentId));
    } else {
      setExpandedRows((prev) => [...prev, appointmentId]);
    }
  };

  const handleAddPrescription = (appt: Appointment) => {
    setSelectedAppt(appt);
    setOpenCreate(true);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 w-full bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">Patient Prescriptions</h2>

        <div className="mb-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search patient.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm bg-white w-full"
            />
            <FiSearch
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl shadow bg-white">
          <table className="min-w-full table-auto">
            <thead className="bg-blue-600 text-white text-left text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Appointment Date</th>
                <th className="px-6 py-4 font-medium">Gender</th>
                <th className="px-6 py-4 font-medium text-center">
                  Prescription
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((a) => {
                const patientPrescriptions = getPrescriptionsByAppointment(
                  a.id
                );
                return (
                  <>
                    <tr
                      key={a.id}
                      className="border-b text-sm"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest("svg") || target.closest("button"))
                          return;
                        router.push(`/patients/${a.patientName}`);
                      }}
                    >
                      <td className="px-6 py-4">{a.patientName}</td>
                      <td className="px-6 py-4">{a.appointmentDate}</td>
                      <td className="px-6 py-4">{a.gender}</td>
                      <td className="px-6 py-4 text-center">
                        {patientPrescriptions.length > 0 ? (
                          <MdOutlineArrowForwardIos
                            className={`mx-auto text-blue-600 transition-transform duration-200 cursor-pointer ${
                              isRowExpanded(a.id) ? "rotate-90" : ""
                            }`}
                            onClick={() => toggleRow(a.id)}
                          />
                        ) : (
                          <button
                            onClick={() => handleAddPrescription(a)}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
                          >
                            <AiOutlinePlus size={18} />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Dropdown section */}
                    {isRowExpanded(a.id) && patientPrescriptions.length > 0 && (
                      <tr
                        key={`${a.id}-expanded`}
                        className="border-b text-sm hover:bg-blue-50"
                      >
                        <td colSpan={4} className="px-8 py-4">
                          <div className="mb-2 flex justify-between items-center">
                            <h4
                              className="font-semibold cursor-pointer hover:underline"
                              onClick={() =>
                                router.push(`/patients/${a.patientId}`)
                              }
                            >
                              Prescriptions for {a.patientName}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddPrescription(a);
                              }}
                              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                            >
                              <AiOutlinePlus size={16} />
                              Add
                            </button>
                          </div>
                          <ul
                            className="list-disc ml-5 text-sm text-gray-700 space-y-1 cursor-pointer"
                            onClick={() =>
                              router.push(`/patients/${a.patientId}`)
                            }
                          >
                            {patientPrescriptions.map((p) => (
                              <li key={p.appointmentId + p.medicine}>
                                <strong>Medicine:</strong> {p.medicine},{" "}
                                <strong>Dosage:</strong> {p.dosage},{" "}
                                <strong>Frequency:</strong> {p.frequency},{" "}
                                <strong>Instructions:</strong> {p.instructions}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-gray-500 mt-4">
          Showing {filteredAppointments.length} of {appointments.length} entries
        </div>
      </div>

      {selectedAppt && (
        <CreatePrescriptionModal
          isOpen={openCreate}
          onClose={() => setOpenCreate(false)}
          appointmentId={selectedAppt.id}
          patientId={selectedAppt.patientId}
          onCreated={fetchData}
        />
      )}
    </div>
  );
}
