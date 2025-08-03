// src/context/UseContext-login.ts
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define the type of your context value
type UserType = {
  name: string;
  email: string;
  role: "patient" | "doctor";
};

type UserContextType = {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
};

// Create the context with default undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create the provider component
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);

  // Optional: You can fetch user from localStorage or API
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook for consuming context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
