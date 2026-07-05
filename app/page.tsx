"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

const steps = [
  "Browse essentials",
  "Fill the order form",
  "Receive an order ID",
  "Transfer payment",
  "Upload proof",
  "Confirm via WhatsApp",
  "Pick up on arrival",
];

const features = [
  {
    title: "Curated for new students",
    description: "Everything you need for dorm life, from bedding to daily-use essentials.",
  },
  {
    title: "Fast and dependable",
    description: "A smooth ordering flow, secure payment guidance, and instant confirmation.",
  },
  {
    title: "Built for arrival week",
    description: "Every order is prepared for pickup so your first days feel calm and organized.",
  },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <main className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
      <section className="mx-auto flex max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <nav className="relative flex items-center justify-between rounded-full border border-white/60 bg-white/70 px-4 py-3 shadow-[0_10px_35px_rgba(45,20,145,0.08)] backdrop-blur-xl">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
              U
            </div>

            <div>
              <p className="text-lg font-semibold tracking-[0.22em] text-[var(--primary)]">
                UNEEDS
              </p>
              <p className="text-xs text-slate-500">
                University Needs
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
            <a href="#how-it-works" className="rounded-full px-3 py-2 hover:bg-slate-100">
              How it works
            </a>

            <a href="#about" className="rounded-full px-3 py-2 hover:bg-slate-100">
              About
            </a>

            <a href="#faq" className="rounded-full px-3 py-2 hover:bg-slate-100">
              FAQ
            </a>

            <Link
              href="/track"
              className="rounded-full px-4 py-2 hover:bg-slate-100"
            >
              Track Order
            </Link>

            <Link
              href="/order"
              className="rounded-full bg-[var(--primary)] px-4 py-2 font-semibold text-white hover:bg-[var(--accent)]"
            >
              Order Now
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden rounded-xl p-2 hover:bg-slate-100"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </nav>

        

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mt-4 rounded-3xl border border-white/70 bg-white p-6 shadow-xl md:hidden"
            >
              <div className="flex flex-col gap-4">

                <a href="#how-it-works" onClick={() => setMobileOpen(false)}>
                  How it Works
                </a>

                <a href="#about" onClick={() => setMobileOpen(false)}>
                  About
                </a>

                <a href="#faq" onClick={() => setMobileOpen(false)}>
                  FAQ
                </a>

                <Link
                  href="/track"
                  onClick={() => setMobileOpen(false)}
                >
                  Track Order
                </Link>

                <Link
                  href="/order"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-[var(--primary)] py-3 text-center font-semibold text-white"
                >
                  Order Now
                </Link>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[36px] border border-white/70 bg-white/80 p-7 shadow-[0_20px_70px_rgba(45,20,145,0.12)] backdrop-blur-xl sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--secondary)]/25 px-3 py-2 text-sm font-semibold text-[var(--primary)]">
              <Sparkles size={16} /> Premium dorm preparation made simple
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
              Help new students settle in with everything they need before moving in day.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              UNeeds helps university students order dorm essentials in advance, enjoy a calm checkout experience, and collect everything on arrival without extra stress.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/order" className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--accent)]">
                Order Now <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-[var(--primary)] hover:text-[var(--primary)]">How It Works</a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="rounded-[36px] border border-white/70 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] p-7 text-white shadow-[0_20px_70px_rgba(45,20,145,0.16)] sm:p-8">
            <div className="rounded-[28px] border border-white/20 bg-white/15 p-5 backdrop-blur-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--secondary)]">Arrival ready</p>
              <h2 className="mt-3 text-2xl font-semibold">Everything your student life needs in one place.</h2>
              <div className="mt-6 space-y-3 text-sm text-white/90">
                {[
                  "Curated dorm essentials",
                  "Flexible quantity selection",
                  "Secured payment and verification",
                  "Reliable pickup before semester starts",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2">
                    <CheckCircle2 size={16} className="text-[var(--secondary)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <section id="how-it-works" className="mt-10 rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(30,30,30,0.06)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">How it works</p>
              <h3 className="text-2xl font-semibold sm:text-3xl">A simple flow from cart to campus pickup</h3>
            </div>
            <div className="rounded-full bg-[var(--secondary)]/20 px-4 py-2 text-sm font-semibold text-[var(--primary)]">7 easy steps</div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div key={step} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">{index + 1}</div>
                  <Compass size={18} className="text-[var(--accent)]" />
                </div>
                <p className="mt-4 font-semibold">{step}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="about" className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(30,30,30,0.06)] backdrop-blur-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">About</p>
            <h3 className="mt-2 text-2xl font-semibold sm:text-3xl">Designed for comfort, clarity, and first-time confidence.</h3>
            <p className="mt-4 leading-8 text-slate-600">UNeeds brings premium ordering experiences to the campus environment with a calm, modern interface that feels effortless even for first-time users.</p>
          </div>
          <div className="grid gap-4">
            {features.map((feature) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_50px_rgba(30,30,30,0.05)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[var(--secondary)]/20 p-2 text-[var(--primary)]"><ShieldCheck size={18} /></div>
                  <h4 className="font-semibold">{feature.title}</h4>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="faq" className="mt-10 rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(30,30,30,0.06)] backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">FAQ</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Do I need an account?", "No. You can order directly without creating an account."],
              ["How do I pay?", "Use the bank transfer details on the payment page and upload proof."],
              ["When do I collect my items?", "Pickup is arranged upon arrival on campus after verification."],
              ["Can I edit my order?", "Contact the admin through WhatsApp for support after submission."],
            ].map(([question, answer]) => (
              <div key={question} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <h4 className="font-semibold">{question}</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">{answer}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <footer className="mt-10 border-t border-slate-200/70 bg-white/70 px-4 py-6 text-center text-sm text-slate-600 sm:px-6 lg:px-8">
        <p>© 2026 UNeeds. Designed for smooth arrival-week living.</p>
      </footer>
    </main>
  );
}
