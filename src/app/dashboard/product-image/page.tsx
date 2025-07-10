"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/app/providers";
// @ts-ignore: No type definitions for cloudinary
import { v2 as cloudinary } from "cloudinary";

const ProductImageDashboard = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [error, setError] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const { token } = useUser();

  // Fetch products for dropdown
  useEffect(() => {
    if (!token) return;
    fetch("/api/dashboard/product", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      });
  }, [token]);

  useEffect(() => {
    fetch("/api/dashboard/product-image", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setImages(data);
          setError("");
        } else {
          setImages([]);
          setError(data?.error || "Failed to fetch images");
        }
        setLoading(false);
      })
      .catch(() => {
        setImages([]);
        setError("Failed to fetch images");
        setLoading(false);
      });
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!productId || !file) {
      setError("Product and image are required");
      return;
    }
    // Upload file to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const uploadData = await uploadRes.json();
    if (!uploadData.secure_url) {
      setError("Image upload failed");
      return;
    }
    const res = await fetch("/api/dashboard/product-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        productId,
        imageUrl: uploadData.secure_url,
        altText,
      }),
    });
    if (!res.ok) {
      setError("Failed to create image");
      return;
    }
    setProductId("");
    setAltText("");
    setFile(null);
    const newImage = await res.json();
    setImages((prev) => [...prev, newImage]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Product Images</h1>
      <form onSubmit={handleCreate} className="mb-6 flex gap-2 flex-wrap">
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="border px-3 py-2 rounded"
          required
        >
          <option value="" disabled>
            Select Product
          </option>
          {products.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Alt Text (optional)"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
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
              <th className="py-2 px-4 border-b">Image URL</th>
              <th className="py-2 px-4 border-b">Alt Text</th>
            </tr>
          </thead>
          <tbody>
            {images?.map((img) => (
              <tr key={img.id}>
                <td className="py-2 px-4 border-b">
                  {img.product?.name || img.productId}
                </td>
                <td className="py-2 px-4 border-b">{img.imageUrl}</td>
                <td className="py-2 px-4 border-b">{img.altText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductImageDashboard;
