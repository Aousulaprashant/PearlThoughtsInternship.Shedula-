import { useState } from "react";

type Props = {
  appointmentId: string;
  onSubmit: (data: {
    appointmentId: string;
    medicine: string;
    dosage: string;
    duration: string;
    notes: string;
    date: string;
  }) => void;
};

export default function PrescriptionForm({ appointmentId, onSubmit }: Props) {
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      appointmentId,
      medicine,
      dosage,
      duration,
      notes,
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    });
    setMedicine("");
    setDosage("");
    setDuration("");
    setNotes("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-100 p-4 rounded mb-4 grid gap-3"
    >
      <input
        type="text"
        value={medicine}
        onChange={(e) => setMedicine(e.target.value)}
        placeholder="Medicine Name"
        className="p-2 border rounded"
        required
      />
      <input
        type="text"
        value={dosage}
        onChange={(e) => setDosage(e.target.value)}
        placeholder="Dosage (e.g. 2 times/day)"
        className="p-2 border rounded"
        required
      />
      <input
        type="text"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="Duration (e.g. 5 days)"
        className="p-2 border rounded"
        required
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes / Instructions"
        className="p-2 border rounded"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit Prescription
      </button>
    </form>
  );
}
