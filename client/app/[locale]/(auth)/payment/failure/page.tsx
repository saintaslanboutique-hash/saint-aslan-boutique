'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import orderApi from '@/src/entities/order/service/order.api';

const PENDING_ORDER_KEY = 'pendingPaymentOrderId';

export default function PaymentFailurePage() {
    const locale = useLocale();

    useEffect(() => {
        const id = typeof window !== 'undefined' ? sessionStorage.getItem(PENDING_ORDER_KEY) : null;
        if (!id) return;

        let cancelled = false;
        (async () => {
            try {
                const { data: order } = await orderApi.getOrderById(id);
                if (cancelled) return;
                if (order.paymentStatus === 'paid' || order.status === 'completed') {
                    sessionStorage.removeItem(PENDING_ORDER_KEY);
                    return;
                }
                await orderApi.cancelOrder(id);
            } catch {
                /* ignore */
            } finally {
                if (!cancelled && typeof window !== 'undefined') {
                    sessionStorage.removeItem(PENDING_ORDER_KEY);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#141210] text-neutral-100 relative overflow-hidden">
            <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                    backgroundImage:
                        'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(248, 113, 113, 0.15), transparent), radial-gradient(circle at 10% 90%, rgba(251, 191, 36, 0.06), transparent)',
                }}
            />
            <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 py-16">
                <div className="w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 shadow-2xl shadow-black/40 backdrop-blur-md">
                    <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-red-900/10 ring-1 ring-red-500/25">
                        <XCircle className="h-10 w-10 text-red-400" strokeWidth={1.75} />
                    </div>

                    <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-red-300/90 font-host-grotesk">
                        Payment unsuccessful
                    </p>
                    <h1 className="mt-3 text-center text-3xl font-semibold tracking-tight text-white font-host-grotesk">
                        We couldn&apos;t complete that
                    </h1>
                    <p className="mt-4 text-center text-sm leading-relaxed text-neutral-400 font-host-grotesk">
                        Your card may have been declined, or the session timed out. Any unpaid order was cancelled
                        and stock was released — you can try again whenever you&apos;re ready.
                    </p>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href={`/${locale}/payment`}
                            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400 font-host-grotesk sm:flex-initial"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try again
                        </Link>
                        <Link
                            href={`/${locale}`}
                            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10 font-host-grotesk sm:flex-initial"
                        >
                            <Home className="h-4 w-4" />
                            Home
                        </Link>
                    </div>
                </div>

                <p className="mt-10 text-center text-xs text-neutral-500 font-host-grotesk">
                    Need help? Use another card or contact your bank, then retry checkout.
                </p>
            </div>
        </div>
    );
}
