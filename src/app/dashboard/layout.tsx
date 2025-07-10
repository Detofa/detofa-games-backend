"use client";
import React from "react";
import Link from "next/link";
import Header from "@/components/Header";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Users", href: "/dashboard/users" },
  { name: "Products", href: "/dashboard/product" },
  { name: "Product Category", href: "/dashboard/product-category" },
  { name: "Product Availability", href: "/dashboard/product-availability" },
  { name: "Product Image", href: "/dashboard/product-image" },
  { name: "Orders", href: "/dashboard/orders" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-8 px-4 h-screen z-20 mt-32 overflow-y-auto">
        <div className="mb-10 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">Admin Panel</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {sidebarLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="mt-10 w-full rounded-lg bg-red-500 py-2 text-white font-semibold hover:bg-red-600 transition"
        >
          Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-10 mt-32 ml-0 lg:ml-14">{children}</main>
    </div>
  );
}
