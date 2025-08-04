// app/doctors/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import DoctorCard from "@/components/DoctorCard";
import { useRouter } from "next/router";
import { useUser } from "@/context/UseContext-login";
import axios from "axios";
import axiosInstance from "@/utiles/axiosInstance";

const API_URL = "/doctors";

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 6;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance(API_URL);
        const data = res.data;
        setDoctors(data);
        setFilteredDoctors(data);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = [...doctors];

    if (searchTerm) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specialization) {
      filtered = filtered.filter((doc) =>
        doc.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }

    if (location) {
      filtered = filtered.filter((doc) =>
        doc.availability?.location
          ?.toLowerCase()
          .includes(location.toLowerCase())
      );
    }

    if (sortOption === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "fee") {
      filtered.sort((a, b) => parseInt(a.fee || "0") - parseInt(b.fee || "0"));
    }

    setFilteredDoctors(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, specialization, location, sortOption, doctors]);

  const indexOfLast = currentPage * doctorsPerPage;
  const indexOfFirst = indexOfLast - doctorsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
  const { user } = useUser();

  return (
    <div className="bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-blue-900 mb-2">
        Qualified Doctors
      </h2>
      <p className="text-center text-gray-500 mb-8">
        Our find a doctor tool assists you in choosing.
      </p>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search for Doctor"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded-md w-full sm:w-48"
        />
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="border px-3 py-2 rounded-md w-full sm:w-40"
        >
          <option value="">Specialization</option>
          <option value="Rheumatology">Rheumatology</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Orthopedic">Orthopedic</option>
          <option value="Pediatrician">Pediatrician</option>
        </select>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border px-3 py-2 rounded-md w-full sm:w-40"
        >
          <option value="">Location</option>
          <option value="Alexandria">Alexandria</option>
          <option value="Delhi">Delhi</option>
          <option value="Chennai">Chennai</option>
        </select>
        <input
          type="date"
          className="border px-3 py-2 rounded-md w-full sm:w-48"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md w-full sm:w-auto">
          Search
        </button>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border px-3 py-2 rounded-md w-full sm:w-40"
        >
          <option value="default">Sort by</option>
          <option value="name">Name</option>
          <option value="fee">Fee</option>
        </select>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentDoctors.map((doctor, index) => (
          <DoctorCard key={index} {...doctor} />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-10">
        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`w-8 h-8 rounded-full text-sm font-medium ${
                num === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-600"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorsPage;
