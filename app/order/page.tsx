'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Sparkles, Minus, Plus } from 'lucide-react';
import type { Product, Settings } from '@/lib/types';
import { formatRupiah } from '@/lib/format';
import { getStoragePublicUrl } from '@/lib/storage';
import { isOrderingClosed } from '@/lib/settings';

type CartItem = Product & { quantity: number };

export default function OrderPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<Settings | null>(null);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('uneeds-cart');

            if (raw) {
                const parsed = JSON.parse(raw);

                if (Array.isArray(parsed)) {
                    const cartObject: Record<string, number> = {};

                    parsed.forEach((item: any) => {
                        cartObject[item.id] = item.quantity;
                    });

                    setCart(cartObject);
                } else {
                    setCart(parsed || {});
                }
            }
        } catch {
            setCart({});
        }

        const load = async () => {
            setLoading(true);

            const [productsRes, settingsRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/settings'),
            ]);

            const productsData = await productsRes.json();
            const settingsData = await settingsRes.json();

            setProducts(productsData.products || []);
            setSettings(settingsData.settings || null);

            setLoading(false);
        };

        load();
    }, []);

    useEffect(() => {
        sessionStorage.setItem('uneeds-cart', JSON.stringify(cart));
    }, [cart]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()));
    }, [products, search]);

    const cartItems = useMemo<CartItem[]>(() => {
        return products
            .filter((product) => cart[product.id])
            .map((product) => ({
                ...product,
                quantity: cart[product.id],
            }));
    }, [products, cart]);

    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [cartItems]
    );

    const serviceFee = settings?.service_fee || 0;
    const total = subtotal + serviceFee;
    const closed = isOrderingClosed(settings);

    const updateQuantity = (productId: string, delta: number) => {
        setCart((current) => {
            const next = { ...current };
            const quantity = (next[productId] || 0) + delta;

            if (quantity <= 0) {
                delete next[productId];
            } else {
                next[productId] = quantity;
            }

            return next;
        });
    };

    const handleCheckout = () => {
        sessionStorage.setItem(
            "uneeds-cart",
            JSON.stringify(cartItems)
        );

        sessionStorage.setItem(
            "uneeds-checkout",
            JSON.stringify({
                subtotal,
                serviceFee,
                total,
            })
        );

        window.location.href = "/payment";
    };

    return (
        <main className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
            <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-[0_10px_35px_rgba(45,20,145,0.08)] backdrop-blur-xl">
                    <Link href="/" className="text-xl font-semibold tracking-[0.2em] text-[var(--primary)]">UNEEDS</Link>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Link href="/" className="rounded-full px-3 py-2 hover:bg-slate-100">Home</Link>
                        <Link href="/order" className="rounded-full bg-[var(--primary)] px-3 py-2 text-white">Order</Link>
                    </div>
                </nav>

                <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="space-y-6">
                        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(45,20,145,0.08)] backdrop-blur-xl">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Dorm essentials</p>
                                    <h1 className="text-3xl font-semibold sm:text-4xl">Build your first-week kit</h1>
                                </div>
                                <div className="rounded-2xl bg-[var(--primary)]/10 px-4 py-3 text-sm text-[var(--primary)]">
                                    <div className="flex items-center gap-2 font-semibold"><Sparkles size={16} /> Premium pickup experience</div>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <label className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-3">
                                    <Search size={16} className="text-slate-400" />
                                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="w-full bg-transparent outline-none" />
                                </label>
                            </div>
                        </motion.div>

                        {closed ? (
                            <div className="rounded-[32px] border border-white/70 bg-white/90 p-10 text-center shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
                                <h2 className="text-2xl font-semibold">Orders are now closed.</h2>
                                <p className="mt-3 text-slate-600">Thank you for your interest. Please wait for the next ordering period.</p>
                            </div>
                        ) : null}

                        {loading ? (
                            <div className="grid gap-5 md:grid-cols-2">
                                {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-[28px] bg-slate-200" />)}
                            </div>
                        ) : (
                            <div className="grid gap-5 md:grid-cols-2">
                                {filteredProducts.map((product) => (
                                    <motion.article key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(30,30,30,0.07)]">
                                        <div className="h-40 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/20 p-4">
                                            {product.image_url ? (
                                                <img src={getStoragePublicUrl(product.image_url) || undefined} alt={product.name} className="h-full w-full rounded-[22px] object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center rounded-[22px] border border-dashed border-[var(--primary)]/20 bg-white/60 text-sm font-medium text-slate-500">Image coming soon</div>
                                            )}
                                        </div>
                                        <div className="space-y-4 p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h2 className="text-lg font-semibold">{product.name}</h2>
                                                </div>
                                                <div className="rounded-full bg-[var(--secondary)]/20 px-3 py-1 text-sm font-semibold text-[var(--primary)]">{formatRupiah(product.price)}</div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-slate-500">Stock: {product.stock ?? 'Available'}</div>
                                                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
                                                    <button onClick={() => updateQuantity(product.id, -1)} className="rounded-full p-2 hover:bg-white" aria-label={`Decrease ${product.name}`}>
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="w-6 text-center text-sm font-semibold">{cart[product.id] || 0}</span>
                                                    <button onClick={() => updateQuantity(product.id, 1)} className="rounded-full p-2 hover:bg-white" aria-label={`Increase ${product.name}`}>
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <button disabled={closed} onClick={() => updateQuantity(product.id, 1)} className={`w-full rounded-full px-4 py-3 font-semibold text-white transition ${closed ? 'cursor-not-allowed bg-slate-300' : 'bg-[var(--primary)] hover:translate-y-[-1px] hover:bg-[var(--accent)]'}`}>Add to Cart</button>
                                        </div>
                                    </motion.article>
                                ))}
                            </div>
                        )}
                    </div>

                    <aside className="lg:sticky lg:top-4 lg:h-fit">
                        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(30,30,30,0.08)] backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Shopping Cart</h2>
                                <div className="rounded-full bg-[var(--primary)]/10 p-2 text-[var(--primary)]"><ShoppingCart size={18} /></div>
                            </div>
                            <div className="mt-6 space-y-4">
                                {cartItems.length === 0 ? (
                                    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">Your cart is empty. Add dorm essentials to get started.</div>
                                ) : cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between rounded-[22px] bg-slate-50 p-3">
                                        <div>
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-[var(--primary)]">{formatRupiah(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 space-y-3 rounded-[24px] bg-slate-50 p-4 text-sm">
                                <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                                <div className="flex items-center justify-between"><span>Service Fee</span><span>{formatRupiah(serviceFee)}</span></div>
                                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold"><span>Total</span><span>{formatRupiah(total)}</span></div>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0 || closed}
                                className={`mt-6 flex w-full items-center justify-center rounded-full px-4 py-3 font-semibold text-white transition ${cartItems.length > 0 && !closed
                                    ? 'bg-[var(--primary)] hover:bg-[var(--accent)]'
                                    : 'cursor-not-allowed bg-slate-300'
                                    }`}
                            >
                                Checkout
                            </button>
                        </motion.div>
                    </aside>
                </div>
            </section>
        </main>
    );
}
