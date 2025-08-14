export interface Doctor {
  id: string;
  doctorId: string;
  name: string;
  profileImage?: string;
  digitalSignature?: string;
  specialty?: string;
  qualification?: string;
  about?: string;
  clinicName?: string;
  address?: string;
  phone?: string;
  doctoremailOrphone?: string;
  website?: string;
  workingDays?: { start: string; end?: string }[];
  workingHours?: { start: string; end: string }[];
  services?: string[];
  languages?: string[];
}

export interface Prescription {
  id: string;
  appointmentId?: string;
  patientId?: string;
  doctorId?: string;
  date: string;
  medicines: Array<{
    medicine: string;
    dosage?: string;
    duration?: string;
    notes?: string;
    route?: string;
    startDate?: string;
    endDate?: string;
  }>;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  date: string; // ISO
}
