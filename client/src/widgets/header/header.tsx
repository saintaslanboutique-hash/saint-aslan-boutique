"use client";

import IntroHeader from "@/src/shared/ui/intro-loader/intro-header";
import NavbarMenu from "../navbar/navbar-menu";

export default function Header() {

  return (
    <header className="w-full flex items-center justify-center bg-transparent absolute top-0 z-50">
      <IntroHeader />
      <div className="fixed top-4 right-2 lg:top-14 lg:right-10">
        <NavbarMenu />
      </div>
    </header>
  );
}
