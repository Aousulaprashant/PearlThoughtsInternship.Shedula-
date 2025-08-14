"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type TabSwitcherProps = {
  signUp: boolean;
  toggle: (val: boolean) => void;
};

export default function TabSwitcher({ toggle, signUp }: TabSwitcherProps) {
  const [isSignUp, setIsSignUp] = useState(signUp);

  const handleSwitch = (val: boolean) => {
    setIsSignUp(val);
    toggle(val);
  };

  return (
    <div className="w-full max-w-md px-4 absolute right-11 top-[16%]">
      <div className="relative flex w-full justify-between rounded-full bg-gray-200 shadow-md">
        <motion.div
          className="absolute top-0 left-0 h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 z-0"
          animate={{ x: isSignUp ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        <div className="relative z-10 flex w-full">
          <button
            className={`w-1/2 py-3 cursor-pointer text-center text-sm md:text-base font-semibold rounded-full transition-colors duration-300 ${
              !isSignUp ? "text-white" : "text-blue-600 hover:bg-blue-100"
            }`}
            onClick={() => handleSwitch(false)}
          >
            Login
          </button>

          <button
            className={`w-1/2 py-3 cursor-pointer text-center text-sm md:text-base font-semibold rounded-full transition-colors duration-300 ${
              isSignUp ? "text-white" : "text-blue-600 hover:bg-blue-100"
            }`}
            onClick={() => handleSwitch(true)}
          >
            Sign Up
          </button>
        </div>
      </div>

      <div className="mt-4">
        {isSignUp ? (
          <div className="text-center text-gray-600 dark:text-gray-300 text-sm">
            Sign Up Form Goes Here
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-300 text-sm">
            Login Form Goes Here
          </div>
        )}
      </div>
    </div>
  );
}
