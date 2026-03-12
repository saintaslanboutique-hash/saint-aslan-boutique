import { useLocale, useTranslations } from "next-intl";
import { useCartStore, type CartItem } from "../model/card.store";
import { Product } from "@/src/entities/product/model/model.types";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

type ProductWithId = Product & { _id?: string; id?: string };

function getProductId(p: ProductWithId): string {
  return (p as { _id?: string })._id ?? (p as { id?: string }).id ?? "";
}

type LocaleKey = keyof Product['name'];

export default function CartLine({ item }: { item: CartItem }) {
    const t = useTranslations('cart');
    const locale = useLocale() as LocaleKey;
    const updateQuantity = useCartStore((s) => s.updateQuantity);
    const removeItem = useCartStore((s) => s.removeItem);
  
    const product = item.product as ProductWithId;
    const id = getProductId(product);
    const name = product.name?.[locale] ?? product.name?.en ?? '';
    const price = product.price ?? 0;
    const img = product.image ?? (Array.isArray(product.images) ? product.images[0] : '');
  
    return (
      <div className="flex gap-3 py-3 border-b border-neutral-200 last:border-0">
        <div className="relative w-16 h-20 shrink-0 rounded overflow-hidden bg-neutral-100">
          {img ? (
            <Image src={img} alt={name} fill className="object-cover" sizes="64px" />
          ) : (
            <div className="w-full h-full bg-neutral-200" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{name}</p>
          <p className="text-sm text-neutral-600">{price} AZN</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center border border-neutral-300 rounded">
              <button
                type="button"
                onClick={() => updateQuantity(id, Math.max(1, item.quantity - 1))}
                className="p-1 hover:bg-neutral-100"
                aria-label={t('quantity')}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-sm min-w-6 text-center">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(id, item.quantity + 1)}
                className="p-1 hover:bg-neutral-100"
                aria-label={t('quantity')}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => removeItem(id)}
              className="p-1 text-neutral-500 hover:text-red-600"
              aria-label={t('remove')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="text-sm font-medium shrink-0">
          {(price * item.quantity).toFixed(2)} AZN
        </div>
      </div>
    );
  }