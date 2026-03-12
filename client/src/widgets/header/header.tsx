"use client";

import IntroHeader from "@/src/shared/ui/intro-loader/intro-header";
import Navbar from "../navbar/navbar";
import ShopCard from "@/src/views/card/ui/shop-card";
import { useCartStore } from "@/src/views/card/model/card.store";

import ProfileIcon from "@/src/entities/profile/ui/profile-icon";
import { useSession } from "next-auth/react";




export default function Header() {
  const { items } = useCartStore();

  const session = useSession();
  const user = session.data?.user;
  if (!user) return null;

  return (
    <header className="w-full flex items-center justify-center bg-white">
      <IntroHeader />
      {
        items.length > 0 && (
          <div className="mr-4">
            <ShopCard />
          </div>
        )
      }
      {
        user && (
          <div className="mr-4">
            <ProfileIcon />
          </div>
        )
      }
      <Navbar />
    </header>
  );
}
