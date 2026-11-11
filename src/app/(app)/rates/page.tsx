'use client';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useStore } from '@/lib/store';
import { fadeUp, stagger } from '@/components/motion';

/** Rates, complexity multipliers and delivery targets. Stored in this browser; the cart recalculates live. */
export default function Rates() {
  const { roles, setRoles, profiles, setProfiles, types, setTypes, resetRates, notify, ready } = useStore();
  if (!ready) return null;
  const Num = ({ v, on, w = 'w-24' }: { v: number; on: (n: number) => void; w?: string }) => <input type="number" step="any" min={0} className={`input !py-1.5 ${w}`} value={v} onChange={(e) => on(Math.max(0, Number(e.target.value)))} />;
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto max-w-4xl space-y-6">
      <motion.div variants={fadeUp} className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-3xl font-extrabold tracking-tight">Rates &amp; targets</h1><p className="text-slate-500">Every estimate in the cart uses these values. Changes apply instantly and are saved in this browser.</p></div>
        <button className="btn-ghost" onClick={() => { resetRates(); notify('Defaults restored'); }}><RotateCcw className="h-4 w-4" />Reset to defaults</button>
      </motion.div>
      <motion.section variants={fadeUp} className="card p-6"><h2 className="mb-4 font-bold">Roles &amp; hourly rates</h2>
        <table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="pb-2">Role</th><th>Rate / hour</th><th>Resources (FTE)</th><th>Productive h/day</th></tr></thead>
          <tbody>{roles.map((r, i) => <tr key={r.key} className="border-t border-navy-50"><td className="py-2 font-medium">{r.name}</td>
            <td><Num v={r.hourly_rate} on={(n) => setRoles(roles.map((x, j) => (j === i ? { ...x, hourly_rate: n } : x)))} /></td>
            <td><Num v={r.fte} on={(n) => setRoles(roles.map((x, j) => (j === i ? { ...x, fte: n || 1 } : x)))} /></td>
            <td><Num v={r.productive_hours_per_day} on={(n) => setRoles(roles.map((x, j) => (j === i ? { ...x, productive_hours_per_day: n || 1 } : x)))} /></td></tr>)}</tbody></table>
      </motion.section>
      <motion.section variants={fadeUp} className="card p-6"><h2 className="mb-1 font-bold">Complexity multipliers</h2><p className="mb-4 text-xs text-slate-500">Services without a complexity question derive their level from raw effort using the threshold.</p>
        <table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="pb-2">Level</th><th>Multiplier</th><th>Auto threshold (raw hours ≥)</th></tr></thead>
          <tbody>{profiles.map((r, i) => <tr key={r.key} className="border-t border-navy-50"><td className="py-2 font-medium">{r.label}</td>
            <td><Num v={r.multiplier} on={(n) => setProfiles(profiles.map((x, j) => (j === i ? { ...x, multiplier: n || 1 } : x)))} /></td>
            <td><Num v={r.auto_threshold} on={(n) => setProfiles(profiles.map((x, j) => (j === i ? { ...x, auto_threshold: n } : x)))} /></td></tr>)}</tbody></table>
      </motion.section>
      <motion.section variants={fadeUp} className="card p-6"><h2 className="mb-4 font-bold">Delivery targets</h2>
        <table className="w-full text-sm"><thead><tr className="text-left text-xs uppercase text-slate-500"><th className="pb-2">Customer type</th><th>Min weeks</th><th>Max weeks</th></tr></thead>
          <tbody>{types.map((r, i) => <tr key={r.key} className="border-t border-navy-50"><td className="py-2 font-medium">{r.name}</td>
            <td><Num v={r.min} on={(n) => setTypes(types.map((x, j) => (j === i ? { ...x, min: n } : x)))} /></td>
            <td><Num v={r.max} on={(n) => setTypes(types.map((x, j) => (j === i ? { ...x, max: Math.max(n, x.min) } : x)))} /></td></tr>)}</tbody></table>
      </motion.section>
    </motion.div>
  );
}
