'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Copy, UploadCloud, Wallet } from 'lucide-react';
import type { Settings } from '@/lib/types';
import { formatRupiah } from '@/lib/format';
import { isOrderingClosed } from '@/lib/settings';

export default function PaymentPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cart, setCart] = useState<any[]>([]);
    const [form, setForm] = useState({
        fullName: '',
        whatsapp: '',
        studentId: '',
        major: '',
        gender: 'Female',
        notes: '',
    });
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const rawCart = sessionStorage.getItem('uneeds-cart');

        let savedCart: any[] = [];

        try {
            const parsed = rawCart ? JSON.parse(rawCart) : [];

            if (Array.isArray(parsed)) {
                savedCart = parsed;
            } else if (Array.isArray(parsed.items)) {
                savedCart = parsed.items;
            } else {
                savedCart = [];
            }
        } catch {
            savedCart = [];
        }

        setCart(savedCart);

        if (savedCart.length === 0) {
            router.replace('/order');
            return;
        }

        fetch('/api/settings').then((res) => res.json()).then((data) => {
            setSettings(data.settings || null);
            setLoading(false);
        });
    }, [router]);

    useEffect(() => {
        sessionStorage.setItem('uneeds-checkout', JSON.stringify(form));
    }, [form]);

    const safeCart = Array.isArray(cart) ? cart : [];

    const subtotal = safeCart.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
    );
    const serviceFee = settings?.service_fee || 0;
    const total = subtotal + serviceFee;
    const closed = isOrderingClosed(settings);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');
        setMessage('');

        if (!file) {
            setError('Please upload your payment proof.');
            setSubmitting(false);
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('The file is larger than 10MB.');
            setSubmitting(false);
            return;
        }

        if (closed) {
            setError('Orders are currently closed.');
            setSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'payments');

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || uploadData.error) {
            setError(uploadData.error || 'Payment proof upload failed.');
            setSubmitting(false);
            return;
        }

        const orderPayload = {
            order: {
                customer_name: form.fullName,
                whatsapp: form.whatsapp,
                student_id: form.studentId,
                major: form.major,
                gender: form.gender,
                notes: form.notes,
                subtotal,
                service_fee: serviceFee,
                total,
            },
            items: safeCart.map((item: any) => ({
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity,
            })),
            paymentProofUrl: uploadData.publicUrl,
            paymentProofName: file.name,
        };

        const idempotencyKey = `${form.whatsapp}-${form.fullName}-${safeCart.map((item) => `${item.id}:${item.quantity}`).join('|')}`;
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-idempotency-key': idempotencyKey,
            },
            body: JSON.stringify(orderPayload),
        });
        const data = await response.json();
        if (!response.ok) {
            setError(data.error || 'Could not place order.');
            setSubmitting(false);
            return;
        }

        sessionStorage.setItem('uneeds-last-order', JSON.stringify({ orderId: data.orderId, name: form.fullName, total }));
        router.push(`/success?orderId=${data.orderId}`);
    };

    const copyAccount = async () => {
        if (settings?.bca_account_number) {
            await navigator.clipboard.writeText(settings.bca_account_number);
        }
    };

    return (
        <main className="min-h-screen bg-[var(--page-bg)] px-4 py-8 text-[var(--text-primary)] sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-8">
                <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(45,20,145,0.08)] backdrop-blur-xl">
                    <Link href="/order" className="text-sm font-semibold text-[var(--primary)]">← Back to order</Link>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Checkout</p>
                            <h1 className="text-3xl font-semibold">Secure payment & order confirmation</h1>
                        </div>
                        <div className="rounded-2xl bg-[var(--secondary)]/25 px-4 py-3 text-sm font-semibold text-[var(--primary)]">Step 2 of 2</div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
                    <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2 text-sm font-medium">
                                Full Name
                                <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                            </label>
                            <label className="space-y-2 text-sm font-medium">
                                WhatsApp Number
                                <input required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                            </label>
                            <label className="space-y-2 text-sm font-medium">
                                Student ID (optional)
                                <input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                            </label>
                            <label className="space-y-2 text-sm font-medium">
                                Major
                                <input required value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                            </label>
                        </div>
                        <label className="space-y-2 text-sm font-medium">
                            Additional Notes
                            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
                        </label>

                        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-4">
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[20px] border border-slate-200 bg-white p-6 text-center">
                                <UploadCloud className="text-[var(--primary)]" />
                                <span className="font-semibold">Upload payment proof</span>
                                <span className="text-sm text-slate-500">jpg, jpeg, png, pdf up to 10MB</span>
                                <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
                            </label>
                            {file && <p className="mt-3 text-sm text-slate-600">Selected: {file.name}</p>}
                        </div>

                        {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}
                        {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">{message}</div> : null}

                        <button disabled={submitting || closed} className="w-full rounded-full bg-[var(--primary)] px-4 py-3 font-semibold text-white transition hover:bg-[var(--accent)] disabled:opacity-70">
                            {submitting ? 'Submitting order...' : 'Continue'}
                        </button>
                    </motion.form>

                    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
                        <div className="rounded-[24px] bg-slate-50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-[var(--primary)]/10 p-3 text-[var(--primary)]"><Wallet size={18} /></div>
                                <div>
                                    <h2 className="font-semibold">Bank Transfer</h2>
                                    <p className="text-sm text-slate-500">Pay before pickup confirmation</p>
                                </div>
                            </div>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2"><span>Bank</span><span className="font-semibold">BCA</span></div>
                                <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2"><span>Account Number</span><span className="font-semibold">{settings?.bca_account_number || '—'}</span></div>
                                <div className="flex items-center justify-between rounded-2xl bg-white px-3 py-2"><span>Account Name</span><span className="font-semibold">{settings?.bca_account_name || '—'}</span></div>
                            </div>
                            <button onClick={copyAccount} className="mt-4 flex items-center gap-2 rounded-full bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white"><Copy size={14} /> Copy account number</button>
                        </div>
                        <div className="rounded-[24px] border border-slate-200 p-4">
                            <h3 className="font-semibold">Order Summary</h3>
                            <div className="mt-4 space-y-3 text-sm">
                                {safeCart.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <span>{item.name} × {item.quantity}</span>
                                        <span>{formatRupiah(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between border-t border-slate-200 pt-3 font-semibold"><span>Total</span><span>{formatRupiah(total)}</span></div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
