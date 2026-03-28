'use client';

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useMemo } from 'react';

import { cn } from "@/lib/utils";
import { getDiscountedUnitPrice } from "@/src/entities/product/types/product.types";
import { ArrowRight, Handbag, Package } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { getProductId } from "../hooks/get-product-id";
import { cartLineKey, useCartStore } from "../model/card.store";
import { ProductWithId } from "../types/product-with-id";
import CartLine from "./shop-card-line";

type ShopCardProps = {
    triggerClassName?: string;
    iconClassName?: string;
    badgeClassName?: string;
};

export default function ShopCard({
    triggerClassName,
    iconClassName,
    badgeClassName,
}: ShopCardProps = {}) {
    const t = useTranslations('cart');
    const locale = useLocale();
    const items = useCartStore((s) => s.items);
    const totalItems = useCartStore((s) => s.getTotalItems());
    const isLoading = useCartStore((s) => s.isLoading);

    /** Sum of (discounted unit × qty); matches server order totals. */
    const { totalWithDiscount, grossSubtotal, savings } = useMemo(() => {
        let gross = 0;
        let net = 0;
        for (const line of items) {
            const p = line.product as ProductWithId;
            const base = p.price ?? 0;
            gross += base * line.quantity;
            net += getDiscountedUnitPrice(base, p.sale) * line.quantity;
        }
        const save = Math.max(0, Math.round((gross - net) * 100) / 100);
        return { totalWithDiscount: net, grossSubtotal: gross, savings: save };
    }, [items]);

    const checkoutHref =
        totalItems > 0
            ? `/${locale}/payment?count=${totalItems}&total=${encodeURIComponent(totalWithDiscount.toFixed(2))}`
            : `/${locale}/payment`;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "relative p-1.5  group",
                        triggerClassName,
                    )}
                    aria-label={t('title')}
                >
                    <Handbag
                        className={cn(
                            "w-[24px] h-[24px] text-neutral-600 group-hover:text-black transition-colors",
                            iconClassName,
                        )}
                    />
                    {totalItems > 0 && (
                        <span
                            className={cn(
                                "absolute -top-0.5 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-neutral-700 text-[10px] font-semibold text-white px-1 font-host-grotesk",
                                badgeClassName,
                            )}
                        >
                            {totalItems > 99 ? '99+' : totalItems}
                        </span>
                    )}
                </button>
            </SheetTrigger>

            <SheetContent className="flex flex-col w-full sm:max-w-[420px] p-0 gap-0 font-host-grotesk z-9999">
                {/* Header */}
                <SheetHeader className="px-6 py-5 border-b border-neutral-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <SheetTitle className="text-base font-semibold tracking-tight text-neutral-900 font-host-grotesk">
                                {t('title')}
                            </SheetTitle>
                            {totalItems > 0 && (
                                <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-neutral-900 text-[10px] font-semibold text-white px-1.5 font-host-grotesk">
                                    {totalItems}
                                </span>
                            )}
                        </div>
                        
                    </div>
                </SheetHeader>

                {/* Cart Body */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
                            <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-neutral-800 animate-spin" />
                            <p className="text-sm text-neutral-400 font-host-grotesk">{t('empty')}</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 px-6 gap-5">
                            <div className="w-20 h-20 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                                <Package className="w-9 h-9 text-neutral-300" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-neutral-800 font-host-grotesk">{t('empty')}</p>
                                <p className="text-xs text-neutral-400 mt-1 font-host-grotesk">
                                    {t('description')}
                                </p>
                            </div>
                            <SheetClose asChild>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 border border-neutral-900 px-5 py-2.5 rounded-full hover:bg-neutral-900 hover:text-white transition-all duration-200 font-host-grotesk"
                                >
                                    Shop now
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            </SheetClose>
                        </div>
                    ) : (
                        <ul className="px-6 py-4 space-y-1">
                            {items.map((item) => (
                                <li
                                    key={cartLineKey(
                                        getProductId(item.product as ProductWithId),
                                        item.variantId
                                    )}
                                >
                                    <CartLine item={item} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="shrink-0 border-t border-neutral-100 px-6 pt-4 pb-6 space-y-4">
                        {savings > 0 && (
                            <>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-400 font-host-grotesk">{t('subtotal')}</span>
                                    <span className="text-neutral-400 line-through tabular-nums font-host-grotesk">
                                        {grossSubtotal.toFixed(2)} AZN
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-emerald-700 font-host-grotesk">{t('discount')}</span>
                                    <span className="text-emerald-700 font-medium tabular-nums font-host-grotesk">
                                        −{savings.toFixed(2)} AZN
                                    </span>
                                </div>
                            </>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-500 font-host-grotesk">{t('total')}</span>
                            <span className="text-base font-semibold text-neutral-900 font-host-grotesk tabular-nums">
                                {totalWithDiscount.toFixed(2)} AZN
                            </span>
                        </div>

                        {/* CTA */}
                        <SheetClose asChild>
                            <Link
                                href={checkoutHref}
                                className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white text-sm font-medium tracking-wide py-3.5 rounded-xl transition-colors duration-200 font-host-grotesk"
                            >
                                {t('checkout')}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </SheetClose>

                        {/* Continue shopping */}
                        <SheetClose asChild>
                            <button
                                type="button"
                                className="w-full text-sm text-neutral-500 hover:text-neutral-900 transition-colors text-center font-host-grotesk"
                            >
                                {t('continueShopping')}
                            </button>
                        </SheetClose>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
