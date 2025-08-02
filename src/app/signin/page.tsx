"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SigninPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      // Redirect admin to dashboard
      if (data.status === "ADMIN" || data.status?.endsWith("ADMIN")) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError("");

    try {
      // Step 1: Redirect to Google OAuth
      window.location.href = "/api/auth/google";
    } catch (err) {
      setError("Google login failed. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  // Check for Google OAuth callback parameters
  const checkForGoogleCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");
    const success = urlParams.get("success");
    const error = urlParams.get("error");
    const details = urlParams.get("details");

    if (error) {
      setError(
        `Google login failed: ${error}${details ? ` - ${details}` : ""}`
      );
      return;
    }

    if (success === "true" && token && user) {
      handleGoogleSuccess(token, user);
    }
  };

  const handleGoogleSuccess = (token: string, userStr: string) => {
    try {
      const user = JSON.parse(userStr);

      // Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", userStr);

      // Redirect based on user status
      if (user.status === "ADMIN" || user.status?.endsWith("ADMIN")) {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Failed to process Google login data");
    }
  };

  // Check for Google callback on component mount
  useEffect(() => {
    checkForGoogleCallback();
  }, []);

  return (
    <>
      <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="shadow-three dark:bg-dark mx-auto max-w-[500px] rounded-sm bg-white px-6 py-10 sm:p-[60px]">
                <h3 className="mb-3 text-center text-2xl font-bold text-black sm:text-3xl dark:text-white">
                  Sign in to your account
                </h3>
                <p className="text-body-color mb-11 text-center text-base font-medium">
                  Login to your account for a faster checkout.
                </p>
                {error && (
                  <p className="mb-4 text-center text-red-500">{error}</p>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-8">
                    <label
                      htmlFor="phone"
                      className="text-dark mb-3 block text-sm dark:text-white"
                    >
                      Phone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Enter your phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                    />
                  </div>
                  <div className="mb-8">
                    <label
                      htmlFor="password"
                      className="text-dark mb-3 block text-sm dark:text-white"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                    />
                  </div>
                  <div className="mb-6">
                    <button
                      type="submit"
                      className="shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 flex w-full items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300"
                    >
                      Sign in
                    </button>
                  </div>
                </form>
                <div className="mb-6">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="shadow-submit dark:shadow-submit-dark bg-red-600 hover:bg-red-700 disabled:bg-red-400 flex w-full items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300"
                  >
                    {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
                  </button>
                </div>
                <p className="text-body-color text-center text-base font-medium">
                  Don't you have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 z-[-1]">
          <svg
            width="1440"
            height="969"
            viewBox="0 0 1440 969"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_95:1005"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="1440"
              height="969"
            >
              <rect width="1440" height="969" fill="#090E34" />
            </mask>
            <g mask="url(#mask0_95:1005)">
              <path
                opacity="0.1"
                d="M1086.96 297.978L632.959 554.978L935.625 535.926L1086.96 297.978Z"
                fill="url(#paint0_linear_95:1005)"
              />
              <path
                opacity="0.1"
                d="M1324.5 755.5L1450 687V886.5L1324.5 967.5L-10 288L1324.5 755.5Z"
                fill="url(#paint1_linear_95:1005)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_95:1005"
                x1="1178.4"
                y1="151.853"
                x2="780.959"
                y2="453.581"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_95:1005"
                x1="160.5"
                y1="220"
                x2="1099.45"
                y2="1192.04"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>
    </>
  );
};

export default SigninPage;
