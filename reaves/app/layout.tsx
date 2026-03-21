import { NotebookProvider } from "@/lib/notebook-context";
import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "REAVES — Research, Validated",
  description:
    "AI-powered research co-pilot that validates sources, scores credibility, and synthesizes findings for students.",
  keywords: [
    "research",
    "AI",
    "academic",
    "sources",
    "credibility",
    "synthesis",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body
        className="bg-[#0a0a0f] text-white font-sans antialiased min-h-screen"
        suppressHydrationWarning
      >
        <NotebookProvider>{children}</NotebookProvider>
      </body>
    </html>
  );
}
