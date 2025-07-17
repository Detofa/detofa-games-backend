"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "../providers";

const AccountPage = () => {
  const { token } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch("/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to load profile");
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to request deletion of your account data? This action cannot be undone."
      )
    )
      return;
    setDeleteStatus("pending");
    try {
      const res = await fetch("/api/users/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setDeleteStatus("success");
    } catch (err) {
      setDeleteStatus("error");
    }
  };

  return (
    <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        {loading && <p>Loading profile...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {profile && (
          <div className="mb-8">
            <p>
              <strong>Name:</strong> {profile.name}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            {profile.phone && (
              <p>
                <strong>Phone:</strong> {profile.phone}
              </p>
            )}
            {/* Add more fields as needed */}
          </div>
        )}
        <button
          onClick={handleDelete}
          className="rounded bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700 transition"
          disabled={deleteStatus === "pending"}
        >
          {deleteStatus === "pending"
            ? "Requesting..."
            : "Request Data Deletion"}
        </button>
        {deleteStatus === "success" && (
          <p className="mt-4 text-green-600 font-semibold">
            Your data deletion request has been submitted. Our team will process
            it soon.
          </p>
        )}
        {deleteStatus === "error" && (
          <p className="mt-4 text-red-600 font-semibold">
            Failed to submit request. Please try again.
          </p>
        )}
      </div>
    </section>
  );
};

export default AccountPage;
