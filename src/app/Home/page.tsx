"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/context/UseContext-login";
import SignupForm from "@/components/signUp/page";
import ToggleSwitch from "@/components/ToggleSwich";
import axiosInstance from "@/utiles/axiosInstance";

const HomeHero = () => {
  const [isDoctor, setIsDoctor] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");

  const [showCredentials, setShowCredentials] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [signUp, setSignUp] = useState(false);
  const { user, setUser } = useUser();
  const userTestCredentials = [
    {
      name: "Pearl Thoghts",
      email: "p1@gmail.com",
      password: "11111",
    },
  ];

  const doctorTestCredentials = [
    {
      name: "Dr. Kumar Das",
      email: "drkumar@gmail.com",
      password: "111",
    },
    {
      name: "Dr. Shikha",
      email: "drshikha@gmail.com",
      password: "111",
    },
    {
      name: "Dr. Rajeev sing Kapoor",
      email: "drrajeev@gmail.com",
      password: "111",
    },
    {
      name: "Dr. Farah Siddiqui",
      email: "drfarah@gmail.com",
      password: "111",
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = isDoctor
        ? `/doctors?doctoremailOrphone=${emailOrPhone}&password=${password}`
        : `/users?emailOrPhone=${emailOrPhone}&password=${password}`;
      const res = await axiosInstance.get(url);

      const data = res.data;

      if (data.length === 1) {
        if (isDoctor) {
          const userWithRole = {
            ...data[0],
            role: "doctor",
          };
          localStorage.setItem("user", JSON.stringify(userWithRole));
          setUser(userWithRole);
          router.push("/docDashBoard");
        } else {
          const userWithRole = {
            ...data[0],
            role: isDoctor ? "doctor" : "patient",
          };
          localStorage.setItem("user", JSON.stringify(userWithRole));
          setUser(userWithRole);
          router.push("/doctors");
        }
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleGuestLogin = async () => {
    try {
      const res = await axiosInstance.get(
        `http://localhost:5000/users?emailOrPhone=p1@gmail.com&password=11111`
      );
      const data = res.data;

      if (data.length === 1) {
        localStorage.setItem("user", JSON.stringify(data[0]));
        router.push("/doctors"); // Change this path as needed
      } else {
        setError("Guest login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Guest login error");
    }
  };

  return (
    <section className="bg-white py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="mt-[-10%] block">
          <p className="text-cyan-500 font-medium">Online Consultation</p>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 leading-snug">
            Book a doctor’s appointment anytime,
            <br />
            anywhere with <span className="text-cyan-500">Schedula+</span>
          </h1>
          {!user && (
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="bg-blue-500 text-white px-4 py-2 rounded "
            >
              Click here For Test Credentials
            </button>
          )}
          {showCredentials && (
            <div className="mt-4 space-y-4">
              <div>
                <h2 className="text-lg font-bold">Users</h2>
                <ul className="list-disc list-inside">
                  {userTestCredentials.map((user, index) => (
                    <li key={index}>
                      {user.name} - <strong>{user.email}</strong> /{" "}
                      {user.password}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold">Doctors</h2>
                <ul className="list-disc list-inside">
                  {doctorTestCredentials.map((doc, index) => (
                    <li key={index}>
                      {doc.name} - <strong>{doc.email}</strong> / {doc.password}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {user ? (
          <div className="mr-14 rounded-lg  mt-5">
            <Image
              src="/Herodoc/langingPagePic.png"
              alt=""
              width={200}
              height={100}
            />
          </div>
        ) : signUp ? (
          <>
            <ToggleSwitch signUp={signUp} toggle={setSignUp} />
            <SignupForm />
          </>
        ) : (
          <>
            <ToggleSwitch signUp={signUp} toggle={setSignUp} />

            <div className="p-6 rounded-lg w-full lg:w-1/2 max-w-md mt-10 lg:mt-0">
              <h2 className="text-2xl font-semibold text-blue-900 mb-4">
                {/* {isDoctor ? "Doctor Login" : "User Login"} */}
              </h2>
              <form className="space-y-4" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="text"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error && (
                  <div className="text-red-600 text-sm mt-1">{error}</div>
                )}

                <button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-md font-medium"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => setIsDoctor(!isDoctor)}
                  className="w-full mt-2 text-sm text-cyan-600 hover:underline"
                >
                  {isDoctor
                    ? "Login as User instead"
                    : "Login as Doctor instead"}
                </button>

                <div className="border-t pt-4 mt-4">
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full border border-gray-300 text-gray-600 py-2 rounded-md hover:bg-gray-100 text-sm"
                  >
                    Continue as Guest
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HomeHero;
