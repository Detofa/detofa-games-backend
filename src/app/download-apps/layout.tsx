import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Download Apps - Detofa Games",
  description: "Download Detofa Games apps for iOS, Android, and other platforms",
};

export default function DownloadAppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

