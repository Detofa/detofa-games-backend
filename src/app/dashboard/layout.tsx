"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import {
  LayoutDashboard,
  Users,
  Package,
  Tag,
  MapPin,
  Image,
  ShoppingCart,
  Smartphone,
  Ticket,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

const sidebarLinks = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Products", href: "/dashboard/product", icon: Package },
  { name: "Product Category", href: "/dashboard/product-category", icon: Tag },
  {
    name: "Product Availability",
    href: "/dashboard/product-availability",
    icon: MapPin,
  },
  { name: "Product Image", href: "/dashboard/product-image", icon: Image },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingCart },
  { name: "Apps", href: "/dashboard/apps", icon: Smartphone },
  { name: "Tickets", href: "/dashboard/tickets", icon: Ticket },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-16" : "w-64"
        } backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-r border-white/20 dark:border-gray-700/50 flex flex-col z-20 mt-32 transition-all duration-500 ease-in-out shadow-2xl shadow-black/10`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 dark:border-gray-700/50">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl hover:bg-white/10 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:shadow-md hover:shadow-primary/10"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-gray-500 dark:text-gray-400 group-hover:text-primary group-hover:scale-110"
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{link.name}</span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-16 ml-2 px-3 py-2 bg-gray-900/90 backdrop-blur-md text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                        {link.name}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/20 dark:border-gray-700/50">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
            className={`group flex items-center w-full rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 ${
              isCollapsed ? "justify-center" : ""
            } text-red-500 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white hover:shadow-lg hover:shadow-red-500/25`}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 transition-all duration-300 group-hover:rotate-12" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
            {isCollapsed && (
              <div className="absolute left-16 ml-2 px-3 py-2 bg-red-600/90 backdrop-blur-md text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                Logout
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 p-6 mt-32 transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-0 lg:ml-4"
        }`}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
