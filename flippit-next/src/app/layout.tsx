import type { Metadata } from "next";
import { Outfit, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Flippit | The Times of India",
  description: "Flip the words. Beat the clock. The elite daily word puzzle game.",
};

import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${montserrat.variable} ${playfair.variable} h-full`}>
      <body className="antialiased h-full overflow-hidden bg-[#9d071c]">
        <GoogleAnalytics gaId="G-XXXXXXXXXX" /> {/* TODO: Replace with official TOI GA ID */}
        {children}
      </body>
    </html>
  );
}
