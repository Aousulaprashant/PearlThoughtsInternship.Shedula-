"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

type Props = {
  appointment: {
    appointmentDate: string;
    appointmentTime: string;
  };
  onClose: () => void;
  onSubmit: (newDate: string, newTime: string) => void;
};

export default function RescheduleModal({
  appointment,
  onClose,
  onSubmit,
}: Props) {
  const [newDate, setNewDate] = useState(appointment.appointmentDate);
  const [newTime, setNewTime] = useState(appointment.appointmentTime);

  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="ease-in duration-150"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <Dialog.Panel className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Reschedule Appointment
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">New Date</label>
                  <input
                    type="date"
                    className="w-full border p-2 rounded"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">New Time</label>
                  <input
                    type="time"
                    className="w-full border p-2 rounded"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSubmit(newDate, newTime)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
