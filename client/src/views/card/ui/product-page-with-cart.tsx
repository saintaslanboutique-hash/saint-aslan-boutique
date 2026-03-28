'use client';

import { useCallback } from 'react';

import { useCartStore } from '../model/card.store';
import type { Product } from '@/src/entities/product/types/product.types';
import ProductPage from '../../product/ui/product-page';

type ProductWithId = Product & { _id?: string };

type ProductPageWithCartProps = {
  productId: string;
};

export function ProductPageWithCart({ productId }: ProductPageWithCartProps) {
  const addItem = useCartStore((s) => s.addItem);

  const onAddToCart = useCallback(
    async (product: ProductWithId, quantity: number, variantId?: string) => {
      await addItem(product, quantity, variantId);
    },
    [addItem]
  );

  return <ProductPage productId={productId} onAddToCart={onAddToCart} />;
}
