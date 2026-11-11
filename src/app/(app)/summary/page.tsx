'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Printer } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ASSUMPTIONS, EXCLUSIONS, byKey, CATALOG } from '@/lib/data';
import { fadeUp, Reveal, stagger } from '@/components/motion';

const usd = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const h1 = (n: number) => `${Math.round(n * 10) / 10}`;
const show = (v: any) => (v === true ? 'Yes' : v === false ? 'No' : String(v));

export default function Summary() {
  const { pricing: p, customer, setCustomer, type, types, ready } = useStore();
  if (!ready) return null;
  if (!p.items.length) return (
    <div className="card mx-auto mt-10 max-w-lg p-12 text-center"><h1 className="text-xl font-bold">Nothing to summarise yet</h1><p className="mt-1 text-slate-500">Add services to your cart first.</p><Link href="/" className="btn-primary mt-6">Browse services</Link></div>
  );
  const ct = types.find((t) => t.key === type)!;
  const views = p.items.map((i) => byKey(i.serviceKey)!);
  const products = [...new Set(views.map((v) => (v.product === 'surveysparrow' ? 'SurveySparrow' : 'ThriveSparrow')))];
  const modules = [...new Set(views.map((v) => v.module).filter(Boolean))] as string[];
  const deps = [...p.items.flatMap((i) => byKey(i.serviceKey)!.model.dependsOn.map((d) => `${i.name} depends on ${CATALOG[d - 1].name}${p.items.some((x) => x.serviceId === d) ? '' : ' (not included in this scope)'}.`)), 'Client sign-off on requirements and timely provision of access, data and stakeholders.'];
  const manual = p.items.flatMap((i) => [...i.manualFlags.map((f) => `${f} (requires manual estimation)`), ...(byKey(i.serviceKey)!.manualNote ? [byKey(i.serviceKey)!.manualNote!] : [])].map((r) => ({ s: i.name, r })));
  const total = Math.max(p.delivery.workingDays, 1);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card no-print grid gap-4 p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <div><label className="label" htmlFor="n">Customer name</label><input id="n" className="input" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Jane Doe" /></div>
        <div><label className="label" htmlFor="co">Company</label><input id="co" className="input" value={customer.company} onChange={(e) => setCustomer({ ...customer, company: e.target.value })} placeholder="Acme Corp" /></div>
        <div><label className="label" htmlFor="em">Email</label><input id="em" type="email" className="input" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} placeholder="jane@acme.com" /></div>
        <motion.button whileTap={{ scale: 0.96 }} className="btn-primary" onClick={() => window.print()}><Printer className="h-4 w-4" />Export PDF</motion.button>
        <p className="text-xs text-slate-500 md:col-span-4">“Export PDF” opens your browser’s print dialog. Choose <b>Save as PDF</b>.</p>
      </motion.div>

      {p.delivery.requiresReview && <div role="alert" className="no-print flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="h-5 w-5 shrink-0" /><div><b>Internal review required.</b> {p.delivery.warning}</div></div>}

      <motion.article variants={stagger} initial="hidden" animate="show" className="card print-doc space-y-9 p-6 sm:p-12">
        <motion.header variants={fadeUp} className="border-b border-navy-100 pb-7">
          <div className="text-xs font-bold uppercase tracking-[.2em] text-teal-600">Implementation Scope of Work &amp; Estimate</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{products.join(' · ')}</h1>
          <p className="mt-2 text-sm text-slate-600">Prepared for <b>{customer.company || customer.name || 'Customer'}</b> · {ct.name} customer · {new Date().toDateString()}</p>
        </motion.header>

        <Sec n="1" t="Scope summary"><dl className="grid gap-x-10 gap-y-2 text-sm sm:grid-cols-2">
          <KV k="Product" v={products.join(', ')} />{modules.length > 0 && <KV k="Modules" v={modules.join(', ')} />}
          <KV k="Selected services" v={String(p.totals.services)} /><KV k="Customer type" v={`${ct.name} (${ct.min}–${ct.max} weeks)`} /></dl></Sec>

        <Sec n="2" t="Implementation services, configuration & deliverables"><div className="space-y-4">
          {p.items.map((i, ix) => { const v = views[ix]; return (
            <Reveal key={i.serviceKey}><div className="rounded-2xl border border-navy-100 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-bold">{i.name}</h3><span className="chip">{i.estimate.complexity}</span></div>
              <div className="text-xs text-slate-500">{v.categoryName}</div>
              <div className="mt-3 grid gap-5 text-sm md:grid-cols-2">
                <div><div className="mb-1 font-semibold">Deliverables</div><ul className="list-disc space-y-0.5 pl-5 text-slate-700">{v.deliverables.map((d) => <li key={d}>{d}</li>)}</ul></div>
                <div><div className="mb-1 font-semibold">Configuration</div><dl className="space-y-0.5">{v.model.questions.map((q) => <div key={q.key} className="flex justify-between gap-3"><dt className="text-slate-500">{q.label}</dt><dd className="font-medium">{show(i.config[q.key])}</dd></div>)}</dl></div>
              </div></div></Reveal>); })}
        </div></Sec>

        <Sec n="3" t="Effort estimate">
          <table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-500"><th className="py-2">Service</th><th className="text-right">Hours</th><th className="text-right">Days</th><th className="text-right">Cost</th></tr></thead>
            <tbody>{p.items.map((i) => <tr key={i.serviceKey} className="border-b border-navy-50"><td className="py-2">{i.name}</td><td className="text-right tabular-nums">{h1(i.hours)}</td><td className="text-right tabular-nums">{h1(i.effortDays)}</td><td className="text-right tabular-nums">{usd(i.cost)}</td></tr>)}
              <tr className="font-bold"><td className="py-2">Total</td><td className="text-right">{h1(p.totals.hours)}</td><td className="text-right">{h1(p.totals.effortDays)}</td><td className="text-right text-teal-700">{usd(p.totals.cost)}</td></tr></tbody></table>
          <h4 className="mb-1 mt-5 text-sm font-semibold">Resource breakdown</h4>
          <table className="w-full text-sm"><tbody>{p.roles.map((r) => <tr key={r.key} className="border-b border-navy-50"><td className="py-1.5">{r.name}</td><td className="text-right tabular-nums">{h1(r.hours)} h</td><td className="text-right tabular-nums">{usd(r.cost)}</td></tr>)}</tbody></table>
        </Sec>

        <Sec n="4" t="Delivery timeline">
          <p className="text-sm text-slate-700">Estimated delivery is <b>{p.delivery.workingDays} working days ({p.delivery.weeks} weeks)</b>, derived from resource availability, dependencies and parallel execution. Target window for {p.delivery.customerType} customers: {ct.min}–{ct.max} weeks.</p>
          <div className="mt-4 space-y-2">{p.items.map((i, ix) => (
            <div key={i.serviceKey} className="flex items-center gap-3 text-xs"><div className="w-44 shrink-0 truncate text-slate-600">{i.name}</div>
              <div className="relative h-3 flex-1 rounded-full bg-navy-50"><motion.div className="absolute h-3 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" initial={{ width: 0 }} animate={{ width: `${Math.max(((i.endDay - i.startDay) / total) * 100, 1.5)}%` }} transition={{ delay: 0.4 + ix * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ left: `${(i.startDay / total) * 100}%` }} /></div></div>))}</div>
        </Sec>

        <Sec n="5" t="Implementation cost"><dl className="max-w-md space-y-1.5 text-sm"><KV k="Implementation services" v={usd(p.totals.standardCost)} /><KV k="Additional / custom effort" v={usd(p.totals.customCost)} />
          <div className="flex justify-between border-t pt-2 text-base font-bold"><dt>Total implementation cost</dt><dd className="text-teal-700">{usd(p.totals.cost)}</dd></div></dl>
          <p className="mt-2 text-xs text-slate-500">Product licensing and subscription costs are not included.</p></Sec>

        <List n="6" t="Assumptions" a={ASSUMPTIONS} /><List n="7" t="Dependencies" a={deps} /><List n="8" t="Exclusions" a={EXCLUSIONS} />
        <Sec n="9" t="Scope requiring manual estimation">{manual.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{manual.map((m, i) => <li key={i}><b>{m.s}:</b> {m.r}</li>)}</ul> : <p className="text-sm text-slate-500">None identified from the configuration provided.</p>}</Sec>
      </motion.article>
    </div>
  );
}
const Sec = ({ n, t, children }: { n: string; t: string; children: React.ReactNode }) => <motion.section variants={fadeUp}><h2 className="mb-3 border-b-2 border-teal-500/25 pb-1.5 text-lg font-bold tracking-tight">{n}. {t}</h2>{children}</motion.section>;
const KV = ({ k, v }: { k: string; v: string }) => <div className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>;
const List = ({ n, t, a }: { n: string; t: string; a: string[] }) => <Sec n={n} t={t}><ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{a.map((x) => <li key={x}>{x}</li>)}</ul></Sec>;
