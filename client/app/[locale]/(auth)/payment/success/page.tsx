'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { useProductStore } from '@/src/entities/product/model/product.store';

const PENDING_ORDER_KEY = 'pendingPaymentOrderId';

export default function PaymentSuccessPage() {
    const locale = useLocale();
    const fetchProducts = useProductStore((s) => s.fetchProducts);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(PENDING_ORDER_KEY);
        }
    }, []);

    /** Order creation already decremented variant/product stock on the server — refresh catalog. */
    useEffect(() => {
        void fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="min-h-screen bg-[#faf8f5] text-neutral-900 relative overflow-hidden">
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.45]"
                style={{
                    backgroundImage:
                        'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34, 197, 94, 0.12), transparent), radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.08), transparent)',
                }}
            />
            <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-16">
                <div className="w-full rounded-[2rem] border border-neutral-200/80 bg-white/90 p-10 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                    <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/10 ring-1 ring-emerald-500/20">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={1.75} />
                    </div>

                    <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700/80 font-host-grotesk">
                        Payment received
                    </p>
                    <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-neutral-900 font-host-grotesk">
                        You&apos;re all set
                    </h1>
                    <p className="mt-4 text-center text-sm leading-relaxed text-neutral-600 font-host-grotesk">
                        Thank you for your purchase. Your order is being processed — we&apos;ll keep you updated.
                    </p>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href={`/${locale}/profile`}
                            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 font-host-grotesk sm:flex-initial"
                        >
                            <Package className="h-4 w-4 opacity-90" />
                            View orders
                        </Link>
                        <Link
                            href={`/${locale}/products`}
                            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50 font-host-grotesk sm:flex-initial"
                        >
                            Continue shopping
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <p className="mt-10 text-center text-xs text-neutral-400 font-host-grotesk">
                    Questions? Check your email for a confirmation from us.
                </p>
            </div>
        </div>
    );
}
