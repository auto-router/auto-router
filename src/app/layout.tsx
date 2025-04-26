import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { AutoSwitchProvider } from "../context/AutoSwitchContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OpenRouter - The Unified Interface For LLMs",
  description: "Optimize AI costs and performance with intelligent model routing across providers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body className={`bg-white min-h-screen flex flex-col ${inter.variable} font-sans`}>
        <AutoSwitchProvider>
          <NavBar />
          <main className="flex-1 flex flex-col bg-white">
            {children}
          </main>
          <Footer />
        </AutoSwitchProvider>
      </body>
    </html>
  );
}
