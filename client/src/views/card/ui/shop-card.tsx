'use client';

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { getProductId } from "../hooks/get-product-id";
import { useCartStore } from "../model/card.store";
import { ProductWithId } from "../types/product-with-id";
import CartLine from "./shop-card-line";


export default function ShopCard() {
    const t = useTranslations('cart');
    const items = useCartStore((s) => s.items);
    const totalPrice = useCartStore((s) => s.getTotalPrice());
    const totalItems = useCartStore((s) => s.getTotalItems());
    const isLoading = useCartStore((s) => s.isLoading);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button type="button" className="relative p-[6px] -mt-3" aria-label={t('title')}>
                    <ShoppingCart className="w-8 h-8 text-black/70" />
                    {totalItems > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-medium text-white">
                            {totalItems > 99 ? '99+' : totalItems}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>{t('title')}</SheetTitle>
                    <SheetDescription>{t('description')}</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-2 -mx-4 px-4">
                    {isLoading ? (
                        <p className="text-sm text-neutral-500">{t('empty')}</p>
                    ) : items.length === 0 ? (
                        <p className="text-sm text-neutral-500">{t('empty')}</p>
                    ) : (
                        <ul className="divide-y divide-neutral-100">
                            {items.map((item) => (
                                <li key={getProductId(item.product as ProductWithId)}>
                                    <CartLine key={getProductId(item.product as ProductWithId)} item={item} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {items.length > 0 && (
                    <SheetFooter className="flex-row justify-between border-t pt-4">
                        <span className="font-medium">{t('total')}: {totalPrice.toFixed(2)} AZN</span>
                        <SheetClose asChild>
                            <Button variant="outline">{t('close')}</Button>
                        </SheetClose>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
