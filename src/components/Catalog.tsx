'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Plus, SlidersHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { CATALOG, CATEGORIES, PRODUCTS, ServiceView } from '@/lib/data';
import { Icon } from './Icon';
import { fadeUp, spring, stagger } from './motion';

function Card({ s }: { s: ServiceView }) {
  const { openConfigure, has } = useStore();
  const inCart = has(s.key);
  return (
    <motion.article variants={fadeUp} layout whileHover={{ y: -6 }} transition={spring}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-100/70 bg-white p-5 shadow-card transition-shadow duration-300 hover:shadow-lift">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-100/0 blur-2xl transition-all duration-500 group-hover:bg-teal-100/80" />
      <div className="relative mb-4 flex items-start justify-between">
        <motion.div whileHover={{ rotate: -6, scale: 1.08 }} transition={spring} className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-teal-50 to-white text-teal-600 ring-1 ring-teal-100"><Icon name={s.icon} className="h-6 w-6" /></motion.div>
        <span className="chip">{s.product === 'surveysparrow' ? 'SurveySparrow' : 'ThriveSparrow'}</span>
      </div>
      <div className="relative text-[11px] font-semibold uppercase tracking-widest text-slate-400">{s.categoryName}</div>
      <h3 className="relative mt-1 text-[17px] font-bold leading-snug tracking-tight text-navy-900">{s.name}</h3>
      <p className="relative mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{s.description}</p>
      <div className="relative mt-5 flex gap-2">
        <motion.button whileTap={{ scale: 0.96 }} className="btn-ghost flex-1 !px-3" onClick={() => openConfigure(s)}><SlidersHorizontal className="h-4 w-4" />Configure</motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => openConfigure(s)} className={`flex-1 !px-3 ${inCart ? 'btn bg-teal-50 text-teal-700 hover:bg-teal-100' : 'btn-primary'}`}>
          {inCart ? <><Check className="h-4 w-4" />In cart</> : <><Plus className="h-4 w-4" />Add to Cart</>}
        </motion.button>
      </div>
    </motion.article>
  );
}

export function Catalog({ product }: { product?: 'surveysparrow' | 'thrivesparrow' }) {
  const { query } = useStore();
  const cat = useSearchParams().get('cat');
  const q = query.trim().toLowerCase();
  const list = useMemo(() => CATALOG.filter((s) =>
    (!product || s.product === product) && (!cat || `${s.product}:${s.category}` === cat) &&
    (!q || `${s.name} ${s.description} ${s.categoryName}`.toLowerCase().includes(q))), [product, cat, q]);
  const landing = !product && !cat && !q;
  const prods = PRODUCTS.filter((p) => !product || p.key === product);
  const gridKey = `${product}-${cat}-${q}`;

  return (
    <div className="space-y-10">
      {landing ? (
        <section className="relative overflow-hidden rounded-3xl border border-navy-100/70 bg-white p-6 shadow-card sm:p-10">
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
          <motion.div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-teal-300/30 blur-3xl" animate={{ x: [0, 30, 0], y: [0, 20, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div aria-hidden className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-navy-200/50 blur-3xl" animate={{ x: [0, -30, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div variants={stagger} initial="hidden" animate="show" className="relative max-w-2xl">
            <motion.span variants={fadeUp} className="chip !bg-navy-900 !text-teal-300">Implementation estimator</motion.span>
            <motion.h1 variants={fadeUp} className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl">Scope your implementation <span className="bg-gradient-to-r from-teal-500 to-teal-700 bg-clip-text text-transparent">like you shop.</span></motion.h1>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600">Pick services, answer a few questions, and your cart turns them into effort, timeline and cost.</motion.p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" animate="show" className="relative mt-8 grid gap-4 md:grid-cols-2">
            {PRODUCTS.map((p, i) => (
              <motion.div key={p.key} variants={fadeUp} whileHover={{ y: -5 }} transition={spring}>
                <Link href={`/${p.key}`} className={`group relative block overflow-hidden rounded-2xl p-6 text-white shadow-lift ${i === 0 ? 'bg-gradient-to-br from-navy-900 via-navy-800 to-teal-700' : 'bg-gradient-to-br from-teal-700 via-navy-800 to-navy-900'}`}>
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 transition-transform duration-500 group-hover:scale-150" />
                  <Icon name={p.icon} className="relative h-9 w-9 text-teal-300" />
                  <h2 className="relative mt-4 text-xl font-bold tracking-tight">{p.name} Implementation Services</h2>
                  <p className="relative mt-1 text-sm text-slate-200">{p.description}</p>
                  <div className="relative mt-5 flex items-center justify-between text-sm">
                    <span className="rounded-full bg-white/10 px-3 py-1">{CATALOG.filter((s) => s.product === p.key).length} services</span>
                    <span className="flex items-center gap-1.5 font-semibold">Browse <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" /></span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      ) : (
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">{q ? `Results for “${query}”` : product ? `${prods[0].name} Implementation Services` : 'Implementation services'}</h1>
          <p className="mt-1 text-slate-500">{list.length} service{list.length === 1 ? '' : 's'}</p>
        </header>
      )}

      {prods.map((p) => {
        const items = list.filter((s) => s.product === p.key);
        if (!items.length) return null;
        return (
          <section key={p.key} className="space-y-8">
            {landing && <h2 className="text-xl font-bold tracking-tight">{p.name} services</h2>}
            {CATEGORIES[p.key].map(([ck, cn]) => {
              const cs = items.filter((s) => s.category === ck);
              if (!cs.length) return null;
              return (
                <div key={ck}>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">{cn}</h3>
                  <motion.div key={gridKey} variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {cs.map((s) => <Card key={s.key} s={s} />)}
                  </motion.div>
                </div>
              );
            })}
          </section>
        );
      })}
      {list.length === 0 && <div className="card p-12 text-center text-slate-500">No services match your search.</div>}
    </div>
  );
}
