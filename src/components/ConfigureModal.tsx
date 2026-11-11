'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Icon } from './Icon';
import { spring } from './motion';

/** Contextual configuration pop-up. Questions only: effort and cost are revealed in the cart. */
export function ConfigureModal() {
  const { configure: svc, closeConfigure, has, configOf, save, notify } = useStore();
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!svc) return;
    const v: Record<string, any> = {};
    svc.model.questions.forEach((q) => (v[q.key] = q.default ?? (q.type === 'boolean' ? false : q.type === 'number' ? 0 : q.options?.[0])));
    setValues({ ...v, ...(configOf(svc.key) ?? {}) }); setErrors([]);
  }, [svc]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!svc) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && closeConfigure();
    document.addEventListener('keydown', h); document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [svc, closeConfigure]);

  const set = (k: string, v: any) => setValues((s) => ({ ...s, [k]: v }));
  const editing = !!svc && has(svc.key);
  const submit = () => {
    if (!svc) return;
    const errs = save(svc.key, values);
    if (errs.length) return setErrors(errs);
    notify(editing ? `${svc.name} updated` : `${svc.name} added to your cart`); closeConfigure();
  };

  return (
    <AnimatePresence>
      {svc && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`Configure ${svc.name}`}>
          <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-md" onClick={closeConfigure} />
          <motion.div initial={{ y: 60, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 40, scale: 0.97, opacity: 0 }} transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-lift sm:rounded-3xl">
            <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 to-navy-700 p-6 text-white">
              <motion.div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-400/20 blur-2xl" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 6, repeat: Infinity }} />
              <div className="relative flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-teal-300 ring-1 ring-white/10"><Icon name={svc.icon} className="h-6 w-6" /></div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-widest text-teal-300">{svc.categoryName}</div>
                  <h2 className="text-xl font-bold tracking-tight">{svc.name}</h2>
                  <p className="mt-1 text-sm text-slate-300">{svc.description}</p>
                </div>
                <button onClick={closeConfigure} aria-label="Close" className="rounded-full p-1.5 transition hover:bg-white/10"><X /></button>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {svc.model.questions.map((q, i) => (
                <motion.div key={q.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.03, duration: 0.3 }}>
                  <label className="mb-2 block text-sm font-semibold text-navy-800">{q.label}</label>
                  {q.type === 'number' && (
                    <div className="flex items-center gap-2">
                      <motion.button whileTap={{ scale: 0.88 }} type="button" aria-label="Decrease" className="grid h-10 w-10 place-items-center rounded-xl border border-navy-100 transition hover:border-teal-400 hover:text-teal-700" onClick={() => set(q.key, Math.max(q.min ?? 0, (Number(values[q.key]) || 0) - 1))}><Minus className="h-4 w-4" /></motion.button>
                      <input type="number" inputMode="numeric" className="input !w-28 text-center font-semibold" value={values[q.key] ?? ''} min={q.min ?? undefined} max={q.max ?? undefined} onChange={(e) => set(q.key, e.target.value === '' ? '' : Number(e.target.value))} />
                      <motion.button whileTap={{ scale: 0.88 }} type="button" aria-label="Increase" className="grid h-10 w-10 place-items-center rounded-xl border border-navy-100 transition hover:border-teal-400 hover:text-teal-700" onClick={() => set(q.key, Math.min(q.max ?? Infinity, (Number(values[q.key]) || 0) + 1))}><Plus className="h-4 w-4" /></motion.button>
                    </div>
                  )}
                  {q.type === 'select' && (q.options!.length <= 4 ? (
                    <div className="inline-flex flex-wrap gap-1 rounded-2xl bg-navy-50 p-1">
                      {q.options!.map((o) => (
                        <button type="button" key={o} onClick={() => set(q.key, o)} aria-pressed={values[q.key] === o} className="relative rounded-xl px-4 py-2 text-sm font-medium">
                          {values[q.key] === o && <motion.span layoutId={`seg-${q.key}`} transition={spring} className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-navy-100" />}
                          <span className={`relative ${values[q.key] === o ? 'text-teal-700' : 'text-slate-500'}`}>{o}</span>
                        </button>
                      ))}
                    </div>
                  ) : <select className="input" value={values[q.key] ?? ''} onChange={(e) => set(q.key, e.target.value)}>{q.options!.map((o) => <option key={o}>{o}</option>)}</select>)}
                  {q.type === 'boolean' && (
                    <button type="button" role="switch" aria-checked={!!values[q.key]} onClick={() => set(q.key, !values[q.key])} className="flex items-center gap-3">
                      <span className={`flex h-7 w-12 items-center rounded-full p-0.5 transition-colors duration-200 ${values[q.key] ? 'justify-end bg-teal-600' : 'justify-start bg-navy-200'}`}>
                        <motion.span layout transition={spring} className="h-6 w-6 rounded-full bg-white shadow" />
                      </span>
                      <span className="text-sm font-medium text-slate-600">{values[q.key] ? 'Yes' : 'No'}</span>
                    </button>
                  )}
                  {q.help && <p className="mt-1.5 text-xs text-slate-500">{q.help}</p>}
                </motion.div>
              ))}
              {svc.deliverables.length > 0 && (
                <div className="rounded-2xl bg-gradient-to-br from-teal-50/70 to-navy-50 p-4 ring-1 ring-teal-100/60">
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">What you get</div>
                  <ul className="space-y-1.5 text-sm text-slate-700">{svc.deliverables.map((d) => <li key={d} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />{d}</li>)}</ul>
                </div>
              )}
              <AnimatePresence>{errors.length > 0 && <motion.div role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.map((e) => <div key={e}>{e}</div>)}</motion.div>}</AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-navy-100/70 bg-white p-4">
              <p className="hidden text-xs text-slate-500 sm:block">Effort and cost are calculated in your cart.</p>
              <div className="ml-auto flex gap-2">
                <button className="btn-ghost" onClick={closeConfigure}>Cancel</button>
                <motion.button whileTap={{ scale: 0.96 }} className="btn-primary" onClick={submit}>{editing ? 'Update cart' : 'Add to Cart'}</motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
