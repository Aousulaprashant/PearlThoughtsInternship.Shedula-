"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UseContext-login";
import { FiLogOut, FiMoreVertical, FiUser } from "react-icons/fi";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const linkClass = (href: string, base: string) =>
    isActive(href)
      ? `${base} text-blue-600 underline underline-offset-4 font-semibold`
      : base;

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    router.push("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleClick = () => {
    if (user?.role === "doctor") {
      router.push("/Docappointments");
    } else {
      router.push("/");
    }
  };
  return (
    <header className="bg-white shadow-sm relative">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div
          className="flex items-center space-x-1 cursor-pointer"
          onClick={handleClick}
        >
          <div className="text-blue-500 text-4xl font-bold">Schedula</div>
          <span className="text-xl font-bold text-blue-600">
            <span className="text-cyan-500 text-2xl relative bottom-1.5">
              +
            </span>
          </span>
        </div>

        {user?.role === "doctor" ? (
          // 👇 Doctor Dropdown Section 👇
          <>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                title="More options"
              >
                <FiMoreVertical size={22} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border z-50">
                  <Link
                    href="/doctor/profile"
                    className="flex items-center px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    <FiUser className="mr-2" /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : user ? (
          <nav className="hidden md:flex space-x-6 text-sm font-bold">
            <Link
              href="/"
              className={
                isActive("/")
                  ? "text-blue-600 underline underline-offset-4 font-semibold"
                  : "text-gray-700 hover:text-blue-600"
              }
              aria-current={isActive("/") ? "page" : undefined}
            >
              Home
            </Link>
            <Link
              href="/appointments"
              className={linkClass(
                "/appointments",
                "text-gray-700 hover:text-blue-600"
              )}
              aria-current={isActive("/appointments") ? "page" : undefined}
            >
              Appointments
            </Link>
            <Link
              href="/doctors"
              className={linkClass(
                "/doctors",
                "text-gray-700 hover:text-blue-600"
              )}
              aria-current={isActive("/doctors") ? "page" : undefined}
            >
              Doctors
            </Link>
            <Link
              href="/services"
              className={linkClass(
                "/services",
                "text-gray-700 hover:text-blue-600"
              )}
              aria-current={isActive("/services") ? "page" : undefined}
            >
              Services
            </Link>
            <Link
              href=""
              className={linkClass(
                "/appointments",
                "text-gray-700 hover:text-blue-600"
              )}
              onClick={handleLogout}
            >
              Logout
            </Link>
          </nav>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
