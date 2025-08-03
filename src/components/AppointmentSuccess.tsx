"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FaUserMd,
  FaMoneyBillAlt,
  FaClock,
  FaMapMarkerAlt,
  FaLock,
  FaHashtag,
} from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import { HiOutlineCalendar } from "react-icons/hi";
import Image from "next/image";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const AppointmentConfirmationModal = ({ isOpen, onClose }: Props) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Background Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Centered Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl overflow-hidden relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>

              <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Left Side Content */}
                <div className="w-full lg:w-2/3">
                  {/* Success Banner */}
                  <div className="bg-[#f1f6fd] rounded-xl p-5 shadow-sm mb-6">
                    <h2 className="text-3xl font-semibold text-[#1b1e3d]">
                      Your appointment has been <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-700">
                        successfully
                      </span>{" "}
                      booked
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      We look forward to seeing you! A confirmation has{" "}
                      <br className="hidden sm:block" />
                      been sent to your email
                    </p>
                  </div>

                  {/* Appointment Details */}
                  <div className="space-y-4 text-[15px] text-[#1b1e3d]">
                    <DetailItem
                      icon={<FaUserMd />}
                      label="Doctor"
                      value="Sarah El-Masry"
                    />
                    <DetailItem
                      icon={<MdMedicalServices />}
                      label="Specialty"
                      value="Gastroenterology & Hepatology"
                    />
                    <DetailItem
                      icon={<FaMoneyBillAlt />}
                      label="Consultation Fee"
                      value="$350"
                    />
                    <DetailItem
                      icon={<HiOutlineCalendar />}
                      label="Date"
                      value="Monday, 17 March 2025"
                    />
                    <DetailItem
                      icon={<FaClock />}
                      label="Time"
                      value="12:30 PM"
                    />
                    <DetailItem
                      icon={<FaMapMarkerAlt />}
                      label="Clinic Address"
                      value="18 Al-Nasr Street, Nasr City"
                    />
                    <DetailItem
                      icon={<FaLock />}
                      label="Payment Method"
                      value="Cash"
                    />
                    <DetailItem
                      icon={<FaHashtag />}
                      label="Booking Reference Number"
                      value="#APT-56924"
                    />
                  </div>
                </div>

                {/* Right Side Image */}
                <div className="hidden lg:block w-1/3 relative h-[400px]">
                  <Image
                    src="/Herodoc/langingPagePic.png"
                    alt="Doctor Illustration"
                    width={300}
                    height={400}
                    className="object-contain"
                  />
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

type DetailItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const DetailItem = ({ icon, label, value }: DetailItemProps) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-blue-900 text-lg">{icon}</div>
    <div>
      <span className="font-semibold">{label}:</span>{" "}
      <span className="text-gray-700">{value}</span>
    </div>
  </div>
);

export default AppointmentConfirmationModal;
