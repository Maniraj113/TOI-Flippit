import type { Metadata } from "next";
import { Outfit, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

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
  description: "Flip the words. Beat the clock. The elite daily word puzzle game by The Times of India.",
  openGraph: {
    title: "Flippit | The Times of India",
    description: "Flip the words. Beat the clock. Play the TOI daily word puzzle.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // GA ID is read from the environment variable set in .env.local
  // Set NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX in your .env.local file
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <html lang="en" className={`${outfit.variable} ${montserrat.variable} ${playfair.variable} h-full`}>
      <body className="antialiased h-full overflow-hidden bg-[#9d071c]">
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {children}
      </body>
    </html>
  );
}
