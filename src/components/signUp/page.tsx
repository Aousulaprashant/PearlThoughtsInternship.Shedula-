"use client";

import React, { useState } from "react";
import axiosInstance from "@/utiles/axiosInstance";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@/context/UseContext-login";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [isDoctor, setIsDoctor] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [fee, setFee] = useState("");
  const [website, setWebsite] = useState("");
  const [workingDays, setWorkingDays] = useState([{ start: "", end: "" }]);
  const [workingHours, setWorkingHours] = useState([{ start: "", end: "" }]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [digitalSignature, setDigitalSignature] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [about, setAbout] = useState("");
  const [qualification, setQualification] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const { setUser } = useUser();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Password match check
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // 1. Check if account already exists

      console.log(emailOrPhone); //giveing corrent what i mentioed in input "dr.prashanth@pearlThoughtcare.tsx"

      if (isDoctor) {
        const allDoctors = await axiosInstance.get("/doctors");
        const exists = allDoctors.data.some(
          (d: any) =>
            d.doctoremailOrphone &&
            d.doctoremailOrphone.toLowerCase() === emailOrPhone.toLowerCase()
        );
        if (exists) {
          setError("Account with this email/phone already exists");
          return;
        }
      } else {
        const allUsers = await axiosInstance.get("/users");
        const exists = allUsers.data.some(
          (u: any) =>
            u.emailOrPhone &&
            u.emailOrPhone.toLowerCase() === emailOrPhone.toLowerCase()
        );
        if (exists) {
          setError("Account with this email/phone already exists");
          return;
        }
      }

      const baseUser = {
        id: uuidv4(),
        name,
        password,
        role: isDoctor ? "doctor" : "patient",
      };

      let response;

      if (isDoctor) {
        const newDoctor = {
          id: baseUser.id,
          doctorId: baseUser.id,
          name,
          password,
          role: "doctor",
          licenseNumber,
          issuingAuthority,
          clinicName,
          address,
          phone,
          services,
          fee,
          website,
          doctoremailOrphone: emailOrPhone,
          email,
          workingDays,
          workingHours,
          departments,
          languages,
          digitalSignature,
          profileImage,
          about,
          qualification,
          specialty,
        };

        response = await axiosInstance.post(`/doctors`, newDoctor);
      } else {
        const newPatient = {
          ...baseUser,
          emailOrPhone,
        };

        response = await axiosInstance.post(`/users`, newPatient);
      }

      // 3. Save user in context & localStorage
      const userWithRole = {
        ...response.data,
        role: isDoctor ? "doctor" : "patient",
      };

      localStorage.setItem("user", JSON.stringify(userWithRole));
      setUser(userWithRole);

      // 4. Redirect to dashboard
      if (isDoctor) {
        router.push("/docDashBoard");
      } else {
        router.push("/doctors");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-6 rounded-lg w-full lg:w-1/2 max-w-md mt-10 lg:mt-0">
      <h2 className="text-2xl font-semibold text-blue-900 mb-4">
        {/* {isDoctor ? "Doctor Signup" : "User Signup"} */}
      </h2>

      <form className="space-y-4" onSubmit={handleSignup}>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email or Phone
          </label>
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <div className="text-red-600 text-sm mt-1">{error}</div>}

        <button
          type="submit"
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-md font-medium"
        >
          Sign Up
        </button>

        <button
          type="button"
          onClick={() => setIsDoctor(!isDoctor)}
          className="w-full mt-2 text-sm text-cyan-600 hover:underline"
        >
          {isDoctor ? "Signup as User instead" : "Signup as Doctor instead"}
        </button>
      </form>
    </div>
  );
}
