'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import paymentApi from '@/src/entities/payment/service/payment.api';
import orderApi from '@/src/entities/order/service/order.api';
import cartAPI from '@/src/views/card/service/card.api';
import { getDiscountedUnitPrice } from '@/src/entities/product/types/product.types';
import {
    useCartStore,
    cartLineKey,
    resolveVariantIdForCart,
    type CartItem,
} from '@/src/views/card/model/card.store';
import { getProductId } from '@/src/views/card/hooks/get-product-id';
import type { ProductWithId } from '@/src/views/card/types/product-with-id';
import { ShieldCheck, Package, CreditCard, Loader2, ArrowLeft, Sparkles } from 'lucide-react';

const PENDING_ORDER_KEY = 'pendingPaymentOrderId';

function cloneCartItems(items: CartItem[]): CartItem[] {
    return JSON.parse(JSON.stringify(items)) as CartItem[];
}

function buildOrderItems(items: CartItem[]) {
    return items.map((i) => {
        const p = i.product as ProductWithId;
        const pid = getProductId(p);
        if (!pid) throw new Error('Missing product id');
        const variantId = resolveVariantIdForCart(p, i.variantId);
        return {
            product: pid,
            quantity: i.quantity,
            ...(variantId && { variantId }),
        };
    });
}

function PaymentPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = useLocale();

    const items = useCartStore((s) => s.items);
    const isLoadingCart = useCartStore((s) => s.isLoading);

    const [isPaying, setIsPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalPrice = useMemo(
        () =>
            items.reduce((sum, i) => {
                const p = i.product as ProductWithId;
                const unit = getDiscountedUnitPrice(p.price ?? 0, p.sale);
                return sum + unit * i.quantity;
            }, 0),
        [items]
    );
    const totalItems = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);

    const queryCount = searchParams.get('count');
    const queryTotal = searchParams.get('total');

    useEffect(() => {
        if (isLoadingCart) return;
        if (items.length === 0) {
            router.replace(`/${locale}/products`);
        }
    }, [items.length, isLoadingCart, locale, router]);

    const handlePay = async () => {
        if (items.length === 0) return;

        const snapshot = cloneCartItems(items);

        try {
            setIsPaying(true);
            setError(null);

            const { data: order } = await orderApi.createOrder({
                items: buildOrderItems(items),
                paymentMethod: 'card',
                shippingAddress: {
                    address: 'Online checkout',
                    country: 'Azerbaijan',
                },
                notes: 'Card payment via checkout',
            });

            try {
                const pay = await paymentApi.initPayment(order.totalAmount, order._id);
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem(PENDING_ORDER_KEY, order._id);
                }
                await useCartStore.getState().clearCart();
                window.location.href = pay.pageUrl;
            } catch (payErr) {
                try {
                    await orderApi.cancelOrder(order._id);
                } catch {
                    /* ignore */
                }
                try {
                    await cartAPI.updateCart(snapshot);
                    useCartStore.setState({ items: snapshot });
                } catch {
                    /* ignore */
                }
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem(PENDING_ORDER_KEY);
                }
                console.error(payErr);
                setError('Could not start payment. Your cart was restored. Please try again.');
            }
        } catch (e) {
            console.error(e);
            let msg = 'Could not create order. Please try again.';
            if (e && typeof e === 'object' && 'response' in e) {
                const m = (e as { response?: { data?: { message?: string } } }).response?.data?.message;
                if (m) msg = m;
            }
            setError(msg);
        } finally {
            setIsPaying(false);
        }
    };

    if (isLoadingCart || items.length === 0) {
        return (
            <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-neutral-400">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-200/80" />
                    <p className="text-sm font-host-grotesk">Loading checkout…</p>
                </div>
            </div>
        );
    }

    const displayCount = queryCount ? Number(queryCount) : totalItems;
    const displayTotal = queryTotal ? Number(queryTotal) : totalPrice;

    return (
        <div className="min-h-screen bg-[#0c0c0c] text-neutral-100 relative overflow-hidden">
            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(251, 191, 36, 0.15), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(120, 113, 108, 0.2), transparent)',
                }}
            />
            <div className="relative z-10 mx-auto max-w-lg px-4 py-12 sm:py-16">
                <Link
                    href={`/${locale}/products`}
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-200 transition-colors font-host-grotesk mb-10"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Continue shopping
                </Link>

                <div className="mb-8">
                    <div className="flex items-center gap-2 text-amber-200/90 mb-3">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] font-host-grotesk">
                            Secure checkout
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-host-grotesk">
                        Pay for your order
                    </h1>
                    <p className="mt-2 text-sm text-neutral-500 font-host-grotesk">
                        {displayCount} {displayCount === 1 ? 'item' : 'items'} ·{' '}
                        {displayTotal.toFixed(2)} AZN
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <Package className="h-5 w-5 text-amber-200" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white font-host-grotesk">Order summary</p>
                                <p className="text-xs text-neutral-500">Review before paying</p>
                            </div>
                        </div>

                        <ul className="space-y-4 max-h-[min(40vh,320px)] overflow-y-auto pr-1">
                            {items.map((item) => {
                                const p = item.product as ProductWithId;
                                const id = getProductId(p);
                                const name = p.name?.en ?? p.name?.az ?? 'Product';
                                const unit = getDiscountedUnitPrice(p.price ?? 0, p.sale);
                                return (
                                    <li
                                        key={cartLineKey(id, item.variantId)}
                                        className="flex justify-between gap-3 text-sm"
                                    >
                                        <span className="text-neutral-300 truncate font-host-grotesk">
                                            {name}
                                            <span className="text-neutral-500"> × {item.quantity}</span>
                                        </span>
                                        <span className="text-neutral-100 shrink-0 tabular-nums">
                                            {(unit * item.quantity).toFixed(2)} AZN
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="px-6 py-4 space-y-2 border-b border-white/10 text-sm">
                        <div className="flex justify-between text-neutral-500 font-host-grotesk">
                            <span>Subtotal</span>
                            <span className="text-neutral-300 tabular-nums">{totalPrice.toFixed(2)} AZN</span>
                        </div>
                        <div className="flex justify-between text-neutral-500 font-host-grotesk">
                            <span>Delivery</span>
                            <span className="text-emerald-400/90 font-medium">Free</span>
                        </div>
                        <div className="flex justify-between pt-3 mt-1 border-t border-white/10">
                            <span className="font-semibold text-white font-host-grotesk">Total</span>
                            <span className="text-lg font-semibold text-white tabular-nums">
                                {totalPrice.toFixed(2)} AZN
                            </span>
                        </div>
                    </div>

                    <div className="px-6 pt-4">
                        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3.5">
                            <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="h-3.5 w-3.5 text-sky-400" />
                                <span className="text-xs font-semibold text-sky-300/90">Sandbox test card</span>
                            </div>
                            <p className="text-xs font-mono text-sky-200/80">4256 6900 0000 0001</p>
                            <p className="text-[11px] text-sky-400/70 mt-0.5">Future expiry · any CVV</p>
                        </div>
                    </div>

                    {error && (
                        <div className="px-6 pt-3">
                            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 font-host-grotesk">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="p-6 space-y-3">
                        <Button
                            type="button"
                            onClick={handlePay}
                            disabled={isPaying}
                            className="w-full h-12 text-base font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl font-host-grotesk shadow-lg shadow-amber-500/20"
                        >
                            {isPaying ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Redirecting…
                                </span>
                            ) : (
                                `Pay ${totalPrice.toFixed(2)} AZN`
                            )}
                        </Button>

                        <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Secured by OderoPay</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-200/80" />
                </div>
            }
        >
            <PaymentPageContent />
        </Suspense>
    );
}
