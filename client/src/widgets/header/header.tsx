"use client";

import IntroHeader from "@/src/shared/ui/intro-loader/intro-header";
import Navbar from "../navbar/navbar";


export default function Header() {
  return (
    <header className="w-full flex items-center justify-center bg-white">
        <IntroHeader />
        <Navbar />
    </header>
  );
}
