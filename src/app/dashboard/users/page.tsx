"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/app/providers";
import { Check, X } from "lucide-react";

const UsersDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token } = useUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStatus = (user: any) => {
    setEditingId(user.id);
    setSelectedStatus(user.status);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedStatus("");
  };

  const handleUpdateStatus = async (userId: string) => {
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          id: userId,
          status: selectedStatus,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Failed to update user status");
        return;
      }

      const updatedUser = await res.json();

      // Update the user in the local state
      setUsers(users.map(user =>
        user.id === userId ? updatedUser : user
      ));

      setMessage("User status updated successfully!");
      setEditingId(null);
      setSelectedStatus("");

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ADMIN":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "STAFF":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "FILEDTEAM":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "SNAKEADMIN":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "TETRISADMIN":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "FLAPPYBIRDADMIN":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start">
            <X className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Error
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                Success
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">{message}</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-3 px-4 text-left border-b">Name</th>
                <th className="py-3 px-4 text-left border-b">Email</th>
                <th className="py-3 px-4 text-left border-b">Phone</th>
                <th className="py-3 px-4 text-left border-b">Status</th>
                <th className="py-3 px-4 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 border-b">{user.name}</td>
                  <td className="py-3 px-4 border-b">{user.email}</td>
                  <td className="py-3 px-4 border-b">{user.phone}</td>
                  <td className="py-3 px-4 border-b">
                    {editingId === user.id ? (
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full border px-2 py-1 rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="STAFF">STAFF</option>
                        <option value="FILEDTEAM">FILEDTEAM</option>
                        <option value="SNAKEADMIN">SNAKEADMIN</option>
                        <option value="TETRISADMIN">TETRISADMIN</option>
                        <option value="FLAPPYBIRDADMIN">FLAPPYBIRDADMIN</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b">
                    {editingId === user.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(user.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditStatus(user)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Edit Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersDashboard;
