import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Booklio — Your bookings, organized.",
  description: "A lightweight Web3 appointment-booking platform for small businesses and freelancers on Botchain.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-charcoal-950 text-slate-200 antialiased min-h-screen flex flex-col selection:bg-brand-purple/20 selection:text-brand-purple-soft">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

