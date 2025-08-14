import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-blue-600 ">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-white text-sm">
        {/* Logo and Description */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="text-2xl font-bold text-white">Shedula</div>
            <span className="text-xl font-semibold text-white">
              +<span className="text-cyan-300">Plus</span>
            </span>
          </div>
          <p className="text-white/80">
            Your trusted platform for fast and easy doctor appointments.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h4 className="font-semibold mb-3 text-white">Explore</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-cyan-200">
                Home
              </Link>
            </li>
            <li>
              <Link href="/specialties" className="hover:text-cyan-200">
                Specialties
              </Link>
            </li>
            <li>
              <Link href="/doctors" className="hover:text-cyan-200">
                Doctors
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-cyan-200">
                Services
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Info */}
        <div>
          <h4 className="font-semibold mb-3 text-white">Company</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="hover:text-cyan-200">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-cyan-200">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-cyan-200">
                Register
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-cyan-200">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold mb-3 text-white">Contact</h4>
          <ul className="space-y-2 text-white/80">
            <li>Email: support@pearlthoughts.com</li>
            <li>Phone: +91 98765 43210</li>
            <li>Location: Hyderabad, India</li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/20 text-center text-white/70 py-4 text-xs">
        <span className="font-bold text-blue-800">
          © {new Date().getFullYear()} Pearl Thoughts
        </span>
        . All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
