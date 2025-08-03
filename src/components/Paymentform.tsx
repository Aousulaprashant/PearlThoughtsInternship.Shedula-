'use client';

import React, { useState } from 'react';
import { FaUser, FaPhone, FaVenusMars, FaCreditCard, FaCalendarAlt, FaLock } from 'react-icons/fa';

interface PaymentFormProps {
  onClose: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    phone: '',
    gender: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBookAppointment = () => {
    console.log(formData); // Replace with API call or logic
    alert('Appointment Booked!');
    onClose();
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full animate-slide-up z-50">
      <h2 className="text-2xl font-semibold mb-6 text-center">Enter Your Details</h2>

      <div className="mb-4 flex items-center border rounded-lg px-3 py-2 shadow-sm">
        <FaUser className="text-gray-500 mr-2" />
        <input
          type="text"
          name="patientName"
          placeholder="Patient Name"
          className="flex-1 outline-none"
          value={formData.patientName}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4 flex items-center border rounded-lg px-3 py-2 shadow-sm">
        <FaPhone className="text-gray-500 mr-2" />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          className="flex-1 outline-none"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4 flex items-center border rounded-lg px-3 py-2 shadow-sm">
        <FaVenusMars className="text-gray-500 mr-2" />
        <select
          name="gender"
          className="flex-1 outline-none bg-white"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <h3 className="text-lg font-semibold mb-2">Payment Details</h3>

      <div className="mb-4 flex items-center border rounded-lg px-3 py-2 shadow-sm">
        <FaCreditCard className="text-gray-500 mr-2" />
        <input
          type="text"
          name="cardNumber"
          placeholder="Card Number"
          className="flex-1 outline-none"
          value={formData.cardNumber}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4 flex items-center border rounded-lg px-3 py-2 shadow-sm">
        <FaCalendarAlt className="text-gray-500 mr-2" />
        <input
          type="text"
          name="expiry"
          placeholder="Expiration Date (MM/YY)"
          className="flex-1 outline-none"
          value={formData.expiry}
          onChange={handleChange}
        />
      </div>

      <div className="mb-6 flex items-center border rounded-lg px-3 py-2 shadow-sm">
        <FaLock className="text-gray-500 mr-2" />
        <input
          type="text"
          name="cvv"
          placeholder="CVV"
          className="flex-1 outline-none"
          value={formData.cvv}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-between">
        <button
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-400"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
          onClick={handleBookAppointment}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default PaymentForm;
