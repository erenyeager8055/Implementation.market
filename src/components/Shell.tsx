'use client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useState } from 'react';
import { Menu, Search, ShoppingBag, Sparkles, X, SlidersHorizontal } from 'lucide-react';
import { useStore } from '@/lib/store';
import { CATEGORIES, PRODUCTS } from '@/lib/data';
import { ConfigureModal } from './ConfigureModal';
import { spring } from './motion';

const NAV = [
  { href: '/', label: 'Marketplace' }, { href: '/surveysparrow', label: 'SurveySparrow' }, { href: '/thrivesparrow', label: 'ThriveSparrow' },
  { href: '/cart', label: 'My Cart' }, { href: '/summary', label: 'Implementation Summary' },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname(); const active = useSearchParams().get('cat');
  const only = path === '/surveysparrow' ? 'surveysparrow' : path === '/thrivesparrow' ? 'thrivesparrow' : null;
  const base = only ? `/${only}` : '/';
  const Item = ({ href, id, children }: { href: string; id: string; children: React.ReactNode }) => {
    const on = (active ?? '') === id;
    return (
      <Link href={href} onClick={onNavigate} className="relative block rounded-xl px-3 py-2 text-sm transition-colors hover:text-teal-700">
        {on && <motion.span layoutId="side-pill" transition={spring} className="absolute inset-0 rounded-xl bg-teal-50 ring-1 ring-teal-100" />}
        <span className={`relative ${on ? 'font-semibold text-teal-700' : 'text-slate-600'}`}>{children}</span>
      </Link>
    );
  };
  return (
    <nav className="space-y-5 p-4">
      <Item href={base} id="">All services</Item>
      {PRODUCTS.filter((p) => !only || p.key === only).map((p) => (
        <div key={p.key}>
          <div className="mb-1 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">{p.name}</div>
          {CATEGORIES[p.key].map(([k, n]) => <Item key={k} href={`${base}?cat=${p.key}:${k}`} id={`${p.key}:${k}`}>{n}</Item>)}
        </div>
      ))}
    </nav>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { pricing, query, setQuery, toast } = useStore();
  const path = usePathname(); const router = useRouter();
  const [open, setOpen] = useState(false);
  const count = pricing.items.length;
  const catalogPage = path === '/' || path === '/surveysparrow' || path === '/thrivesparrow';

  return (
    <div className="min-h-screen">
      <header className="no-print sticky top-0 z-30 border-b border-navy-100/70 glass">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
          {catalogPage && <button className="rounded-lg p-1.5 hover:bg-navy-50 lg:hidden" aria-label="Menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>}
          <Link href="/" className="flex items-center gap-2.5">
            <motion.span whileHover={{ rotate: -8, scale: 1.08 }} transition={spring} className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-700 text-white shadow-lg shadow-teal-600/30"><Sparkles className="h-5 w-5" /></motion.span>
            <span className="hidden text-[15px] font-bold tracking-tight sm:block">Implementation<span className="text-teal-600">.market</span></span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 rounded-2xl bg-navy-50/80 p-1 xl:flex">
            {NAV.map((n) => {
              const on = n.href === '/' ? path === '/' : path.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} className="relative rounded-xl px-3.5 py-1.5 text-sm font-medium">
                  {on && <motion.span layoutId="nav-pill" transition={spring} className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-navy-100/70" />}
                  <span className={`relative ${on ? 'text-navy-900' : 'text-slate-500 hover:text-navy-900'}`}>{n.label}</span>
                </Link>
              );
            })}
          </nav>
          <form className="ml-auto flex min-w-0 max-w-md flex-1 items-center" onSubmit={(e) => { e.preventDefault(); if (!catalogPage) router.push('/'); }}>
            <label className="group relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-focus-within:text-teal-600" />
              <input value={query} onChange={(e) => { setQuery(e.target.value); if (!catalogPage) router.push('/'); }} placeholder="Search services…" aria-label="Search services"
                className="w-full rounded-xl border border-navy-100 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100" />
            </label>
          </form>
          <Link href="/rates" aria-label="Rates & targets" className="hidden rounded-xl p-2.5 text-slate-500 transition hover:bg-navy-50 hover:text-navy-900 sm:block"><SlidersHorizontal className="h-[18px] w-[18px]" /></Link>
          <motion.div whileTap={{ scale: 0.94 }}>
            <Link href="/cart" aria-label="Cart" className="relative flex items-center gap-2 rounded-xl bg-navy-900 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700">
              <ShoppingBag className="h-[18px] w-[18px]" /><span className="hidden sm:inline">Cart</span>
              <AnimatePresence mode="popLayout">
                <motion.span key={count} initial={{ scale: 0.4, y: -6, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={spring}
                  className="grid h-5 min-w-5 place-items-center rounded-full bg-teal-400 px-1 text-xs font-bold text-navy-900">{count}</motion.span>
              </AnimatePresence>
            </Link>
          </motion.div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 xl:hidden">
          {NAV.map((n) => { const on = n.href === '/' ? path === '/' : path.startsWith(n.href);
            return <Link key={n.href} href={n.href} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${on ? 'bg-navy-900 font-semibold text-white' : 'text-slate-600 hover:bg-navy-50'}`}>{n.label}</Link>; })}
        </nav>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {catalogPage && <aside className="no-print sticky top-[69px] hidden h-[calc(100vh-69px)] w-64 shrink-0 overflow-y-auto lg:block"><Suspense><Sidebar /></Suspense></aside>}
        <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', stiffness: 320, damping: 34 }} className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white shadow-lift">
              <div className="flex items-center justify-between border-b p-4 font-semibold">Categories<button onClick={() => setOpen(false)} aria-label="Close"><X /></button></div>
              <Suspense><Sidebar onNavigate={() => setOpen(false)} /></Suspense>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfigureModal />
      <AnimatePresence>
        {toast && <motion.div role="status" initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} transition={spring}
          className="no-print fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-navy-900 px-5 py-3 text-sm font-medium text-white shadow-lift">{toast}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
