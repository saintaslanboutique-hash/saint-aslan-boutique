'use client';

import { Link } from '@/src/i18n/navigation';
import { Heart } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback } from 'react';
import { Product } from '../model/model.types';
import { useProductStore } from '../model/product.store';

type ProductWithId = Product & { _id?: string };
type LocaleKey = keyof Product['name'];

export type ProductCardAddToCartProps = {
  onAddToCart?: (product: ProductWithId) => void;
};

export default function ProductCard({
  product,
  onAddToCart,
}: { product: ProductWithId } & ProductCardAddToCartProps) {
  const t = useTranslations('productCard');
  const locale = useLocale() as LocaleKey;

  const productId = product._id ?? '';
  const wishlisted = useProductStore(
    (s) => s.wishlistedByProductId[productId] ?? false
  );
  const toggleWishlisted = useProductStore((s) => s.toggleWishlisted);
  const selectedColorIndex =
    useProductStore((s) => s.selectedColorIndexByProductId[productId] ?? 0);
  const setSelectedColorIndex = useProductStore((s) => s.setSelectedColorIndex);

  const displayName = product.name[locale] ?? product.name.en;
  const priceWithCode = `${product.price} AZN`;

  const colors = product.colors?.length
    ? product.colors
    : ['#000000'];

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlisted(productId);
    },
    [productId, toggleWishlisted]
  );

  if (!productId) return null;

  return (
    <article className="flex flex-col w-full">
      <Link href={`/product/${productId}`} className="block">
      {/* Image block */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-100">
        <Image
          src={product.image ?? ''}
          alt={displayName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center"
        />

        {/* Top-left overlay: wishlist + pre-order */}
        <div className="absolute top-0 left-0 flex items-center gap-2 p-2">
          <div className="flex items-center gap-2 bg-white px-2 py-1.5 shadow-sm">
            <button
              type="button"
              onClick={handleWishlist}
              className="flex items-center justify-center text-neutral-900 hover:opacity-80 transition-opacity"
              aria-label={t('addToWishlist')}
            >
              <Heart
                className="h-4 w-4"
                fill={wishlisted ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Color swatches */}
      <div className="flex justify-center gap-1.5 mt-3">
        {colors.map((color, index) => {
          const isSelected = index === selectedColorIndex;
          const isBlack =
            (typeof color === 'string' &&
              (color.toLowerCase() === '#000000' ||
                color.toLowerCase() === 'black' ||
                !color.startsWith('#'))) ||
            !product.colors?.length;
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedColorIndex(productId, index);
              }}
              className="relative rounded-full w-3.5 h-3.5 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1 focus:ring-offset-white"
              style={{
                backgroundColor: isBlack ? '#000' : color,
                border: '2px solid white',
                boxShadow: '0 0 0 1px #d4d4d4',
              }}
              aria-label={`Color ${index + 1}`}
            >
              {isSelected && isBlack && (
                <span
                  className="absolute rounded-full bg-white"
                  style={{ width: 4, height: 4 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Product name */}
      <h3 className="mt-2 text-center text-sm font-medium uppercase tracking-wide text-black">
        {displayName}
      </h3>

      {/* Price */}
      <p className="mt-1 text-center text-sm text-black">
        {priceWithCode}
      </p>
      </Link>
    </article>
  );
}
