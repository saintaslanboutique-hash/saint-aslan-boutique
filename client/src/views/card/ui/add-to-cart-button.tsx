'use client';

import { useTranslations } from 'next-intl';
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../model/card.store';
import type { Product } from '@/src/entities/product/model/model.types';

type ProductWithId = Product & { _id?: string };

type AddToCartButtonProps = {
  product: ProductWithId;
  quantity?: number;
  variant?: 'primary' | 'secondary';
  className?: string;
  children?: React.ReactNode;
};

export function AddToCartButton({
  product,
  quantity = 1,
  variant = 'primary',
  className = '',
  children,
}: AddToCartButtonProps) {
  const t = useTranslations('productPage');
  const tCart = useTranslations('cart');
  const addItem = useCartStore((s) => s.addItem);
  const isSyncing = useCartStore((s) => s.isSyncing);

  const handleClick = async () => {
    const id = (product as { _id?: string })._id ?? (product as { id?: string }).id;
    if (!id) return;
    await addItem(product, quantity);
    toast.success(tCart('addedToCart'));
  };

  const baseClass =
    'inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 disabled:opacity-60';
  const variantClass =
    variant === 'primary'
      ? 'w-full py-4 bg-neutral-900 text-white hover:bg-neutral-800'
      : 'w-full py-3 border border-neutral-300 text-neutral-900 hover:bg-neutral-50 focus:ring-neutral-400';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSyncing || !((product as { _id?: string })._id ?? (product as { id?: string }).id)}
      className={`${baseClass} ${variantClass} ${className}`}
    >
      {children ?? (
        <>
          <ShoppingBag className="h-4 w-4" />
          {t('addToCart')}
        </>
      )}
    </button>
  );
}
