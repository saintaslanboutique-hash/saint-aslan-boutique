import { useLocale, useTranslations } from "next-intl";
import { useCartStore, type CartItem } from "../model/card.store";
import {
    Product,
    getDiscountedUnitPrice,
    isProductOnSale,
} from "@/src/entities/product/types/product.types";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Minus, Plus, Trash2 } from "lucide-react";

type ProductWithId = Product & { _id?: string; id?: string };

function getProductId(p: ProductWithId): string {
  return (p as { _id?: string })._id ?? (p as { id?: string }).id ?? "";
}

type LocaleKey = keyof Product['name'];

function getVariantColorSize(
  product: ProductWithId,
  variantId: string | undefined
): { color: string; size: string } | null {
  if (!variantId || !product.variants?.length) return null;
  const v = product.variants.find(
    (row) =>
      row._id != null && String(row._id) === String(variantId)
  );
  if (!v) return null;
  return { color: v.color, size: v.size };
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{3,6}$/i.test(value.trim());
}

export default function CartLine({ item }: { item: CartItem }) {
    const t = useTranslations('cart');
    const locale = useLocale() as LocaleKey;
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);
  
    const product = item.product as ProductWithId;
    const id = getProductId(product);
    const name = product.name?.[locale] ?? product.name?.en ?? '';
    const basePrice = product.price ?? 0;
    const unitSale = getDiscountedUnitPrice(basePrice, product.sale);
    const onSale = isProductOnSale(product);
    const lineTotal = unitSale * item.quantity;
    const lineGross = basePrice * item.quantity;
    const img = product.image ?? (Array.isArray(product.images) ? product.images[0] : '');
    const variantInfo = getVariantColorSize(product, item.variantId);

    return (
      <div className="flex gap-4 py-4 border-b border-neutral-100 last:border-0 group font-host-grotesk">
        {/* Product image */}
        <div className="relative w-[72px] h-[90px] shrink-0 rounded-lg overflow-hidden bg-neutral-50">
          {img ? (
            <Image src={img} alt={name} fill className="object-cover" sizes="72px" />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
              <span className="text-neutral-300 text-xs">—</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-900 leading-tight line-clamp-2 font-host-grotesk">
                {name}
              </p>
              {variantInfo && (
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-host-grotesk">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={cn(
                        "inline-block h-3 w-3 shrink-0 rounded-full border border-neutral-200 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]",
                        !isHexColor(variantInfo.color) && "bg-neutral-200"
                      )}
                      style={
                        isHexColor(variantInfo.color)
                          ? { backgroundColor: variantInfo.color }
                          : undefined
                      }
                      title={variantInfo.color}
                      aria-hidden
                    />
                    {!isHexColor(variantInfo.color) && (
                      <span className="text-neutral-600 truncate max-w-[100px]">
                        {variantInfo.color}
                      </span>
                    )}
                  </span>
                  <span className="text-neutral-300">·</span>
                  <span className="text-neutral-600 uppercase tracking-wide">
                    {variantInfo.size}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeItem(id, item.variantId)}
              className="shrink-0 p-1 -mr-1 text-neutral-300 hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
              aria-label={t('remove')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-2">
            {/* Quantity stepper */}
            <div className="flex items-center gap-0 border border-neutral-200 rounded-none overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  updateQuantity(id, Math.max(1, item.quantity - 1), item.variantId)
                }
                className="flex items-center justify-center w-7 h-7 rounded-none hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label={t('quantity')}
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-7 h-7 flex items-center justify-center text-sm font-medium text-neutral-900 border-x border-neutral-200 font-host-grotesk">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(id, item.quantity + 1, item.variantId)}
                className="flex items-center justify-center w-7 h-7 rounded-none hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label={t('quantity')}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Price (sale-aware, matches cart total) */}
            <div className="text-right">
              <p className="text-sm font-semibold text-neutral-900 font-host-grotesk tabular-nums">
                {lineTotal.toFixed(2)} AZN
              </p>
              {onSale && (
                <p className="text-[11px] text-neutral-400 font-host-grotesk tabular-nums">
                  <span className="line-through text-neutral-300">{lineGross.toFixed(2)}</span>
                  <span className="text-neutral-500"> · </span>
                  <span className="text-emerald-700">{unitSale.toFixed(2)} each</span>
                </p>
              )}
              {!onSale && item.quantity > 1 && (
                <p className="text-[11px] text-neutral-400 font-host-grotesk tabular-nums">
                  {unitSale.toFixed(2)} × {item.quantity}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
