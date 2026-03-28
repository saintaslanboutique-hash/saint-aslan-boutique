'use client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import orderApi from '@/src/entities/order/service/order.api';
import type { Order } from '@/src/entities/order/types/order.types';
import getInitials from '@/src/entities/profile/helpers/get-initial';
import useAuthStore from '@/src/entities/user/model/auth.store';
import {
    Globe,
    PencilIcon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import ProfileEditForm from './profile-edit-form';


const ROLE_LABELS: Record<string, { label: string; style: string }> = {
    super_admin: { label: 'Super Admin', style: 'bg-purple-100 text-purple-800 border border-purple-200' },
    admin: { label: 'Admin', style: 'bg-blue-100 text-blue-800 border border-blue-200' },
    client: { label: 'Client', style: 'bg-gray-100 text-gray-700 border border-gray-200' },
    user: { label: 'User', style: 'bg-gray-100 text-gray-700 border border-gray-200' },
};

export default function Profile() {
    const { user, initialize } = useAuthStore();
    const locale = useLocale();
    const [orders, setOrders] = useState<Order[] | null>(null);

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!user) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await orderApi.getOrders();
                if (!cancelled) setOrders(Array.isArray(res.data) ? res.data : []);
            } catch {
                if (!cancelled) setOrders([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user]);

    if (!user) {
        return <div>Loading...</div>;
    }
    const username = user.username.split('')[0].toUpperCase() + user.username.split('').slice(1).join('');

    const role = ROLE_LABELS[user.role] ?? ROLE_LABELS.user;

    const storeHref = `/${locale}/products`;

    return (
        <section className="flex flex-col gap-8 lg:flex-row lg:items-start bg-[#F9FAFB] px-4 py-8 lg:gap-10 lg:px-6 lg:py-10">
            {/* ─── Left: identity card ─── */}
            <aside className="w-full shrink-0 space-y-4 lg:w-1/4">

                <div className="bg-white border border-gray-200 overflow-hidden">
                    <div className={`py-8 relative ${role.style} bg-gray-900 `}>
                        <h1 className="text-4xl font-bold text-white">Welcome, {username}</h1>
                        <Sheet>
                            <SheetTrigger asChild className='absolute bottom-2 right-2'>
                                <Button variant="outline" className="w-6 h-6 p-3 rounded-full bg-gray-200 flex items-center justify-center">
                                    <PencilIcon className="w-4 h-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="min-w-[50vw] w-full sm:w-[50vw] z-9999">
                                <ProfileEditForm />
                            </SheetContent>
                        </Sheet>
                    </div>
                    <div className="px-5 pb-5 -mt-8">
                        <div className="relative w-16 h-16 border-2 border-white rounded-full shadow-sm flex items-center justify-center bg-gray-600 select-none">
                            {user.avatarUrl ? (
                                <Image src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover rounded-full" width={64} height={64} />
                            ) : (
                                <span className="text-white text-lg font-bold">{getInitials(user.username)}</span>
                            )}
                        </div>
                        <div className="mt-3">
                            <h2 className="text-lg font-bold text-gray-900 leading-tight">{username}</h2>
                            <p className="text-sm text-gray-500 mt-0.5 break-all">{user.email}</p>
                        </div>
                    </div>
                </div>

                {(user.sosialLinks?.facebook || user.sosialLinks?.twitter || user.sosialLinks?.instagram) && (
                    <div className="bg-white border border-gray-200 px-5 py-4">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Social</p>
                        <div className="space-y-2">
                            {user.sosialLinks?.facebook && (
                                <a href={user.sosialLinks.facebook} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                                    <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="truncate">Facebook</span>
                                </a>
                            )}
                            {user.sosialLinks?.twitter && (
                                <a href={user.sosialLinks.twitter} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                                    <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="truncate">Twitter / X</span>
                                </a>
                            )}
                            {user.sosialLinks?.instagram && (
                                <a href={user.sosialLinks.instagram} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                                    <Globe className="w-4 h-4 text-gray-400 shrink-0" />
                                    <span className="truncate">Instagram</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </aside>

            <main className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-black">Orders</h2>
                <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-white">
                    {orders === null ? (
                        <div className="flex min-h-[200px] items-center justify-center px-6 py-16">
                            <p className="text-sm text-gray-500">Loading orders…</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 py-16 text-center">
                            <p className="text-base font-bold text-black">No orders yet</p>
                            <p className="mt-2 text-sm font-normal text-black">
                                Go to{' '}
                                <Link href={storeHref} className="underline underline-offset-2 hover:text-gray-700">
                                    store
                                </Link>{' '}
                                to place an order.
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-[#E5E7EB]">
                            {orders.map((order) => (
                                <li key={order._id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-black">
                                            Order #{order._id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-black">${order.totalAmount.toFixed(2)}</p>
                                        <p className="capitalize text-gray-600">{order.status}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </main>
        </section>
    );
}
