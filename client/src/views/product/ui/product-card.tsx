'use client';

import { Link } from '@/src/i18n/navigation';
import { Bookmark, Pencil, Trash } from 'lucide-react';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import {
  Product,
  getDiscountedUnitPrice,
  isProductOnSale,
} from '@/src/entities/product/types/product.types';
import { useProductStore } from '@/src/entities/product/model/product.store';
import { isAdmin } from '@/src/entities/user/lib/auth.utils';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/src/entities/user/model/auth.store';
import { useRouter } from 'next/navigation';
import DeleteProductModal from '@/src/shared/modal/delete-product';
import { useMobile } from '@/src/shared/hooks/use-mobile';
import MobileProductCard from './mobile-product-card';

type ProductWithId = Product & { _id?: string };
type LocaleKey = keyof Product['name'];

export type ProductCardAddToCartProps = {
  onAddToCart?: (product: ProductWithId) => void;
};

function isSoldOut(product: ProductWithId): boolean {
  if (product.quantity === 0) return true;
  if (product.variants && product.variants.length > 0) {
    return product.variants.every((v) => v.stock === 0);
  }
  return false;
}

export default function ProductCard({
  product,
}: { product: ProductWithId } & ProductCardAddToCartProps) {
  const locale = useLocale() as LocaleKey;
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { deleteProduct } = useProductStore()
  const isMobile = useMobile();

  const productId = product._id ?? '';
  const wishlisted = useProductStore(
    (s) => s.wishlistedByProductId[productId] ?? false
  );
  const toggleWishlisted = useProductStore((s) => s.toggleWishlisted);

  const displayName = product.name[locale] ?? product.name.en;
  const soldOut = isSoldOut(product);
  const onSale = !soldOut && isProductOnSale(product);
  const finalPrice = getDiscountedUnitPrice(product.price, product.sale);
  const currency = product.currency ?? 'AZN';

  const selectedColorIndex = useProductStore(
    (s) => s.selectedColorIndexByProductId[productId] ?? 0
  );
  const setSelectedColorIndex = useProductStore((s) => s.setSelectedColorIndex);
  const selectedSizeIndex = useProductStore(
    (s) => s.selectedSizeIndexByProductId[productId] ?? 0
  );
  const uniqueColors = [...new Set((product.variants ?? []).map((v) => v.color))];
  const colors = uniqueColors.filter(Boolean);
  const selectedColor = colors[selectedColorIndex] ?? colors[0];
  const availableSizes = [
    ...new Set(
      (product.variants ?? [])
        .filter((v) => !selectedColor || v.color === selectedColor)
        .map((v) => v.size)
    ),
  ];
  const sizes =
    availableSizes.length > 0
      ? availableSizes
      : (product.variants ?? []).map((v) => v.size).filter(Boolean);

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlisted(productId);
    },
    [productId, toggleWishlisted]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    setPendingDeleteId(null);
    await deleteProduct(pendingDeleteId);
    setDeletingId(null);
  }, [pendingDeleteId, deleteProduct]);


  if (!productId) return null;
  if (isMobile) return <MobileProductCard product={product} />;

  return (
    <article className="flex flex-col w-full group">
      <Link href={`/products/${productId}`} className="block">
        {/* Image block */}
        <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-neutral-200" />
          )}

          {/* SOLD OUT overlay text */}
          {soldOut && (
            <div className="absolute inset-0 flex items-start justify-start pointer-events-none">
              <span className="mt-2 ml-2 bg-black text-white text-[10px] font-semibold tracking-widest uppercase px-2 py-1">
                SOLD OUT
              </span>
            </div>
          )}

          {/* Sale % + pre-order — top left */}
          {!soldOut && (onSale || product.preOrder) && (
            <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none z-[1]">
              {onSale && (
                <span className="bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1">
                  −{Math.round(product.sale ?? 0)}%
                </span>
              )}
              {product.preOrder && (
                <span className="bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-bold tracking-widest uppercase px-2 py-1">
                  PRE-ORDER
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 absolute top-1 right-2">
            {/* Edit button */}
            {isAdmin(user) && (
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-none"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/admin/products/add/${productId}`);
                }}
              >
                <Pencil className="w-3.5 h-3.5" strokeWidth={1.8} />
                Edit
              </Button>
            )}

            {/* Bookmark icon — top right */}
            <Button
              type="button"
              onClick={handleWishlist}
              className="rounded-none flex items-center justify-center w-8 h-8 bg-white/80 hover:bg-white transition-colors"
              aria-label="Save to wishlist"
            >
              <Bookmark
                className="w-4 h-4 text-neutral-800"
                fill={wishlisted ? 'currentColor' : 'none'}
                strokeWidth={1.5}
              />
            </Button>

            {/* Delete button */}
            {isAdmin(user) && (
              <Button
                variant="outline"
                className="rounded-none flex items-center gap-2"
                disabled={deletingId === productId}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPendingDeleteId(productId);
                }}
              >
                <Trash className="w-3.5 h-3.5" strokeWidth={1.8} />
              </Button>
            )}
          </div>

          {/* Sizes — bottom overlay on hover (same styling as product page) */}
          {sizes.length > 0 && (
            <div
              className="absolute inset-x-0 bottom-0 z-2 opacity-0 translate-y-1 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
              aria-hidden
            >
              <div className="bg-white/80 px-2 py-2.5">
                <div className="flex gap-2 flex-wrap justify-center">
                  {sizes.map((size, index) => {
                    const isSelected = index === selectedSizeIndex;
                    const sizeVariant = (product.variants ?? []).find(
                      (v) => v.color === selectedColor && v.size === size
                    );
                    const sizeInStock = (sizeVariant?.stock ?? 0) > 0;
                    return (
                      <span
                        key={size}
                        className="relative inline-flex min-w-[52px] h-10 items-center justify-center px-3 text-[11px] tracking-widest uppercase font-medium"
                        style={{
                          border: isSelected ? '1.5px solid #171717' : '1px solid #020404',
                          backgroundColor: isSelected ? '#171717' : 'transparent',
                          color: isSelected ? '#ffffff' : sizeInStock ? '#171717' : '#a3a3a3',
                        }}
                      >
                        {size}
                        {!sizeInStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="block w-full h-px bg-black rotate-[-30deg]" />
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text block */}
        <div className="mt-2 px-0">
          {/* Product name */}
          <p className="text-xs text-neutral-500 uppercase tracking-widest leading-tight truncate">
            {displayName}
          </p>

          {/* Price */}
          {soldOut ? (
            <p className="mt-0.5 text-xs text-neutral-400 line-through">
              {product.price} {currency}
            </p>
          ) : onSale ? (
            <p className="mt-0.5 text-xs">
              <span className="text-neutral-400 line-through mr-1.5 tabular-nums">
                {product.price} {currency}
              </span>
              <span className="text-neutral-900 font-medium tabular-nums">
                {finalPrice} {currency}
              </span>
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-neutral-900 font-medium tabular-nums">
              {product.price} {currency}
            </p>
          )}

          {/* Color swatches */}
          {colors.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {colors.map((color, index) => {
                const isSelected = index === selectedColorIndex;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColorIndex(productId, index);
                    }}
                    aria-label={`Color ${color}`}
                    className="rounded-full focus:outline-none transition-transform hover:scale-110 shrink-0"
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: color,
                      outline: isSelected ? '1.5px solid #171717' : '1.5px solid transparent',
                      outlineOffset: 2,
                      boxShadow: '0 0 0 1px #d4d4d4',
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </Link>
      <DeleteProductModal
        open={!!pendingDeleteId}
        displayName={displayName}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteId(null)}
      />
    </article>
  );
}
