import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shipment Tracking App",
  description: "Phase 1 auth foundation for the shipment tracking app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
