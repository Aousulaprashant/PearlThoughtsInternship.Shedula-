import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { FaNotesMedical, FaPills, FaUserMd } from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import { QRCodeCanvas } from "qrcode.react";
import LZString from "lz-string";
import axiosInstance from "@/utiles/axiosInstance";

interface Medicine {
  medicine: string;
  dosage: string;
  duration: string;
  route?: string;
  notes?: string;
  schedule?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
}

interface PrintPrescriptionProps {
  patientName: string;
  patientId: string;
  patientAge?: number;
  patientGender?: string;
  medicines: Medicine[];
  doctorName: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
  date: string;
  diagnosis?: string;
  followUpDate?: string;
  additionalNotes?: string;
  advice?: string;
  vitals?: {
    bloodPressure?: string;
    temperature?: string;
    pulseRate?: string;
    respiratoryRate?: string;
  };
  docsignature: string;
}

export interface PrintPrescriptionHandle {
  print: () => void;
  downloadPDF: () => void;
}

const PrintPrescription = forwardRef<
  PrintPrescriptionHandle,
  PrintPrescriptionProps
>((props, ref) => {
  const {
    patientName,
    patientId,
    patientAge,
    patientGender,
    medicines,
    doctorName,
    specialization,
    clinicName,
    clinicAddress,
    date,
    diagnosis, // ✅ added
    followUpDate, // ✅ added
    additionalNotes, // ✅ added
    docsignature,
    advice,
  } = props;

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });
  const dataToEncode = JSON.stringify({
    prescriptionId: patientId,
    patientName,
    patientAge,
    patientGender,
    doctorName,
    issued: new Date(date).toISOString(),
  });

  const handleDownloadPDF = async () => {
    if (!componentRef.current) return;

    const element = componentRef.current;

    // Fix Tailwind oklch colors
    element.querySelectorAll("*").forEach((node) => {
      const el = node as HTMLElement;
      const computedStyle = window.getComputedStyle(el);

      if (computedStyle.backgroundColor.includes("oklch")) {
        el.style.backgroundColor = "rgb(255, 255, 255)";
      }
      if (computedStyle.color.includes("oklch")) {
        el.style.color = "rgb(0, 0, 0)";
      }
    });

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${patientName.replace(/\s+/g, "_")}_Prescription.pdf`);
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    print: handlePrint,
    downloadPDF: handleDownloadPDF,
  }));

  return (
    <div
      ref={componentRef}
      className="relative text-gray-700 p-8 shadow-lg rounded-lg border border-gray-200"
      style={{
        width: "210mm", // A4 width
        minHeight: "297mm", // A4 height
        position: "relative",
      }}
    >
      {/* WATERMARK */}
      {/* <img
        src="/doccartoon.png"
        alt="Doctor Cartoon Watermark"
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          height: "auto",
          opacity: 0.08,
          zIndex: -1,
          pointerEvents: "none",
        }}
      /> */}

      {/* HEADER */}
      <div className="border-b-4 border-blue-500 pb-4 mb-6">
        <div className="flex justify-between items-center">
          {/* Clinic Info */}
          <div className="flex items-center space-x-3">
            <h1 className="text-blue-500 font-extrabold text-4xl">
              Shedula <span className="text-cyan-500">+</span>
            </h1>
            <div>
              <h1 className="text-2xl font-bold text-blue-500">{clinicName}</h1>
              <p className="text-sm text-gray-600">{clinicAddress}</p>
              <p className="text-sm text-gray-500">Contact: +91-9876543210</p>
            </div>
          </div>

          {/* QR & Info */}
          <div className="text-right">
            <QRCodeCanvas
              value={LZString.compressToBase64(dataToEncode)}
              size={80}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
            <p className="text-xs text-gray-500">
              Prescription ID: #{patientId}
            </p>
            <p className="text-xs text-gray-500">
              Issued: {new Date(date).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* DOCTOR INFO */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-bold text-blue-600">Dr. {doctorName}</h2>
        <p className="text-sm text-gray-600">
          {specialization} | Reg. No: 123456
        </p>
      </div>

      {/* PATIENT INFO */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-500">
          <FaUserMd /> Patient Information
        </h2>
        <div className="ml-6 space-y-1 text-gray-600">
          <p>
            <strong>Name:</strong> {patientName}
          </p>
          <p>
            <strong>Age/Gender:</strong> {patientAge} yrs, {patientGender}
          </p>
          <p>
            <strong>Patient ID:</strong> {patientId}
          </p>
        </div>
      </div>

      {/* DIAGNOSIS */}
      {diagnosis && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-red-500 flex items-center gap-2">
            <FaNotesMedical /> Diagnosis
          </h2>
          <p className="ml-6 text-gray-700">{diagnosis}</p>
        </div>
      )}

      {/* MEDICINES */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-green-600 flex items-center gap-2">
          <FaPills /> Medicines
        </h2>
        <table className="w-full border-collapse border border-gray-300 mt-2 text-sm">
          <thead className="bg-blue-50">
            <tr>
              {[
                "Medicine",
                "Dosage",
                "Route",
                "Frequency",
                "Duration",
                "Start",
                "End",
                "Notes",
              ].map((header) => (
                <th
                  key={header}
                  className="border border-gray-300 px-2 py-1 text-gray-600 font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {medicines.map((med, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-2 py-1">
                  {med.medicine}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {med.dosage}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {med.route || "-"}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {med.frequency || "-"}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {med.duration}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {med.startDate || "-"}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {med.endDate || "-"}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {med.notes || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOLLOW-UP */}
      {followUpDate && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-orange-500">
            Follow-Up Date
          </h2>
          <p className="ml-6 text-gray-700">
            {new Date(followUpDate).toLocaleDateString()}
          </p>
        </div>
      )}

      {/* ADDITIONAL NOTES */}
      {additionalNotes && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-purple-500">
            Additional Notes
          </h2>
          <p className="ml-6 text-gray-700">{additionalNotes}</p>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-between items-center mt-8 border-t-2 border-gray-300 pt-4">
        <div className="text-xs text-gray-500 max-w-xs">
          This prescription is generated electronically and is valid without a
          physical seal. In case of emergencies, visit the nearest hospital.
        </div>
        <div className="text-center">
          <img
            src={docsignature || "/Herodoc/Signature_image.png"}
            alt="Signature"
            className="w-28 mx-auto"
          />
          <p className="text-sm font-medium">Dr. {doctorName}</p>
        </div>
      </div>
    </div>
  );
});

export default PrintPrescription;
