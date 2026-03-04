import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import { Michroma } from "next/font/google";

import "./globals.css";
import LayoutClient from "./layout-client";
import localFont from 'next/font/local';

const hostGrotesk = Host_Grotesk({
  subsets: ["latin"],
  variable: "--font-host-grotesk",
  display: "swap",
});

const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-michroma",
  display: "swap",
});

export const azonixFont = localFont({
  src: '../public/fonts/azonix/Azonix.otf',
  variable: '--font-azonix',
});


export const metadata: Metadata = {
  title: "SAINT ASLAN",
  description: "SAINT ASLAN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} ${azonixFont.variable} ${michroma.variable}`}
    >
      <body className={`${hostGrotesk.className} ${michroma.className} ${azonixFont.variable} antialiased`}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
