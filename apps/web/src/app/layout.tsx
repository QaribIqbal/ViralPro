import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ViralPro",
  description: "ViralPro content platform",
  icons: {
    icon: "/viralpro-logo.png",
    shortcut: "/viralpro-logo.png",
    apple: "/viralpro-logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen min-h-[100dvh] bg-[var(--app-bg-solid)] text-[var(--text)]">
        <ThemeProvider>
          <div id="app-root" className="min-h-screen min-h-[100dvh] bg-transparent">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
