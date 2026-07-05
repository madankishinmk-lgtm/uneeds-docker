'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, MessageCircleMore } from 'lucide-react';
import { formatRupiah } from '@/lib/format';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem('uneeds-last-order') || '{}');
    setOrder(saved);
  }, []);

  const orderId = searchParams.get('orderId') || order?.orderId;
  const name = order?.name || 'Student';
  const total = formatRupiah(order?.total || 0);

  const whatsappLink = `https://wa.me/6281281987115?text=Hello%20UNeeds!%0A%0AI%20have%20completed%20my%20payment.%0AOrder%20ID:%20${orderId}%0AName:%20${name}%0APlease%20verify%20my%20payment.%0AThank%20you.`;

  return (
    <main className="min-h-screen bg-[var(--page-bg)] px-4 py-10 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[36px] border border-white/70 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
        <div className="rounded-full bg-emerald-100 p-4 text-emerald-600"><CheckCircle2 size={32} /></div>
        <h1 className="mt-6 text-3xl font-semibold">Thank you! Your order has been submitted.</h1>
        <p className="mt-3 max-w-xl text-slate-600">Your order is now waiting for verification. Please send proof of payment through the WhatsApp button below.</p>
        <div className="mt-8 w-full rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-left text-sm">
          <div className="flex items-center justify-between"><span>Order ID</span><span className="font-semibold">{orderId}</span></div>
          <div className="mt-2 flex items-center justify-between"><span>Customer</span><span className="font-semibold">{name}</span></div>
          <div className="mt-2 flex items-center justify-between"><span>Total</span><span className="font-semibold">{total}</span></div>
          <div className="mt-2 flex items-center justify-between"><span>Status</span><span className="font-semibold text-amber-600">Waiting Verification</span></div>
        </div>
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="mt-8 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white"><MessageCircleMore size={18} /> Contact UNeeds on WhatsApp</a>
        <Link href="/" className="mt-4 text-sm font-semibold text-[var(--primary)]">Back to home</Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading order details...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
