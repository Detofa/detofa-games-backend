"use client";

import { ThemeProvider } from "next-themes";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  token: string | null;
  status: string | null;
  setToken: (token: string | null) => void;
  setStatus: (status: string | null) => void;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (storedToken) {
      setToken(storedToken);
      // Decode the JWT to get status (simple base64 decode, not secure for prod)
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        setStatus(payload.status || null);
      } catch {
        setStatus(null);
      }
    }
  }, []);

  const isLoggedIn = !!token;

  return (
    <UserContext.Provider
      value={{ token, setToken, status, setStatus, isLoggedIn }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      <UserProvider>{children}</UserProvider>
    </ThemeProvider>
  );
}
