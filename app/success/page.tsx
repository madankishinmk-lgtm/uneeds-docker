"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  MessageCircleMore,
  Search,
} from "lucide-react";

export default function SuccessPage() {
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const urlOrderId = params.get("orderId") || "";

    const saved = JSON.parse(
      sessionStorage.getItem("uneeds-last-order") || "{}"
    );

    setOrderId(saved.orderId || urlOrderId);
  }, []);

  const handleCopy = async () => {
    if (!orderId) return;

    await navigator.clipboard.writeText(orderId);

    alert("Order ID copied!");
  };

  const whatsappLink = `https://wa.me/6281281987115?text=Hello%20UNeeds!%0A%0AI%20have%20completed%20my%20payment.%0AOrder%20ID:%20${orderId}%0APlease%20verify%20my%20payment.%0AThank%20you.`;

  return (
    <main className="min-h-screen bg-[var(--page-bg)] px-4 py-10 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[36px] border border-white/70 bg-white/90 p-8 text-center shadow-[0_20px_60px_rgba(30,30,30,0.08)]">
        <div className="rounded-full bg-emerald-100 p-4 text-emerald-600">
          <CheckCircle2 size={32} />
        </div>

        <h1 className="mt-6 text-3xl font-semibold">
          Thank You
        </h1>

        <p className="mt-3 max-w-xl text-slate-600">
          Order successfully submitted. Please save your Order ID and use it to
          track your order.
        </p>

        <div className="mt-8 w-full rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-left text-sm">
          <div className="flex items-center justify-between">
            <span>Order ID</span>
            <span className="font-semibold">
              {orderId || "—"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 font-semibold text-white"
          >
            <Copy size={16} />
            Copy Order ID
          </button>

          <Link
            href="/track"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
          >
            <Search size={16} />
            Track Order
          </Link>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white"
          >
            <MessageCircleMore size={16} />
            Contact UNeeds
          </a>
        </div>

        <Link
          href="/"
          className="mt-4 text-sm font-semibold text-[var(--primary)]"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}