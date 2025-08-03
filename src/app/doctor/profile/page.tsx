"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/context/UseContext-login";
import { motion } from "framer-motion";
import { MdEdit } from "react-icons/md";

const DoctorProfile = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState<any>(null);
  const [editFields, setEditFields] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  const specializationOptions = [
    { id: "s1", name: "Cardiologist" },
    { id: "s2", name: "Dermatologist" },
    { id: "s3", name: "Orthopedic Surgeon" },
    { id: "s4", name: "Pediatrician" },
    { id: "s5", name: "Ophthalmologist" },
    { id: "s6", name: "Gastroenterologist" },
  ];

  useEffect(() => {
    if (!user || user.role !== "doctor") return;

    axios
      .get(`http://localhost:5000/doctors/${user.id}`)
      .then((res) => {
        setFormData(res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load profile");
        setLoading(false);
      });
  }, [user]);

  const toggleEdit = (field: string) => {
    setEditFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "days" || name === "time") {
      setFormData((prev: any) => ({
        ...prev,
        availability: {
          ...prev.availability,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleServiceChange = (index: number, value: string) => {
    const updated = [...formData.services];
    updated[index] = value;
    setFormData((prev: any) => ({ ...prev, services: updated }));
  };
  const [profileImage, setProfileImage] = useState("");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProfileImage(base64);
      setFormData((prev: any) => ({ ...prev, profileImage: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    try {
      await axios.put(`http://localhost:5000/doctors/${user.id}`, formData);
      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed!");
    }
  };

  if (loading || !formData) return <p className="p-4">Loading...</p>;

  const renderInput = (label: string, name: string, value: string) => (
    <motion.div layout>
      <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
        {label}
        <button
          type="button"
          onClick={() => toggleEdit(name)}
          className="text-blue-500 hover:text-blue-700"
        >
          <MdEdit />
        </button>
      </label>
      <input
        name={name}
        value={value}
        onChange={handleChange}
        readOnly={!editFields[name]}
        className={`mt-1 p-2 w-full rounded-lg transition-all duration-300 border focus:outline-none focus:ring-2 ${
          editFields[name]
            ? "bg-white border-blue-500 ring-blue-300"
            : "bg-gray-100 border-gray-300 cursor-pointer"
        }`}
      />
    </motion.div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-5xl mx-auto bg-white/60 backdrop-blur-md shadow-2xl p-8 rounded-3xl mt-8 mb-12 border border-gray-200"
    >
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <img
            src={user?.image || "/Herodoc/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
          />
          <label
            htmlFor="profile-upload"
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition"
            title="Change profile image"
          >
            <MdEdit />
          </label>
          <input
            type="file"
            id="profile-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        <h2 className="text-3xl font-bold text-blue-700 mt-4">
          Doctor Profile
        </h2>
        <p className="text-gray-600">Update your details with ease</p>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {renderInput("Name", "name", formData.name)}

        {/* Specialization Dropdown */}
        <motion.div layout>
          <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
            Specialization
            <button
              type="button"
              onClick={() => toggleEdit("specialization")}
              className="text-blue-500 hover:text-blue-700"
            >
              <MdEdit />
            </button>
          </label>
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            disabled={!editFields["specialization"]}
            className={`mt-1 p-2 w-full rounded-xl border focus:outline-none transition duration-300 focus:ring-2 ${
              editFields["specialization"]
                ? "bg-white border-blue-500 ring-blue-300"
                : "bg-gray-100 border-gray-300 cursor-pointer"
            }`}
          >
            <option value="">Select Specialization</option>
            {specializationOptions.map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </motion.div>

        {renderInput("Degree", "degree", formData.degree)}
        {renderInput("Experience (years)", "experience", formData.experience)}
        {renderInput("Patients Treated", "patients", formData.patients)}
        {renderInput("Phone", "phone", formData.phone)}
        {renderInput("Location", "location", formData.location)}
        {renderInput("Fee (INR)", "fee", formData.fee)}
        {renderInput(
          "Availability Days",
          "days",
          formData.availability?.days || ""
        )}
        {renderInput(
          "Availability Time",
          "time",
          formData.availability?.time || ""
        )}
      </div>

      {/* About Section */}
      <div className="mt-6">
        <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
          About
          <button
            type="button"
            onClick={() => toggleEdit("about")}
            className="text-blue-500 hover:text-blue-700"
          >
            <MdEdit />
          </button>
        </label>
        <textarea
          name="about"
          value={formData.about}
          onChange={handleChange}
          readOnly={!editFields["about"]}
          className={`mt-1 p-3 w-full rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
            editFields["about"]
              ? "bg-white border-blue-500 ring-blue-300"
              : "bg-gray-100 border-gray-300 cursor-pointer"
          }`}
          rows={4}
        />
      </div>

      {/* Services */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Services Offered
        </h3>
        {formData.services?.map((service: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <input
              value={service}
              onChange={(e) => handleServiceChange(idx, e.target.value)}
              readOnly={!editFields[`service-${idx}`]}
              onClick={() => toggleEdit(`service-${idx}`)}
              className={`p-2 w-full rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 ${
                editFields[`service-${idx}`]
                  ? "bg-white border-blue-500 ring-blue-300"
                  : "bg-gray-100 border-gray-300 cursor-pointer"
              }`}
            />
            <button
              type="button"
              onClick={() => toggleEdit(`service-${idx}`)}
              className="text-blue-500 hover:text-blue-700"
            >
              <MdEdit />
            </button>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="mt-10 text-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveProfile}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-3 rounded-2xl font-bold shadow-lg transition-all duration-300"
        >
          Save Changes
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DoctorProfile;
