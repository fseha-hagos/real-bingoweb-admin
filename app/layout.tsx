import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";
import { SessionProvider } from "@/contexts/SessionContext";

export const metadata: Metadata = {
  title: "Bingo Admin Panel",
  description: "Admin dashboard for Bingo Telegram Bot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <AuthGuard>{children}</AuthGuard>
        </SessionProvider>
      </body>
    </html>
  );
}

