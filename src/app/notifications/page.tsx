import Sidebar from "@/components/DoctorSlideBar";

export default function Notifications() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 px-4">
        <h1 className="text-3xl font-bold mb-4">🔧 Notifications</h1>
        <p className="text-lg text-gray-700 mb-2">
          This page is currently under construction.
        </p>
        <p className="text-lg text-gray-700">Please check back soon!</p>
      </div>
    </div>
  );
}
