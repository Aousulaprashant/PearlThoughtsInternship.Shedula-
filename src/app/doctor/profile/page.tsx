"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utiles/axiosInstance";
import toast from "react-hot-toast";
import { useUser } from "@/context/UseContext-login";
import { motion } from "framer-motion";

import { MdEdit, MdAdd, MdDelete } from "react-icons/md";

const DoctorProfile = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState<any>(null);
  const [editFields, setEditFields] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  const dayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const specializationOptions = [
    "Cardiologist",
    "Dermatologist",
    "Orthopedic Surgeon",
    "Pediatrician",
    "Ophthalmologist",
    "Gastroenterologist",
  ];

  const departmentOptions = [
    "Cardiology",
    "Dermatology",
    "Orthopedics",
    "Pediatrics",
    "Ophthalmology",
    "Gastroenterology",
    "General Medicine",
    "Emergency",
  ];

  useEffect(() => {
    if (!user || user.role !== "doctor") return;
    axiosInstance
      .get(`/doctors/${user.id}`)
      .then((res) => {
        const d = res.data;
        setFormData({
          doctorId: d.id,
          email: d.doctoremailOrphone,
          name: d.name,
          qualification: d.degree,
          specialty: d.specialization,
          licenseNumber: "",
          issuingAuthority: "",
          clinicName: d.location?.split(",")[0] || "",
          address: d.location || "",
          phone: d.phone,
          website: "",
          workingDays: d.availability?.days || "",
          workingHours: d.availability?.time || "",
          departments: [d.service],
          languages: [],
          digitalSignature: "",
          profileImage: d.image,
          about: d.about,
        });
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
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiChange = (name: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [name]: value.split(",").map((v) => v.trim()),
    }));
  };
  // const [primaryIssuesList, setPrimaryIssuesList] = useState<
  //   { category: string; issues: string[] }[]
  // >([]);

  // useEffect(() => {
  //   fetch("http://localhost:5000/primaryIssues")
  //     .then((res) => res.json())
  //     .then((data) => setPrimaryIssuesList(data))
  //     .catch((err) => console.error("Failed to fetch primary issues", err));
  // }, []);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading("Uploading image...");

    try {
      // Convert file to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
      });

      // Upload to backend API (which uploads to Cloudinary)
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64Image }),
      });

      if (!res.ok) throw new Error("Cloudinary upload failed");

      const { url } = await res.json();

      // Update UI instantly
      setFormData((prev: any) => ({
        ...prev,
        [field]: url,
      }));

      // Save URL in DB
      await axiosInstance.put(`/doctors/${user?.id}`, {
        ...formData,
        [field]: url,
      });

      console.log(url, user?.id);

      toast.dismiss(loadingToast);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Upload failed");
    }
  };
  // const handleImageUpload = async (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   field: "profileImage" | "digitalSignature"
  // ) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const loadingToast = toast.loading("Uploading image...");

  //   try {
  //     // Convert to base64
  //     const base64Image = await new Promise<string>((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.readAsDataURL(file);
  //       reader.onloadend = () => resolve(reader.result as string);
  //       reader.onerror = reject;
  //     });

  //     // Upload to Cloudinary via API route
  //     const res = await fetch("/api/upload", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ file: base64Image }),
  //     });

  //     if (!res.ok) throw new Error("Cloudinary upload failed");

  //     const { url } = await res.json();

  //     // Update UI instantly
  //     setFormData((prev: any) => ({
  //       ...prev,
  //       [field]: url,
  //     }));

  //     // Save in DB
  //     await axiosInstance.put(`/doctors/${user?.id}`, {
  //       ...formData,
  //       [field]: url,
  //     });

  //     toast.dismiss(loadingToast);
  //     toast.success(
  //       field === "digitalSignature"
  //         ? "Signature uploaded successfully!"
  //         : "Profile image uploaded successfully!"
  //     );
  //   } catch (err) {
  //     console.error(err);
  //     toast.dismiss(loadingToast);
  //     toast.error("Upload failed");
  //   }
  // };

  // LOAD mapping (already similar to what we discussed)
  useEffect(() => {
    if (!user || user.role !== "doctor") return;
    axiosInstance
      .get(`/doctors/${user.id}`)
      .then((res) => {
        setFormData(res.data); // directly set from DB
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load profile");
        setLoading(false);
      });
  }, [user]);

  // SAVE mapping
  const saveProfile = async () => {
    try {
      await axiosInstance.put(`/doctors/${user?.id}`, formData); // send as-is
      toast.success("Profile updated!");
    } catch {
      toast.error("Update failed!");
    }
  };

  const renderInput = (
    label: string,
    name: string,
    value: string,
    readOnly = false
  ) => (
    <motion.div layout>
      <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
        {label}
        {!readOnly && (
          <button
            type="button"
            onClick={() => toggleEdit(name)}
            className="text-blue-500 hover:text-blue-700"
          >
            <MdEdit />
          </button>
        )}
      </label>
      <input
        name={name}
        value={value || ""}
        onChange={handleChange}
        readOnly={readOnly || !editFields[name]}
        className={`mt-1 p-2 w-full rounded-lg transition-all duration-300 border focus:outline-none focus:ring-2 ${
          editFields[name]
            ? "bg-white border-blue-500 ring-blue-300"
            : "bg-gray-100 border-gray-300 cursor-pointer"
        }`}
      />
    </motion.div>
  );

  if (loading || !formData) return <p className="p-4">Loading...</p>;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="max-w-5xl mx-auto bg-white/60 backdrop-blur-md shadow-2xl p-8 rounded-3xl mt-8 mb-12 border border-gray-200"
    >
      {/* Profile Photo */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <img
            src={formData.profileImage || "/Herodoc/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
          />
          <label
            htmlFor="profile-upload"
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition"
          >
            <MdEdit />
          </label>
          <input
            type="file"
            id="profile-upload"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "profileImage")}
            className="hidden"
          />
        </div>
        <h2 className="text-3xl font-bold text-blue-700 mt-4">
          {formData.name}
        </h2>
        <p className="text-gray-600">Update your details with ease</p>
      </div>
      {/* Unique ID */}
      {renderInput("Unique Doctor ID", "doctorId", formData.doctorId, true)}
      {/* Core Identification */}
      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
        Core Identification
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput("Full Name", "name", formData.name)}
        {renderInput(
          "Professional Qualification",
          "qualification",
          formData.qualification
        )}
        {/* Specialization */}
        <motion.div layout>
          <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
            Specialty
            <button
              type="button"
              onClick={() => toggleEdit("specialty")}
              className="text-blue-500 hover:text-blue-700"
            >
              <MdEdit />
            </button>
          </label>
          <select
            name="specialty"
            value={formData.specialty || ""}
            onChange={handleChange}
            disabled={!editFields["specialty"]}
            className={`mt-1 p-2 w-full rounded-xl border focus:outline-none transition duration-300 focus:ring-2 ${
              editFields["specialty"]
                ? "bg-white border-blue-500 ring-blue-300"
                : "bg-gray-100 border-gray-300 cursor-pointer"
            }`}
          >
            <option value="">Select Specialization</option>
            {specializationOptions.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>
        </motion.div>
        {renderInput(
          "Registration / License Number",
          "licenseNumber",
          formData.licenseNumber
        )}
        {renderInput(
          "Issuing Authority",
          "issuingAuthority",
          formData.issuingAuthority
        )}
      </div>
      {/* Contact & Practice Information */}
      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
        Contact & Practice Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInput("Clinic/Hospital Name", "clinicName", formData.clinicName)}
        {renderInput("Practice Address", "address", formData.address)}
        {renderInput("Phone Number", "phone", formData.phone)}
        {renderInput(
          "Email Address",
          "doctoremailOrphone",
          formData.doctoremailOrphone
        )}
        {renderInput("Website Link", "website", formData.website)}
      </div>
      {/* Professional & Availability Details */}

      {/* Professional & Availability Details */}
      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
        Professional & Availability Details
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Working Days with Ranges */}
        <motion.div layout>
          <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
            Working Days
            <button
              type="button"
              onClick={() => {
                const updated = Array.isArray(formData.workingDays)
                  ? [
                      ...formData.workingDays,
                      { start: "Monday", end: "Monday" },
                    ]
                  : [{ start: "Monday", end: "Monday" }];
                setFormData((prev: any) => ({ ...prev, workingDays: updated }));
              }}
              className="text-green-500 hover:text-green-700"
            >
              <MdAdd />
            </button>
          </label>

          {(Array.isArray(formData.workingDays)
            ? formData.workingDays
            : []
          ).map((range: { start: string; end: string }, idx: number) => (
            <div key={idx} className="flex gap-2 mt-2 items-center">
              <select
                value={range.start}
                onChange={(e) => {
                  const updated = [...formData.workingDays];
                  updated[idx].start = e.target.value;
                  setFormData((prev: any) => ({
                    ...prev,
                    workingDays: updated,
                  }));
                }}
                className="p-2 border rounded-lg bg-white flex-1"
              >
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <span className="text-gray-500">to</span>
              <select
                value={range.end}
                onChange={(e) => {
                  const updated = [...formData.workingDays];
                  updated[idx].end = e.target.value;
                  setFormData((prev: any) => ({
                    ...prev,
                    workingDays: updated,
                  }));
                }}
                className="p-2 border rounded-lg bg-white flex-1"
              >
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const updated = formData.workingDays.filter(
                    (_: any, i: number) => i !== idx
                  );
                  setFormData((prev: any) => ({
                    ...prev,
                    workingDays: updated,
                  }));
                }}
                className="text-red-500 hover:text-red-700"
              >
                <MdDelete />
              </button>
            </div>
          ))}
        </motion.div>

        {/* Working Hours with Ranges */}
        <motion.div layout>
          <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
            Working Hours
            <button
              type="button"
              onClick={() => {
                const updated = Array.isArray(formData.workingHours)
                  ? [...formData.workingHours, { start: "09:00", end: "17:00" }]
                  : [{ start: "09:00", end: "17:00" }];
                setFormData((prev: any) => ({
                  ...prev,
                  workingHours: updated,
                }));
              }}
              className="text-green-500 hover:text-green-700"
            >
              <MdAdd />
            </button>
          </label>

          {(Array.isArray(formData.workingHours)
            ? formData.workingHours
            : []
          ).map((range: { start: string; end: string }, idx: number) => (
            <div key={idx} className="flex gap-2 mt-2 items-center">
              <input
                type="time"
                value={range.start}
                onChange={(e) => {
                  const updated = [...formData.workingHours];
                  updated[idx].start = e.target.value;
                  setFormData((prev: any) => ({
                    ...prev,
                    workingHours: updated,
                  }));
                }}
                className="p-2 border rounded-lg bg-white flex-1"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={range.end}
                onChange={(e) => {
                  const updated = [...formData.workingHours];
                  updated[idx].end = e.target.value;
                  setFormData((prev: any) => ({
                    ...prev,
                    workingHours: updated,
                  }));
                }}
                className="p-2 border rounded-lg bg-white flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  const updated = formData.workingHours.filter(
                    (_: any, i: number) => i !== idx
                  );
                  setFormData((prev: any) => ({
                    ...prev,
                    workingHours: updated,
                  }));
                }}
                className="text-red-500 hover:text-red-700"
              >
                <MdDelete />
              </button>
            </div>
          ))}
        </motion.div>

        {/* Associated Departments stays same */}
        <motion.div layout>
          <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
            Associated Departments
            <button
              type="button"
              onClick={() => toggleEdit("departments")}
              className="text-blue-500 hover:text-blue-700"
            >
              <MdEdit />
            </button>
          </label>
          <input
            name="departments"
            value={formData.departments?.join(", ") || ""}
            onChange={(e) => handleMultiChange("departments", e.target.value)}
            readOnly={!editFields["departments"]}
            className={`mt-1 p-2 w-full rounded-lg transition-all duration-300 border focus:outline-none focus:ring-2 ${
              editFields["departments"]
                ? "bg-white border-blue-500 ring-blue-300"
                : "bg-gray-100 border-gray-300 cursor-pointer"
            }`}
          />
        </motion.div>

        {/* Languages Spoken */}
        <motion.div layout>
          <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
            Languages Spoken
            <button
              type="button"
              onClick={() => toggleEdit("languages")}
              className="text-blue-500 hover:text-blue-700"
            >
              <MdEdit />
            </button>
          </label>
          <input
            name="languages"
            value={formData.languages?.join(", ") || ""}
            onChange={(e) => handleMultiChange("languages", e.target.value)}
            readOnly={!editFields["languages"]}
            className={`mt-1 p-2 w-full rounded-lg transition-all duration-300 border focus:outline-none focus:ring-2 ${
              editFields["languages"]
                ? "bg-white border-blue-500 ring-blue-300"
                : "bg-gray-100 border-gray-300 cursor-pointer"
            }`}
          />
        </motion.div>
      </div>
      {/* Digital Signature */}
      <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
        Digital Signature
      </h3>
      <div className="flex flex-col items-start gap-2">
        {formData?.digitalSignature ? (
          <img
            src={formData.digitalSignature}
            alt="Digital Signature"
            className="w-40 h-auto border shadow-sm rounded bg-white p-1"
          />
        ) : (
          <p className="text-red-500 text-sm">
            Please upload digital signature
          </p>
        )}

        <div className="flex items-center justify-between w-full">
          <span className="text-sm text-gray-600">Digital Signature</span>
          <button
            type="button"
            onClick={() => toggleEdit("digitalSignature")}
            className="text-blue-500 hover:text-blue-700"
          >
            <MdEdit />
          </button>
        </div>

        {editFields["digitalSignature"] && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, "digitalSignature")}
            className="mt-1"
          />
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
          value={formData.about || ""}
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
