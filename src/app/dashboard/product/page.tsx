"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@/app/providers";

const ProductDashboard = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [pointprice, setPointprice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useUser();

  // Fetch products from backend (admin route)
  const fetchProducts = async () => {
    const res = await fetch("/api/dashboard/product", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  };

  // Fetch categories from backend (admin route)
  const fetchCategories = async () => {
    const res = await fetch("/api/dashboard/product-category", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchCategories();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          pointprice: parseInt(pointprice, 10),
          categoryId,
          description,
        }),
      });
      if (!res.ok) {
        setMessage("Failed to create product");
      } else {
        setMessage("Product created successfully!");
        setName("");
        setPrice("");
        setPointprice("");
        setCategoryId("");
        setDescription("");
        await fetchProducts(); // Refresh product list
      }
    } catch {
      setMessage("Failed to create product");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Products</h1>

        {/* Create Product Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white rounded shadow p-6 flex flex-col gap-4 max-w-xl"
        >
          <h2 className="text-xl font-semibold mb-2">Create Product</h2>
          {message && <p className="text-sm text-green-600">{message}</p>}
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border px-3 py-2 rounded"
            required
            min="0"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Point Price"
            value={pointprice}
            onChange={(e) => setPointprice(e.target.value)}
            className="border px-3 py-2 rounded"
            required
            min="0"
            step="1"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="border px-3 py-2 rounded"
            required
          >
            <option value="" disabled>
              Select Category
            </option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border px-3 py-2 rounded"
            rows={3}
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded mt-2"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </form>

        {/* Product List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="bg-white rounded shadow p-4 flex flex-col items-center"
            >
              <img
                src={
                  product.images && product.images.length > 0
                    ? product.images[0].imageUrl
                    : "/placeholder.png"
                }
                alt={product.name}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="font-bold text-lg mb-1">{product.name}</h3>
              <p className="text-gray-600 mb-1">${product.price}</p>
              <p className="text-blue-600 mb-1">Points: {product.pointprice}</p>
              <p className="text-gray-500 text-sm mb-1">
                {product.category?.name || product.categoryId}
              </p>
              <p className="text-gray-400 text-xs">{product.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;
