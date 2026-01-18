"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/app/providers";
import {
  Download,
  Trash2,
  Edit,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AppsDashboard = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { token } = useUser();

  // Form state
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<"IOS" | "ANDROID" | "WEB">(
    "ANDROID"
  );
  const [version, setVersion] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [size, setSize] = useState("");
  const [minVersion, setMinVersion] = useState("");
  const [releaseNotes, setReleaseNotes] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "BETA">(
    "ACTIVE"
  );
  const [appFile, setAppFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [previewImageFiles, setPreviewImageFiles] = useState<File[]>([]);
  const [previewImageUrls, setPreviewImageUrls] = useState<string[]>([]);
  const [previewImageObjectUrls, setPreviewImageObjectUrls] = useState<
    string[]
  >([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchApps();
    }
  }, [token]);

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      previewImageObjectUrls.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [previewImageObjectUrls]);

  const fetchApps = async () => {
    try {
      const res = await fetch("/api/dashboard/app", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setApps(data);
        setError("");
      } else {
        setApps([]);
        setError(data?.error || "Failed to fetch apps");
      }
    } catch (err) {
      setApps([]);
      setError("Failed to fetch apps");
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
      );

      // Use raw upload for APK/IPA files, image upload for icons
      const resourceType = folder === "app-icons" ? "image" : "raw";
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const uploadData = JSON.parse(xhr.responseText);
          if (uploadData.secure_url) {
            setUploadProgress(0);
            resolve(uploadData.secure_url);
          } else {
            setUploadProgress(0);
            reject(new Error("Upload failed: Invalid response from server"));
          }
        } else {
          setUploadProgress(0);
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`));
          } catch {
            reject(new Error(`Upload failed: HTTP ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener("error", () => {
        setUploadProgress(0);
        reject(new Error("Upload failed: Network error"));
      });

      xhr.addEventListener("abort", () => {
        setUploadProgress(0);
        reject(new Error("Upload cancelled"));
      });

      xhr.open("POST", `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`);
      xhr.send(formData);
    });
  };

  const handleStepSubmit = async (currentStepData: any) => {
    setError("");
    setMessage("");
    setIsUploading(true);

    try {
      let body: any = { ...currentStepData, step: currentStep };

      // Handle file uploads for step 2
      if (currentStep === 2 && appFile) {
        try {
          const finalFileUrl = await uploadFile(appFile, "app-files");
          body.fileUrl = finalFileUrl;
          body.size = size; // Include size if calculated
        } catch (uploadError: any) {
          setError(`App file upload failed: ${uploadError.message}. Please check your internet connection and ensure the file is not corrupted.`);
          setIsUploading(false);
          return null;
        }
      }

      // Handle file uploads for step 3
      if (currentStep === 3) {
        let finalIconUrl = iconUrl;
        let finalPreviewImages: string[] = previewImageUrls || [];

        // Upload icon if provided
        if (iconFile) {
          try {
            finalIconUrl = await uploadFile(iconFile, "app-icons");
        } catch (uploadError: any) {
          setError(`App icon upload failed: ${uploadError.message}. Please ensure the file is a valid image format (PNG, JPG, etc.) and under 10MB.`);
          setIsUploading(false);
          return null;
        }
        }

        // Upload preview images if provided
        if (previewImageFiles.length > 0) {
          try {
            const uploadedPreviewUrls = await Promise.all(
              previewImageFiles.map((file) => uploadFile(file, "app-previews"))
            );
            finalPreviewImages = [...previewImageUrls, ...uploadedPreviewUrls];
          } catch (uploadError: any) {
            setError(`Preview images upload failed: ${uploadError.message}`);
            setIsUploading(false);
            return null;
          }
        }

        body.iconUrl = finalIconUrl || null;
        body.previewImages =
          finalPreviewImages.length > 0 ? finalPreviewImages : null;
      }

      if (editingId) {
        body.id = editingId;
      }

      const res = await fetch("/api/dashboard/app", {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(`Failed to save step ${currentStep}: ${errorData.error || "Unknown server error"}`);
        setIsUploading(false);
        return null;
      }

      const savedApp = await res.json();

      if (currentStep === 1) {
        // For step 1, we get back the created app with ID
        setEditingId(savedApp.id);
      }

      setIsUploading(false);
      return savedApp;
    } catch (err: any) {
      setError(`Failed to save step ${currentStep}: ${err.message || "Unknown error occurred"}`);
      setIsUploading(false);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      // Get current step data
      const currentStepData = getCurrentStepData();

      // Submit current step
      const result = await handleStepSubmit(currentStepData);

      if (!result) return; // Error occurred

      if (currentStep < 3) {
        // Move to next step
        nextStep();
        setMessage(`Step ${currentStep} saved successfully!`);
      } else {
        // Final step completed
        setMessage("App created successfully!");
        resetForm();
        await fetchApps();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save app");
    }
  };

  const getCurrentStepData = () => {
    switch (currentStep) {
      case 1:
        return {
          name,
          platform,
          version,
          description: description || null,
          size: size || null,
          minVersion: minVersion || null,
          releaseNotes: releaseNotes || null,
          status,
        };
      case 2:
        return {
          fileUrl: fileUrl || null,
        };
      case 3:
        return {
          iconUrl: iconUrl || null,
          previewImages: previewImageUrls || null,
        };
      default:
        return {};
    }
  };

  const handleEdit = (app: any) => {
    setEditingId(app.id);
    setCurrentStep(1);
    setName(app.name);
    setPlatform(app.platform);
    setVersion(app.version);
    setDescription(app.description || "");
    setFileUrl(app.fileUrl);
    setIconUrl(app.iconUrl || "");
    setSize(app.size || "");
    setMinVersion(app.minVersion || "");
    setReleaseNotes(app.releaseNotes || "");
    setStatus(app.status);
    setAppFile(null);
    setIconFile(null);
    // Handle preview images - could be array or null
    const previews = app.previewImages;
    setPreviewImageUrls(Array.isArray(previews) ? previews : []);
    setPreviewImageFiles([]);
  };

  const handleContinue = (app: any) => {
    // Find the first incomplete step
    const completedSteps = app.completedSteps || {};
    let nextStep = 1;
    if (!completedSteps.step1) {
      nextStep = 1;
    } else if (!completedSteps.step2) {
      nextStep = 2;
    } else if (!completedSteps.step3) {
      nextStep = 3;
    }

    setEditingId(app.id);
    setCurrentStep(nextStep);
    setName(app.name);
    setPlatform(app.platform);
    setVersion(app.version);
    setDescription(app.description || "");
    setFileUrl(app.fileUrl || "");
    setIconUrl(app.iconUrl || "");
    setSize(app.size || "");
    setMinVersion(app.minVersion || "");
    setReleaseNotes(app.releaseNotes || "");
    setStatus(app.status);
    setAppFile(null);
    setIconFile(null);
    // Handle preview images - could be array or null
    const previews = app.previewImages;
    setPreviewImageUrls(Array.isArray(previews) ? previews : []);
    setPreviewImageFiles([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this app?")) return;

    try {
      const res = await fetch(`/api/dashboard/app?id=${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        setError("Failed to delete app");
        return;
      }

      setMessage("App deleted successfully!");
      await fetchApps();
    } catch (err) {
      setError("Failed to delete app");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setCurrentStep(1);
    setName("");
    setPlatform("ANDROID");
    setVersion("");
    setDescription("");
    setFileUrl("");
    setIconUrl("");
    setSize("");
    setMinVersion("");
    setReleaseNotes("");
    setStatus("ACTIVE");
    setAppFile(null);
    setIconFile(null);
    // Cleanup object URLs
    previewImageObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewImageFiles([]);
    setPreviewImageUrls([]);
    setPreviewImageObjectUrls([]);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!name && !!platform && !!version;
      case 2:
        return !!appFile || !!fileUrl;
      case 3:
        return true; // Optional fields
      default:
        return false;
    }
  };

  const handlePreviewImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPreviewImageFiles([...previewImageFiles, ...files]);
      // Create object URLs for preview
      const newObjectUrls = files.map((file) => URL.createObjectURL(file));
      setPreviewImageObjectUrls([...previewImageObjectUrls, ...newObjectUrls]);
    }
    // Reset input
    e.target.value = "";
  };

  const handlePreviewImageRemove = (index: number, isFile: boolean) => {
    if (isFile) {
      // Revoke object URL before removing
      const urlToRevoke = previewImageObjectUrls[index];
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
      setPreviewImageFiles(previewImageFiles.filter((_, i) => i !== index));
      setPreviewImageObjectUrls(
        previewImageObjectUrls.filter((_, i) => i !== index)
      );
    } else {
      setPreviewImageUrls(previewImageUrls.filter((_, i) => i !== index));
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Apps</h1>

      {/* Multi-Step Form */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    currentStep > step
                      ? "bg-primary"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Step 1: Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    App Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Platform *
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                    required
                  >
                    <option value="ANDROID">Android</option>
                    <option value="IOS">iOS</option>
                    <option value="WEB">Web</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Version *
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g., 1.0.0"
                    className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BETA">Beta</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g., 25.5 MB"
                    className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Min OS Version
                  </label>
                  <input
                    type="text"
                    value={minVersion}
                    onChange={(e) => setMinVersion(e.target.value)}
                    placeholder="e.g., iOS 13.0 or Android 8.0"
                    className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Release Notes
                </label>
                <textarea
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  rows={3}
                  placeholder="What's new in this version..."
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          )}

          {/* Step 2: App File */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Step 2: App File</h3>
              <div>
                <label className="block text-sm font-medium mb-1">
                  App File (APK/IPA) *
                </label>
                <input
                  type="file"
                  accept={
                    platform === "IOS"
                      ? ".ipa"
                      : platform === "ANDROID"
                      ? ".apk"
                      : "*"
                  }
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAppFile(file);
                    if (file) {
                      setSize(formatFileSize(file.size));
                      setFileUrl("");
                    }
                  }}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                  required={!fileUrl}
                />
                {fileUrl && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Current: {fileUrl.substring(0, 50)}...
                  </p>
                )}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Media */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Step 3: Media</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  App Icon
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setIconFile(file);
                    if (file) setIconUrl("");
                  }}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600"
                />
                {iconUrl && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Current: {iconUrl.substring(0, 50)}...
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Preview Images (App Store Screenshots)
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Upload multiple images to show how your app looks (like Play
                  Store screenshots)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePreviewImageAdd}
                  className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:border-gray-600 mb-3"
                />

                {/* Display existing preview images */}
                {previewImageUrls.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium mb-2">
                      Existing Preview Images:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {previewImageUrls.map((url, index) => (
                        <div
                          key={`existing-${index}`}
                          className="relative group"
                        >
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handlePreviewImageRemove(index, false)
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display newly added preview images (files) */}
                {previewImageFiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">
                      New Preview Images:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {previewImageFiles.map((file, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={previewImageObjectUrls[index]}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handlePreviewImageRemove(index, true)
                            }
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="submit"
                disabled={isUploading}
                className={`px-6 py-2 rounded flex items-center gap-2 ${
                  isUploading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : currentStep < 3 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                ) : editingId ? (
                  <>
                    <Check className="h-4 w-4" />
                    Update App
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Create App
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

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

      {/* Apps List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded shadow overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-3 px-4 text-left border-b">Name</th>
                <th className="py-3 px-4 text-left border-b">Platform</th>
                <th className="py-3 px-4 text-left border-b">Version</th>
                <th className="py-3 px-4 text-left border-b">Downloads</th>
                <th className="py-3 px-4 text-left border-b">Status</th>
                <th className="py-3 px-4 text-left border-b">Progress</th>
                <th className="py-3 px-4 text-left border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="py-3 px-4 border-b">{app.name}</td>
                  <td className="py-3 px-4 border-b">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-sm">
                      {app.platform}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">{app.version}</td>
                  <td className="py-3 px-4 border-b">
                    <span className="font-semibold">{app.downloadCount}</span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        app.status === "ACTIVE"
                          ? "bg-green-100 dark:bg-green-900"
                          : app.status === "BETA"
                          ? "bg-yellow-100 dark:bg-yellow-900"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            (app as any).completedSteps &&
                            (app as any).completedSteps[`step${step}`]
                              ? "bg-green-500 text-white"
                              : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {step}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex gap-2">
                      {(!(app as any).isComplete ||
                        ((app as any).completedSteps &&
                          (!(app as any).completedSteps.step1 ||
                            !(app as any).completedSteps.step2 ||
                            !(app as any).completedSteps.step3))) && (
                        <button
                          onClick={() => handleContinue(app)}
                          className="text-orange-600 hover:text-orange-800"
                          title="Continue"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(app)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {apps.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No apps found. Create your first app above.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppsDashboard;
