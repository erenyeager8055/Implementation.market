'use client';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronDown, Clock, Pencil, ShoppingBag, Trash2, Users2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { byKey } from '@/lib/data';
import { Icon } from '@/components/Icon';
import { AnimatedNumber, fadeUp, spring, stagger } from '@/components/motion';

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const h1 = (n: number) => `${(Math.round(n * 10) / 10).toLocaleString('en-US')}`;

export default function CartPage() {
  const { pricing: p, types, type, setType, remove, clear, openConfigure, ready } = useStore();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  if (!ready) return null;

  if (!p.items.length) return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card mx-auto mt-10 max-w-lg p-12 text-center">
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 text-teal-600"><ShoppingBag className="h-8 w-8" /></motion.div>
      <h1 className="mt-4 text-xl font-bold">Your cart is empty</h1>
      <p className="mt-1 text-slate-500">Add implementation services to build an estimate.</p>
      <Link href="/" className="btn-primary mt-6">Browse services</Link>
    </motion.div>
  );

  const maxRole = Math.max(...p.roles.map((r) => r.hours));
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
      <motion.section variants={stagger} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-3">
          <div><h1 className="text-3xl font-extrabold tracking-tight">My Cart</h1><p className="text-slate-500">{p.items.length} service{p.items.length > 1 ? 's' : ''} selected</p></div>
          <button onClick={() => confirm('Remove all services?') && clear()} className="text-sm text-slate-500 transition hover:text-red-600">Clear cart</button>
        </motion.div>

        <motion.div variants={fadeUp} className="card p-4">
          <div className="label">Project type</div>
          <div className="relative grid gap-1 rounded-2xl bg-navy-50 p-1 sm:grid-cols-2">
            {types.map((t) => (
              <button key={t.key} onClick={() => setType(t.key)} aria-pressed={type === t.key} className="relative rounded-xl p-3 text-left">
                {type === t.key && <motion.span layoutId="type-pill" transition={spring} className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-teal-200" />}
                <span className="relative block font-semibold">{t.name}</span>
                <span className="relative block text-xs text-slate-500">Target delivery {t.min}–{t.max} weeks</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {p.delivery.warning && (
            <motion.div key="warn" role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                <div><div className="font-semibold">Delivery warning: internal review required</div>{p.delivery.warning}</div>
              </div>
            </motion.div>
          )}
          {p.missingDependencies.length > 0 && (
            <motion.div key="deps" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                <div className="font-semibold">Recommended predecessors not in your cart</div>
                <ul className="mt-1 list-disc pl-5">{p.missingDependencies.map((m, i) => <li key={i}>{m.service} works best with <b>{m.requires}</b>.</li>)}</ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {p.items.map((it) => {
            const svc = byKey(it.serviceKey)!; const isOpen = open[it.serviceKey];
            return (
              <motion.article key={it.serviceKey} layout variants={fadeUp} exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }} transition={spring} className="card overflow-hidden">
                <div className="flex flex-wrap items-center gap-4 p-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600"><Icon name={svc.icon} className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold tracking-tight">{it.name}</h3>
                    <div className="text-xs text-slate-500">{svc.categoryName} · Complexity <b>{it.estimate.complexity}</b></div>
                  </div>
                  <div className="flex gap-6 text-right text-sm">
                    <Stat k="Man-hours" v={`${h1(it.hours)} h`} /><Stat k="Working days" v={`${h1(it.effortDays)} d`} /><Stat k="Cost" v={usd(it.cost)} teal />
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="btn-ghost !px-3 !py-1.5" onClick={() => openConfigure(svc)}><Pencil className="h-3.5 w-3.5" />Edit</button>
                    <button className="btn-danger !px-3 !py-1.5" onClick={() => remove(it.serviceKey)} aria-label={`Remove ${it.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
                    <button className="rounded-full p-2 transition hover:bg-navy-50" onClick={() => setOpen((o) => ({ ...o, [it.serviceKey]: !o[it.serviceKey] }))} aria-expanded={!!isOpen} aria-label="Toggle calculation details">
                      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="block"><ChevronDown className="h-5 w-5" /></motion.span>
                    </button>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <div className="grid gap-6 border-t border-navy-100/70 bg-navy-50/50 p-5 text-sm md:grid-cols-2">
                        <div>
                          <div className="label">Effort calculation</div>
                          <table className="w-full"><tbody>
                            {it.estimate.lines.map((l, i) => <tr key={i} className="border-b border-navy-100/60"><td className="py-1.5 pr-2">{l.label}{l.custom && <span className="ml-1 text-xs text-amber-700">(custom)</span>}</td><td className="py-1.5 text-right tabular-nums">{h1(l.hours)} h</td></tr>)}
                            <tr><td className="pt-2 text-slate-500">Complexity multiplier ({it.estimate.complexity})</td><td className="pt-2 text-right tabular-nums">× {it.estimate.multiplier}</td></tr>
                            {it.estimate.minimumApplied && <tr><td className="text-slate-500">Minimum effort applied</td><td /></tr>}
                            <tr className="font-semibold"><td className="pt-2">Standard {h1(it.standardHours)} h + custom {h1(it.customHours)} h</td><td className="pt-2 text-right">{h1(it.hours)} h</td></tr>
                          </tbody></table>
                        </div>
                        <div>
                          <div className="label">Configuration</div>
                          <dl>{Object.entries(it.config).map(([k, v]) => <div key={k} className="flex justify-between gap-3 border-b border-navy-100/60 py-1.5"><dt className="capitalize text-slate-500">{k.replace(/_/g, ' ')}</dt><dd className="font-medium">{v === true ? 'Yes' : v === false ? 'No' : String(v)}</dd></div>)}</dl>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.section>

      <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, ...spring }} className="xl:sticky xl:top-[92px] xl:self-start">
        <div className="card space-y-5 p-6">
          <h2 className="text-lg font-bold tracking-tight">Implementation estimate</h2>
          <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 p-5 text-white">
            <div className="text-xs font-semibold uppercase tracking-widest text-teal-300">Total implementation cost</div>
            <div className="mt-1 text-4xl font-extrabold tracking-tight">$<AnimatedNumber value={p.totals.cost} /></div>
            <div className="mt-1 text-xs text-slate-300">Excludes product licensing and subscriptions</div>
          </div>
          <dl className="space-y-2.5 text-sm">
            <Row k="Selected services" v={<AnimatedNumber value={p.totals.services} />} />
            <Row k="Total implementation hours" v={<><AnimatedNumber value={p.totals.hours} format={h1} /> h</>} />
            <Row k="Effort (person-days)" v={<><AnimatedNumber value={p.totals.effortDays} format={h1} /> d</>} />
            <Row k="Estimated delivery" v={`${p.delivery.workingDays} working days (${p.delivery.weeks} wks)`} />
            <Row k={`Target (${p.delivery.customerType})`} v={`${p.delivery.targetMinWeeks}–${p.delivery.targetMaxWeeks} wks`} />
          </dl>
          <motion.div layout className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${p.delivery.exceedsTarget ? 'bg-amber-50 text-amber-800' : 'bg-teal-50 text-teal-800'}`}>
            {p.delivery.exceedsTarget ? <Clock className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{p.delivery.exceedsTarget ? 'Exceeds target window' : 'Within target window'}
          </motion.div>
          <div>
            <div className="label flex items-center gap-1"><Users2 className="h-3.5 w-3.5" />Resource breakdown</div>
            <div className="space-y-2.5">
              {p.roles.map((r) => (
                <div key={r.key}>
                  <div className="flex justify-between text-sm"><span>{r.name}</span><span className="tabular-nums text-slate-500">{h1(r.hours)} h · {usd(r.cost)}</span></div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-navy-50"><motion.div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600" initial={{ width: 0 }} animate={{ width: `${(r.hours / maxRole) * 100}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} /></div>
                </div>
              ))}
            </div>
          </div>
          <dl className="space-y-2 border-t border-navy-100/70 pt-4 text-sm">
            <Row k="Implementation service cost" v={usd(p.totals.standardCost)} />
            <Row k="Additional / custom effort cost" v={usd(p.totals.customCost)} />
          </dl>
          <Link href="/summary" className="btn-primary w-full">Generate implementation summary</Link>
        </div>
      </motion.aside>
    </div>
  );
}
const Stat = ({ k, v, teal }: { k: string; v: string; teal?: boolean }) => <div><div className="text-xs text-slate-400">{k}</div><div className={`font-bold tabular-nums ${teal ? 'text-teal-700' : ''}`}>{v}</div></div>;
const Row = ({ k, v }: { k: string; v: React.ReactNode }) => <div className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="text-right font-semibold tabular-nums">{v}</dd></div>;
