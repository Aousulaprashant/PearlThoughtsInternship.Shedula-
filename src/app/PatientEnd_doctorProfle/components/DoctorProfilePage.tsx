"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
};

type Prescription = {
  id: string;
  doctorId: string;
  patientId: string;
  medication: string;
  dosage: string;
  instructions: string;
};

type Review = {
  id: string;
  doctorId: string;
  reviewer: string;
  comment: string;
  rating: number;
};

export default function DoctorProfilePage() {
  const doctorId = "3792c806-2838-4781-b265-5f62e91b47d6"; // Replace with dynamic ID if needed
  const patientId = "123"; // Replace with actual patient ID

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);

  // Form states for prescriptions
  const [newPrescription, setNewPrescription] = useState({
    medication: "",
    dosage: "",
    instructions: "",
  });

  const [editingPrescription, setEditingPrescription] =
    useState<Prescription | null>(null);

  // Review form state
  const [newReview, setNewReview] = useState({
    reviewer: "",
    comment: "",
    rating: 5,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorRes, prescriptionsRes, reviewsRes] = await Promise.all([
        fetch(`http://localhost:5000/doctors/${doctorId}`),
        fetch(
          `http://localhost:5000/prescriptions?doctorId=${doctorId}&patientId=${patientId}`
        ),
        fetch(`http://localhost:5000/reviews?doctorId=${doctorId}`),
      ]);

      setDoctor(await doctorRes.json());
      setPrescriptions(await prescriptionsRes.json());
      setReviews(await reviewsRes.json());
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // CRUD: Add Prescription
  const handleAddPrescription = async () => {
    if (!newPrescription.medication.trim())
      return toast.error("Medication required");

    const newItem = {
      id: crypto.randomUUID(),
      doctorId,
      patientId,
      ...newPrescription,
    };

    try {
      await fetch(`http://localhost:5000/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      setPrescriptions((prev) => [...prev, newItem]);
      setNewPrescription({ medication: "", dosage: "", instructions: "" });
      toast.success("Prescription added");
    } catch {
      toast.error("Failed to add prescription");
    }
  };

  // CRUD: Edit Prescription
  const handleEditPrescription = async () => {
    if (!editingPrescription) return;

    try {
      await fetch(
        `http://localhost:5000/prescriptions/${editingPrescription.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingPrescription),
        }
      );
      setPrescriptions((prev) =>
        prev.map((p) =>
          p.id === editingPrescription.id ? editingPrescription : p
        )
      );
      setEditingPrescription(null);
      toast.success("Prescription updated");
    } catch {
      toast.error("Failed to update prescription");
    }
  };

  // CRUD: Delete Prescription
  const handleDeletePrescription = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/prescriptions/${id}`, {
        method: "DELETE",
      });
      setPrescriptions((prev) => prev.filter((p) => p.id !== id));
      toast.success("Prescription deleted");
    } catch {
      toast.error("Failed to delete prescription");
    }
  };

  // Add Review
  const handleAddReview = async () => {
    if (!newReview.comment.trim()) return toast.error("Comment required");

    const newItem = {
      id: crypto.randomUUID(),
      doctorId,
      ...newReview,
    };

    try {
      await fetch(`http://localhost:5000/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      setReviews((prev) => [...prev, newItem]);
      setNewReview({ reviewer: "", comment: "", rating: 5 });
      toast.success("Review added");
    } catch {
      toast.error("Failed to add review");
    }
  };

  if (loading) return <p className="text-center p-8">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Doctor Info */}
      {doctor && (
        <motion.div
          className="bg-white p-6 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold">{doctor.name}</h2>
          <p>{doctor.specialization}</p>
          <p>{doctor.experience} years experience</p>
          <p>⭐ {doctor.rating}</p>
        </motion.div>
      )}

      {/* Prescriptions */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-lg space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold">Prescriptions</h3>

        {/* Add new prescription */}
        <div className="flex gap-2">
          <input
            className="border p-2 rounded w-1/4"
            placeholder="Medication"
            value={newPrescription.medication}
            onChange={(e) =>
              setNewPrescription({
                ...newPrescription,
                medication: e.target.value,
              })
            }
          />
          <input
            className="border p-2 rounded w-1/4"
            placeholder="Dosage"
            value={newPrescription.dosage}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, dosage: e.target.value })
            }
          />
          <input
            className="border p-2 rounded w-1/3"
            placeholder="Instructions"
            value={newPrescription.instructions}
            onChange={(e) =>
              setNewPrescription({
                ...newPrescription,
                instructions: e.target.value,
              })
            }
          />
          <button
            className="bg-blue-600 text-white px-4 rounded"
            onClick={handleAddPrescription}
          >
            Add
          </button>
        </div>

        {/* Prescription List */}
        {prescriptions.map((p) => (
          <div
            key={p.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            {editingPrescription?.id === p.id ? (
              <div className="flex gap-2">
                <input
                  className="border p-1 rounded"
                  value={editingPrescription.medication}
                  onChange={(e) =>
                    setEditingPrescription({
                      ...editingPrescription,
                      medication: e.target.value,
                    })
                  }
                />
                <input
                  className="border p-1 rounded"
                  value={editingPrescription.dosage}
                  onChange={(e) =>
                    setEditingPrescription({
                      ...editingPrescription,
                      dosage: e.target.value,
                    })
                  }
                />
                <input
                  className="border p-1 rounded"
                  value={editingPrescription.instructions}
                  onChange={(e) =>
                    setEditingPrescription({
                      ...editingPrescription,
                      instructions: e.target.value,
                    })
                  }
                />
                <button
                  className="bg-green-600 text-white px-3 rounded"
                  onClick={handleEditPrescription}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p>
                    <b>{p.medication}</b> - {p.dosage}
                  </p>
                  <p className="text-sm text-gray-600">{p.instructions}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-yellow-500 text-white px-3 rounded"
                    onClick={() => setEditingPrescription(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 rounded"
                    onClick={() => handleDeletePrescription(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </motion.div>

      {/* Reviews */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-lg space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-bold">Reviews</h3>

        {/* Add Review */}
        <div className="flex gap-2">
          <input
            className="border p-2 rounded w-1/4"
            placeholder="Your name"
            value={newReview.reviewer}
            onChange={(e) =>
              setNewReview({ ...newReview, reviewer: e.target.value })
            }
          />
          <input
            className="border p-2 rounded w-1/2"
            placeholder="Comment"
            value={newReview.comment}
            onChange={(e) =>
              setNewReview({ ...newReview, comment: e.target.value })
            }
          />
          <input
            type="number"
            min="1"
            max="5"
            className="border p-2 rounded w-20"
            value={newReview.rating}
            onChange={(e) =>
              setNewReview({ ...newReview, rating: Number(e.target.value) })
            }
          />
          <button
            className="bg-blue-600 text-white px-4 rounded"
            onClick={handleAddReview}
          >
            Add
          </button>
        </div>

        {/* Review List */}
        {reviews.map((r) => (
          <div key={r.id} className="border p-3 rounded">
            <p>
              <b>{r.reviewer}</b> ({r.rating}⭐)
            </p>
            <p>{r.comment}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
