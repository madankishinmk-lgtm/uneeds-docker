'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, AlertCircle, CalendarDays, User, Package, CreditCard, ArrowRight } from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { getStatusClasses, getStatusTimeline } from '@/lib/order-status';

export default function TrackPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    const response = await fetch(`/api/orders?order_id=${encodeURIComponent(orderId.trim())}`);
    const data = await response.json();

    if (!response.ok || !data.order) {
      setError('Order not found. Please check your Order ID again.');
      setLoading(false);
      return;
    }

    setOrder(data.order);
    setLoading(false);
  };

  const timeline = order ? getStatusTimeline(order.status) : [];

  return (
    <main className="min-h-screen bg-[var(--page-bg)] px-4 py-8 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <nav className="flex items-center justify-between rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-[0_10px_35px_rgba(45,20,145,0.08)] backdrop-blur-xl">
          <Link href="/" className="text-xl font-semibold tracking-[0.2em] text-[var(--primary)]">UNEEDS</Link>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Link href="/" className="rounded-full px-3 py-2 hover:bg-slate-100">Home</Link>
            <Link href="/track" className="rounded-full bg-[var(--primary)] px-3 py-2 text-white">Track</Link>
          </div>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Order Tracking</p>
            <h1 className="mt-3 text-3xl font-semibold">Check your order status</h1>
            <p className="mt-3 text-slate-600">Enter your order ID to view the latest status, payment progress, and order details.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium">
                Order ID
                <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="UNEEDS-XXXXXXXX" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none" />
              </label>
              <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 py-3 font-semibold text-white">
                <Search size={16} /> {loading ? 'Checking...' : 'Check Order'}
              </button>
            </form>
            {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div> : null}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
            {order ? (
              <div className="space-y-6">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">Current Status</p>
                      <p className="mt-2 text-2xl font-semibold">{order.order_id}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${getStatusClasses(order.status)}`}>{order.status}</span>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500"><User size={16} /> Customer</div>
                      <p className="mt-2 font-semibold">{order.customer_name}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={16} /> Order Date</div>
                      <p className="mt-2 font-semibold">{order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500"><CreditCard size={16} /> Total</div>
                      <p className="mt-2 font-semibold">{formatRupiah(order.total)}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 p-4">
                  <h2 className="text-lg font-semibold">Status Timeline</h2>
                  <div className="mt-4 space-y-3">
                    {timeline.map((step: any) => (
                      <div key={step.label} className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.active ? 'bg-[var(--primary)] text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {step.done ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
                        </div>
                        <div className="text-sm font-medium">{step.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 p-4">
                  <h2 className="text-lg font-semibold">Ordered Items</h2>
                  <div className="mt-4 space-y-3">
                    {(order.order_items || []).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
                        <div>
                          <p className="font-semibold">{item.product_name}</p>
                          <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatRupiah(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 p-4">
                  <h2 className="text-lg font-semibold">Admin Notes</h2>
                  <p className="mt-2 text-sm text-slate-600">{order.notes || 'No notes yet.'}</p>
                </div>

                <div className="rounded-[24px] border border-slate-200 p-4">
                  <h2 className="text-lg font-semibold">Payment Status</h2>
                  <p className="mt-2 text-sm text-slate-600">{order.payment_proof_url ? 'Payment proof uploaded' : 'Awaiting proof upload'}</p>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                <AlertCircle size={28} />
                <p className="mt-3 text-lg font-semibold">No order selected</p>
                <p className="mt-2 text-sm">Use the search box to locate your order by ID.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
