import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Navbar from "@/components/Navbar";
import RoleSwitcher from "@/components/RoleSwitcher";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0B132B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Torque Care — Your Car. Always Cared For.",
  description: "Your car. Always cared for. Verified morning washes, trusted apartment partners, and effortless peace of mind.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/app_icon.jpg",
    apple: "/images/app_icon.jpg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Torque Care",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F5F7FA] text-[#18212F]">
        <StoreProvider>
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <RoleSwitcher />
        </StoreProvider>
      </body>
    </html>
  );
}
