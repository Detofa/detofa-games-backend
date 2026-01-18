"use client";

import { Download, Smartphone, Tablet, Monitor, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

type PlatformFilter = "ALL" | "IOS" | "ANDROID" | "WEB";

export default function DownloadAppsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>("ALL");

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await fetch("/api/apps");
      const data = await res.json();
      if (Array.isArray(data)) {
        setApps(data);
      }
    } catch (error) {
      console.error("Failed to fetch apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (appId: string, fileUrl: string) => {
    try {
      // Track download
      await fetch("/api/apps/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appId }),
      });

      // Open download link
      window.open(fileUrl, "_blank");
    } catch (error) {
      console.error("Failed to track download:", error);
      // Still open the download link even if tracking fails
      window.open(fileUrl, "_blank");
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "IOS":
        return <Smartphone className="h-10 w-10 text-primary" />;
      case "ANDROID":
        return <Tablet className="h-10 w-10 text-primary" />;
      case "WEB":
        return <Monitor className="h-10 w-10 text-primary" />;
      default:
        return <Smartphone className="h-10 w-10 text-primary" />;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case "IOS":
        return "iOS";
      case "ANDROID":
        return "Android";
      case "WEB":
        return "Web";
      default:
        return "App";
    }
  };

  // Filter apps based on selected platform
  const filteredApps = apps.filter((app) => {
    if (selectedPlatform === "ALL") return app.status === "ACTIVE";
    return app.platform === selectedPlatform && app.status === "ACTIVE";
  });

  const platforms: { value: PlatformFilter; label: string; icon: any }[] = [
    { value: "ALL", label: "All Apps", icon: Filter },
    { value: "IOS", label: "iOS", icon: Smartphone },
    { value: "ANDROID", label: "Android", icon: Tablet },
    { value: "WEB", label: "Web", icon: Monitor },
  ];

  return (
    <section className="pt-24 md:pt-28 lg:pt-32 pb-8 md:pb-12 lg:pb-16">
      <div className="container">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="mb-4 text-2xl font-bold !leading-tight text-black dark:text-white sm:text-3xl md:text-4xl lg:text-5xl">
              Download Our Apps
            </h1>
            <p className="mb-6 text-sm !leading-relaxed text-body-color md:text-base lg:text-lg px-4">
              Get the Detofa Games experience on your favorite device. Available on iOS, Android, and more.
            </p>
          </div>

          {/* Platform Filter */}
          <div className="mb-8 md:mb-12">
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 px-4">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <button
                    key={platform.value}
                    onClick={() => setSelectedPlatform(platform.value)}
                    className={`flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all duration-300 ${
                      selectedPlatform === platform.value
                        ? "bg-primary text-white shadow-lg scale-105"
                        : "bg-white dark:bg-gray-dark text-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4 md:h-5 md:w-5" />
                    <span>{platform.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Apps Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-body-color">Loading apps...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-body-color text-lg">
                No apps found for {selectedPlatform === "ALL" ? "this platform" : getPlatformName(selectedPlatform)}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-4">
              {filteredApps.map((app) => {
                const previewImages = Array.isArray(app.previewImages) ? app.previewImages : [];
                return (
                  <div
                    key={app.id}
                    className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-dark shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {/* Preview Images */}
                    {previewImages.length > 0 ? (
                      <div className="relative h-48 md:h-56 overflow-hidden bg-gray-100 dark:bg-gray-800 group-hover:overflow-visible">
                        <Image
                          src={previewImages[0]}
                          alt={`${app.name} preview`}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {previewImages.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                            {previewImages.slice(0, 5).map((_, idx: number) => (
                              <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all ${
                                  idx === 0
                                    ? "w-4 bg-white"
                                    : "w-1.5 bg-white/50"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-black/50 text-white rounded backdrop-blur-sm">
                            {getPlatformName(app.platform)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-48 md:h-56 bg-gradient-to-br from-primary/10 to-primary/20 dark:from-primary/20 dark:to-primary/30 flex items-center justify-center">
                        {app.iconUrl ? (
                          <Image
                            src={app.iconUrl}
                            alt={app.name}
                            width={100}
                            height={100}
                            className="rounded-2xl"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            {getPlatformIcon(app.platform)}
                            <span className="mt-2 text-xs font-medium text-primary">
                              {getPlatformName(app.platform)}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 text-xs font-semibold bg-black/50 text-white rounded backdrop-blur-sm">
                            {getPlatformName(app.platform)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* App Info */}
                    <div className="p-4 md:p-6 flex-1 flex flex-col">
                      <h3 className="mb-2 text-lg md:text-xl font-semibold text-dark dark:text-white line-clamp-1">
                        {app.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs md:text-sm text-body-color">v{app.version}</span>
                        {app.size && (
                          <>
                            <span className="text-body-color">•</span>
                            <span className="text-xs md:text-sm text-body-color">{app.size}</span>
                          </>
                        )}
                      </div>
                      {app.minVersion && (
                        <p className="text-xs md:text-sm text-body-color mb-3">
                          Requires {app.minVersion}
                        </p>
                      )}
                      {app.description && (
                        <p className="text-sm md:text-base text-body-color mb-4 line-clamp-2 flex-1">
                          {app.description}
                        </p>
                      )}

                      {/* Download Button */}
                      {app.platform === "WEB" ? (
                        <a
                          href={app.fileUrl || "/"}
                          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-medium text-white transition duration-300 hover:bg-primary/90 w-full mt-auto"
                        >
                          <Monitor className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                          Play Now
                        </a>
                      ) : (
                        <button
                          onClick={() => handleDownload(app.id, app.fileUrl)}
                          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 md:px-6 md:py-3 text-sm md:text-base font-medium text-white transition duration-300 hover:bg-primary/90 w-full mt-auto"
                        >
                          <Download className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                          <span className="hidden sm:inline">Download </span>
                          <span>({app.downloadCount})</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* QR Code Section */}
          {filteredApps.length > 0 && (
            <div className="mt-8 md:mt-12 rounded-lg bg-gray-light p-6 md:p-8 dark:bg-gray-dark mx-4">
              <div className="text-center">
                <h2 className="mb-3 md:mb-4 text-xl md:text-2xl font-bold text-dark dark:text-white">
                  Scan to Download
                </h2>
                <p className="mb-4 md:mb-6 text-sm md:text-base text-body-color">
                  Use your phone camera to scan the QR code and download the app directly to your device.
                </p>
                <div className="flex justify-center">
                  <div className="flex h-48 w-48 md:h-64 md:w-64 items-center justify-center rounded-lg bg-white p-4 dark:bg-gray-800">
                    {/* Placeholder for QR code - replace with actual QR code image */}
                    <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <p className="text-xs md:text-sm text-body-color">QR Code Placeholder</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Section */}
          <div className="mt-8 md:mt-12 px-4">
            <h2 className="mb-6 md:mb-8 text-center text-xl md:text-2xl font-bold text-dark dark:text-white">
              Why Download Our Apps?
            </h2>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center p-4 md:p-6">
                <div className="mb-3 md:mb-4 inline-flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                  <svg
                    className="h-6 w-6 md:h-8 md:w-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-base md:text-lg font-semibold text-dark dark:text-white">
                  Fast Performance
                </h3>
                <p className="text-sm md:text-base text-body-color">
                  Optimized for speed and smooth gameplay experience
                </p>
              </div>
              <div className="text-center p-4 md:p-6">
                <div className="mb-3 md:mb-4 inline-flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                  <svg
                    className="h-6 w-6 md:h-8 md:w-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-base md:text-lg font-semibold text-dark dark:text-white">
                  Secure & Safe
                </h3>
                <p className="text-sm md:text-base text-body-color">
                  Your data is protected with industry-standard security
                </p>
              </div>
              <div className="text-center p-4 md:p-6">
                <div className="mb-3 md:mb-4 inline-flex h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                  <svg
                    className="h-6 w-6 md:h-8 md:w-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-base md:text-lg font-semibold text-dark dark:text-white">
                  Offline Mode
                </h3>
                <p className="text-sm md:text-base text-body-color">
                  Play your favorite games even without internet connection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


