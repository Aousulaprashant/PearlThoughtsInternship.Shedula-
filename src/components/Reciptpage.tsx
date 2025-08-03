// components/ReceiptPage.tsx
"use client";
import React, { forwardRef } from "react";

const ReceiptPage = forwardRef(({ appointmentDetails }: any, ref) => {
  if (!appointmentDetails) return null;

  const bookingId = `APT-${appointmentDetails.patientId?.slice(
    0,
    4
  )}-${Date.now().toString().slice(-4)}`;

  return (
    <div
      id="receipt"
      ref={ref}
      style={{
        backgroundColor: "#ffffff",
        color: "#1f2937",
        border: "1px solid #e5e7eb",
        padding: "24px",
        borderRadius: "10px",
        maxWidth: "600px",
        margin: "2rem auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: "bold",
            marginBottom: "4px",
            color: "#2563eb",
          }}
        >
          Schedula Health
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
          Appointment Booking Receipt
        </p>
        <hr style={{ margin: "16px 0", borderTop: "1px solid #e5e7eb" }} />
      </div>

      {/* Booking ID */}
      <div
        style={{ marginBottom: "12px", textAlign: "right", fontSize: "0.9rem" }}
      >
        <strong>Booking ID:</strong> {bookingId}
      </div>

      {/* Patient Details */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "8px" }}
        >
          Patient Information
        </h2>
        <p>
          <strong>Name:</strong> {appointmentDetails.patientName}
        </p>
        <p>
          <strong>Phone:</strong> {appointmentDetails.phoneNumber}
        </p>
        <p>
          <strong>Gender:</strong> {appointmentDetails.gender}
        </p>
      </div>

      {/* Doctor Details */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "8px" }}
        >
          Doctor Information
        </h2>
        <p>
          <strong>Name:</strong> Dr. {appointmentDetails.doctorName}
        </p>
        <p>
          <strong>Specialization:</strong> {appointmentDetails.specialization}
        </p>
        <p>
          <strong>Location:</strong> {appointmentDetails.location}
        </p>
      </div>

      {/* Appointment Details */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "8px" }}
        >
          Appointment Details
        </h2>
        <p>
          <strong>Date:</strong> {appointmentDetails.appointmentDate}
        </p>
        <p>
          <strong>Time:</strong> {appointmentDetails.appointmentTime}
        </p>
        <p>
          <strong>Status:</strong> {appointmentDetails.status}
        </p>
        <p>
          <strong>Consultation Fee:</strong> ₹{appointmentDetails.fee}
        </p>
      </div>

      {/* Footer */}
      <hr style={{ margin: "24px 0", borderTop: "1px solid #e5e7eb" }} />
      <p style={{ textAlign: "center", fontSize: "0.85rem", color: "#6b7280" }}>
        Thank you for choosing <strong>Schedula</strong>. We wish you good
        health!
      </p>
    </div>
  );
});

export default ReceiptPage;
