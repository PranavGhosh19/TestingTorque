import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Navbar from "@/components/Navbar";
import PublicBottomNav from "@/components/PublicBottomNav";
import PWAInstallPrompt from "@/components/shared/PWAInstallPrompt";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0A0D12" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0D12" },
  ],
  colorScheme: "dark",
  viewportFit: "cover",
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
    icon: [
      { url: "/icons/torque_emblem.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
    <html lang="en" className={`${manrope.variable} ${inter.variable} h-full bg-[#0A0D12] antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/torque_emblem.svg" type="image/svg+xml" />
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" sizes="180x180" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#0A0D12" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0A0D12] text-white">
        <StoreProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <PublicBottomNav />
          <PWAInstallPrompt />
        </StoreProvider>
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
