'use client'

import { useTranslations } from 'next-intl';
import { useProductStore } from "@/src/entities/product/model/model.store";
import ProductCard from "@/src/entities/product/ui/product-card";
import { useCartStore } from "@/src/views/card/model/card.store";
import { useCallback } from "react";
import { useEffect } from "react";
import toast from 'react-hot-toast';

export function Products() {

    const t = useTranslations('cart');
    const { products, isLoading, error, fetchProducts } = useProductStore();
    const addItem = useCartStore((s) => s.addItem);
    const onAddToCart = useCallback(
        async (product: Parameters<typeof addItem>[0]) => {
            await addItem(product, 1);
            toast.success(t('addedToCart'));
        },
        [addItem, t]
    );

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (products.length === 0) {
        return <div>No products found</div>
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }



    return (
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        onAddToCart={onAddToCart}
                    />
                ))}
                {isLoading && <div>Loading...</div>}
                {error && <div>Error: {error}</div>}
            </div>
        </div>
    )
}