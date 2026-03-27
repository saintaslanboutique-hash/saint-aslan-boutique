"use client";

import { useEffect, useMemo } from "react";

import { useProductStore } from "@/src/entities/product/model/product.store";
import ProductCard from "@/src/views/product/ui/product-card";
import { useTranslations } from "next-intl";

export default function NewProductsSection() {
    const { products, fetchProducts } = useProductStore();
    const t = useTranslations('hero');
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const latestProducts = useMemo(
        () =>
            [...products]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                )
                .slice(0, 16),
        [products]
    );

    return (
        <section className="relative flex w-full flex-col overflow-hidden">
            <div className="relative z-20 w-full border-t border-neutral-200/80 bg-neutral-50 px-2 py-4 sm:px-4 sm:py-12 md:px-6 lg:px-8 lg:py-16">
                <div className="mb-6 lg:mb-12 flex items-center justify-center">
                    <h2 className=" -tracking-[4px] lg:-tracking-[14px] text-center text-4xl lg:text-8xl font-semibold uppercase">
                        {t('newProducts')}
                    </h2>
                </div>
                <div className="mx-auto w-full max-w-[1600px]">
                    <div className="grid grid-cols-2 gap-1 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
                        {latestProducts.map((product) =>
                            product._id ? (
                                <ProductCard key={product._id} product={product} />
                            ) : null
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
