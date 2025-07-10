"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/app/providers";

const ProductCategoryDashboard = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const { token } = useUser();

  useEffect(() => {
    fetch("/api/dashboard/product-category", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      });
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name) {
      setError("Name is required");
      return;
    }
    const res = await fetch("/api/dashboard/product-category", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ name, description }),
    });
    if (!res.ok) {
      setError("Failed to create category");
      return;
    }
    setName("");
    setDescription("");
    const newCategory = await res.json();
    setCategories((prev) => [...prev, newCategory]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Product Categories</h1>
      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </form>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white dark:bg-gray-900 rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Description</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="py-2 px-4 border-b">{cat.name}</td>
                <td className="py-2 px-4 border-b">{cat.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductCategoryDashboard;
