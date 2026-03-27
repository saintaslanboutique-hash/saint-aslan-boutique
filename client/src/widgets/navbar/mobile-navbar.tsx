"use client";

import ProfileIcon from "@/src/entities/profile/ui/profile-icon";
import useAuthStore from "@/src/entities/user/model/auth.store";
import { useCartStore } from "@/src/views/card/model/card.store";
import ShopCard from "@/src/views/card/ui/shop-card";
import { ArrowLeft, Package } from "lucide-react";
import { useEffect, useMemo } from "react";

import { Link, usePathname } from "@/src/i18n/navigation";

import MobileNavMenu from "./mobile-nav-menu";
import { useSelectedProductStore } from "@/src/entities/product/model/selected-product";
import { useCategoryStore } from "@/src/entities/categories/model/categories.store";

export default function MobileNavbar() {
    const pathname = usePathname();
    const { items } = useCartStore();
    const { user, initialize } = useAuthStore();
    const { selectedCategory } = useSelectedProductStore();
    const { categories } = useCategoryStore();

    const isProductDetailPage =
        pathname != null && pathname !== "/products" && pathname.startsWith("/products/");

    useEffect(() => {
        initialize();
    }, [initialize]);

    const title = useMemo(() => {
        if (!selectedCategory) return "Products";
        const selected = categories.find((c) => c._id === selectedCategory);
        return selected?.name["en"] || Object.values(selected?.name ?? {})[0] || "Products";
    }, [categories, selectedCategory]);

    return (
        <div className="p-4">
            <div className="relative flex flex-col items-center justify-between py-2">
                {isProductDetailPage ? (
                    <Link href="/products" className="absolute left-0 top-1/2 -translate-y-1/2">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                ) : (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2">
                        {user && <ProfileIcon/>}
                    </div>
                )}
                <Link href="/products">
                    <h1 className="text-sm font-bold">SAINT ASLAN</h1>
                </Link>
                <div className="flex items-center justify-end w-full">
                    <div className="relative w-full items-center justify-center h-4">
                        <div className="absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-0.5 pointer-events-none select-none">
                            <div className="flex items-center gap-2.5">
                                <div className="h-px w-5 bg-neutral-300" />
                                <Package className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
                                <div className="h-px w-5 bg-neutral-300" />
                            </div>
                            <h1 className="mt-1 text-[8px] font-bold uppercase leading-none tracking-[0.3em] text-black">
                                {title || "Products"}
                            </h1>
                        </div>
                    </div>
                    <div className="absolute right-0">
                        <div className="relative flex items-center justify-center gap-2.5">
                            {items.length > 0 && (
                                <ShopCard
                                    triggerClassName="p-0"
                                    iconClassName="w-5 h-5"
                                    badgeClassName="-top-0.5 -right-1 h-3 min-w-3 px-0 text-[8px] leading-none"
                                />
                            )}
                            <div className="w-6">
                                <MobileNavMenu />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
