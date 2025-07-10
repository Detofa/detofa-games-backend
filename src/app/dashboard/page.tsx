"use client";
import React from "react";
import Link from "next/link";

const DashboardPage = () => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-lg text-gray-700 dark:text-gray-200">
        Welcome, admin! Here you can manage the platform.
      </p>
      {/* Add dashboard widgets or stats here */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg bg-white dark:bg-gray-800 shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          <p className="text-2xl font-bold">123</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Products</h2>
          <p className="text-2xl font-bold">45</p>
        </div>
        <div className="rounded-lg bg-white dark:bg-gray-800 shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Orders</h2>
          <p className="text-2xl font-bold">67</p>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
