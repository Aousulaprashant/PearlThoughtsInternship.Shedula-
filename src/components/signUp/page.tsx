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
  const [error, setError] = useState("");
  const { setUser } = useUser(); // from your context
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const checkUrl = isDoctor
        ? `/doctors?doctoremailOrphone=${emailOrPhone}`
        : `/users?emailOrPhone=${emailOrPhone}`;

      // 1. Check if already exists
      const res = await axiosInstance.get(checkUrl);
      if (res.data.length > 0) {
        setError("Account with this email/phone already exists");
        return;
      }

      const newUser = {
        id: uuidv4(),
        name: "New Doctor",
        password,
        role: isDoctor ? "doctor" : "patient",
      };

      let response;
      if (isDoctor) {
        const newDoctor = {
          ...newUser,
          doctoremailOrphone: emailOrPhone,
          specialization: "",
          degree: "",
          experience: "",
          patients: "0",
          rating: 0,
          reviews: 0,
          services: [],
          about: "",
          availability: {
            days: "",
            time: "",
          },
          location: "",
          phone: "",
          fee: "",
          image: "",
          reviewList: [],
        };

        // 2. Save new doctor
        response = await axiosInstance.post(`/doctors`, newDoctor);
      } else {
        const newPatient = {
          ...newUser,
          emailOrPhone,
        };

        // 2. Save new user
        response = await axiosInstance.post(`/users`, newPatient);
      }

      // 3. Store in context and localStorage
      const userWithRole = {
        ...response.data,
        role: isDoctor ? "doctor" : "patient",
      };

      localStorage.setItem("user", JSON.stringify(userWithRole));
      setUser(userWithRole);

      // 4. Redirect
      if (isDoctor) {
        router.push("/docDashBoard");
      } else {
        router.push("/doctors");
      }

      setError("");
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

      <h2 className="text-red-600">
        {isDoctor ? "Sorry doctor, Doctor signup is not implemented yet!" : ""}
      </h2>

      <form className="space-y-4" onSubmit={handleSignup}>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
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
