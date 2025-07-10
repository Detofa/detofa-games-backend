"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/app/providers";

const ProductAvailabilityDashboard = () => {
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [stock, setStock] = useState(0);
  const [error, setError] = useState("");
  const { token } = useUser();

  useEffect(() => {
    fetch("/api/dashboard/product-availability", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setAvailabilities(data);
        setLoading(false);
      });
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!productId || !city) {
      setError("Product and city are required");
      return;
    }
    const res = await fetch("/api/dashboard/product-availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ productId, city, country, stock }),
    });
    if (!res.ok) {
      setError("Failed to create availability");
      return;
    }
    setProductId("");
    setCity("");
    setCountry("");
    setStock(0);
    const newAvailability = await res.json();
    setAvailabilities((prev) => [...prev, newAvailability]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Product Availability</h1>
      <form onSubmit={handleCreate} className="mb-6 flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Country (optional)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
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
              <th className="py-2 px-4 border-b">Product</th>
              <th className="py-2 px-4 border-b">City</th>
              <th className="py-2 px-4 border-b">Country</th>
              <th className="py-2 px-4 border-b">Stock</th>
            </tr>
          </thead>
          <tbody>
            {availabilities.map((a) => (
              <tr key={a.id}>
                <td className="py-2 px-4 border-b">
                  {a.product?.name || a.productId}
                </td>
                <td className="py-2 px-4 border-b">{a.city}</td>
                <td className="py-2 px-4 border-b">{a.country}</td>
                <td className="py-2 px-4 border-b">{a.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductAvailabilityDashboard;
