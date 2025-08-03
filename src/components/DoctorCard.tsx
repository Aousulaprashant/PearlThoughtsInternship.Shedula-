"use client";

import { FaMapMarkerAlt, FaPhone } from "react-icons/fa";
import { PiCurrencyCircleDollarFill } from "react-icons/pi";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";

interface DoctorCardProps {
  id: string;
  name: string;
  specialization: string;
  location: string;
  fee: string;
  phone: string;
  image: string;
}

const DoctorCard: React.FC<DoctorCardProps> = ({
  id,
  name,
  specialization,
  location,
  fee,
  phone,
  image,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/doctors/${id}`);
  };
  return (
    <div className="bg-white rounded-2xl shadow-md w-full max-w-sm">
      <div className="relative w-full h-56 rounded-xl overflow-hidden bg-gray-100">
        <Image src={image} alt={name} fill className="object-contain" />
      </div>

      <div className="flex justify-between px-2.5">
        <div className="mt-4 space-y-1 p-2">
          <h3 className="text-lg font-bold text-blue-900">{name}</h3>
          <p className="text-sm text-gray-600">{specialization}</p>
        </div>

        <div className="mt-3 space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-blue-500" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <PiCurrencyCircleDollarFill className="text-blue-500" />
            <span>Fee: {fee}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaPhone className="text-blue-500" />
            <span>{phone}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-3 p-3">
        <button
          onClick={handleClick}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Book Now
        </button>
        <button
          onClick={handleClick}
          className="flex-1 text-blue-800 font-medium underline hover:text-blue-600 transition"
        >
          Details
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
