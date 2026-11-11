// Estimation engine. Pure functions: every number comes from rule/role/profile rows
// (loaded from the database); nothing here is a price or an hours constant.

export type QuestionType = 'number' | 'select' | 'boolean';
export interface Question {
  key: string; label: string; type: QuestionType; options?: string[] | null;
  min?: number | null; max?: number | null; default?: any; help?: string | null; manual_when?: string | null;
}
export type RuleType = 'minimum' | 'base' | 'per_unit' | 'product' | 'band' | 'option' | 'flag';
export interface Rule {
  id: number; rule_type: RuleType; question_key: string | null; label: string; hours: number;
  params: any; is_custom: boolean; active: boolean;
}
export interface Profile { key: string; label: string; multiplier: number; auto_threshold: number }
export interface Allocation { role_key: string; percentage: number }
export interface Role { key: string; name: string; hourly_rate: number; fte: number; productive_hours_per_day: number }
export interface ServiceModel {
  id: number; key: string; name: string; phase: number; complexity_question: string | null; manual_note: string | null;
  questions: Question[]; rules: Rule[]; allocations: Allocation[]; dependsOn: number[];
}
export interface BreakdownLine { label: string; hours: number; custom: boolean }
export interface ServiceEstimate {
  baseHours: number; multiplier: number; complexity: string; complexityKey: string;
  standardHours: number; customHours: number; hours: number; minimumApplied: boolean;
  lines: BreakdownLine[]; manualFlags: string[];
}

export const round1 = (n: number) => Math.round(n * 10) / 10;
const roundHalf = (n: number) => Math.round(n * 2) / 2;

/** Validate and normalise user-supplied configuration against the question schema. Server-side authority. */
export function validateConfig(questions: Question[], input: Record<string, any>) {
  const errors: string[] = [];
  const config: Record<string, any> = {};
  for (const q of questions) {
    let v = input?.[q.key];
    if (v === undefined || v === null || v === '') v = q.default ?? (q.type === 'boolean' ? false : q.type === 'number' ? 0 : q.options?.[0]);
    if (q.type === 'number') {
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n)) { errors.push(`${q.label}: must be a number`); continue; }
      if (q.min != null && n < q.min) { errors.push(`${q.label}: minimum is ${q.min}`); continue; }
      if (q.max != null && n > q.max) { errors.push(`${q.label}: maximum is ${q.max}`); continue; }
      config[q.key] = n;
    } else if (q.type === 'boolean') {
      config[q.key] = v === true || v === 'true' || v === 1 || v === 'yes';
    } else {
      if (!q.options?.includes(String(v))) { errors.push(`${q.label}: invalid option`); continue; }
      config[q.key] = String(v);
    }
  }
  return { config, errors };
}

const num = (config: Record<string, any>, k?: string | null) => (k ? Number(config[k]) || 0 : 0);

export function estimateService(svc: ServiceModel, config: Record<string, any>, profiles: Profile[]): ServiceEstimate {
  const lines: BreakdownLine[] = [];
  let pre = 0, post = 0, base = 0, minimum = 0;
  for (const r of svc.rules) {
    if (!r.active) continue;
    let h = 0, label = r.label;
    switch (r.rule_type) {
      case 'minimum': minimum = Math.max(minimum, r.hours); continue;
      case 'base': h = r.hours; base += h; break;
      case 'per_unit': h = Math.max(0, num(config, r.question_key) - (r.params?.free ?? 0)) * r.hours; break;
      case 'product': {
        const keys: string[] = r.params?.keys ?? [];
        h = keys.reduce((a, k) => a * Math.max(0, num(config, k) - (r.params?.subtract?.[k] ?? 0)), 1) * r.hours;
        break;
      }
      case 'band': {
        const v = num(config, r.question_key);
        const bands: { upTo: number | null; hours: number }[] = r.params?.bands ?? [];
        const b = bands.find((x) => x.upTo == null || v <= x.upTo);
        h = v > 0 && b ? b.hours : 0;
        break;
      }
      case 'option': h = Number(r.params?.map?.[String(config[r.question_key ?? ''])] ?? 0); break;
      case 'flag': h = config[r.question_key ?? ''] === true ? r.hours : 0; break;
    }
    h = round1(h);
    if (h <= 0) continue;
    lines.push({ label, hours: h, custom: r.is_custom });
    if (r.is_custom) post += h; else pre += h;
  }

  // Complexity: explicit question answer if it maps to a profile, else derived from raw effort.
  const sorted = [...profiles].sort((a, b) => a.auto_threshold - b.auto_threshold);
  let prof: Profile | undefined;
  if (svc.complexity_question) {
    const ans = String(config[svc.complexity_question] ?? '').toLowerCase();
    prof = profiles.find((p) => p.key.toLowerCase() === ans || p.label.toLowerCase() === ans);
  }
  if (!prof) prof = [...sorted].reverse().find((p) => pre >= p.auto_threshold) ?? sorted[0];

  const standard = pre * prof.multiplier;
  let total = standard + post;
  const minimumApplied = total < minimum;
  if (minimumApplied) total = minimum;
  const manualFlags: string[] = [];
  for (const q of svc.questions) {
    if (q.manual_when == null) continue;
    const a = config[q.key];
    if (String(a) === q.manual_when) manualFlags.push(q.label);
  }
  return {
    baseHours: round1(base), multiplier: prof.multiplier, complexity: prof.label, complexityKey: prof.key,
    standardHours: round1(minimumApplied ? total - post : standard), customHours: round1(post), hours: roundHalf(total),
    minimumApplied, lines, manualFlags,
  };
}

// ---------------------------------------------------------------------------------------------

export interface CartItemInput {
  id: number; service: ServiceModel; config: Record<string, any>; overrideHours: number | null;
  overrideReason?: string | null; additionalCharge: number; additionalChargeNote?: string | null;
}
export interface PricedItem {
  id: number; serviceId: number; serviceKey: string; name: string; config: Record<string, any>;
  estimate: ServiceEstimate; computedHours: number; hours: number; standardHours: number; customHours: number;
  effortDays: number; overridden: boolean; overrideReason?: string | null;
  roleHours: Record<string, number>; standardCost: number; customCost: number; additionalCharge: number;
  additionalChargeNote?: string | null; cost: number; startDay: number; endDay: number; manualFlags: string[];
}
export interface CartPricing {
  items: PricedItem[];
  totals: {
    services: number; hours: number; standardHours: number; customHours: number; effortDays: number;
    standardCost: number; customCost: number; additionalCharges: number; cost: number;
  };
  roles: { key: string; name: string; hours: number; rate: number; cost: number; days: number }[];
  delivery: {
    workingDays: number; weeks: number; targetMinWeeks: number; targetMaxWeeks: number; customerType: string;
    exceedsTarget: boolean; requiresReview: boolean; warning: string | null;
  };
  missingDependencies: { service: string; requires: string }[];
  manualScope: { service: string; reasons: string[] }[];
}
export interface PricingContext {
  roles: Role[]; profiles: Profile[]; hoursPerDay: number;
  customerType: { name: string; target_min_weeks: number; target_max_weeks: number };
  serviceNames: Record<number, string>;
}

export function priceCart(inputs: CartItemInput[], ctx: PricingContext): CartPricing {
  const roleByKey = new Map(ctx.roles.map((r) => [r.key, r]));
  const items: PricedItem[] = inputs.map((it) => {
    const est = estimateService(it.service, it.config, ctx.profiles);
    const overridden = it.overrideHours != null;
    const hours = overridden ? it.overrideHours! : est.hours;
    const scale = est.hours > 0 ? hours / est.hours : 0;
    const customHours = overridden ? round1(est.customHours * scale) : est.customHours;
    const standardHours = round1(hours - customHours);
    const roleHours: Record<string, number> = {};
    let blended = 0;
    for (const a of it.service.allocations) {
      const rh = (hours * a.percentage) / 100;
      roleHours[a.role_key] = rh;
      blended += (a.percentage / 100) * (roleByKey.get(a.role_key)?.hourly_rate ?? 0);
    }
    const standardCost = standardHours * blended;
    const customCost = customHours * blended;
    return {
      id: it.id, serviceId: it.service.id, serviceKey: it.service.key, name: it.service.name, config: it.config,
      estimate: est, computedHours: est.hours, hours, standardHours, customHours,
      effortDays: round1(hours / ctx.hoursPerDay), overridden, overrideReason: it.overrideReason,
      roleHours, standardCost: Math.round(standardCost), customCost: Math.round(customCost),
      additionalCharge: it.additionalCharge, additionalChargeNote: it.additionalChargeNote,
      cost: Math.round(standardCost + customCost + it.additionalCharge), startDay: 0, endDay: 0, manualFlags: est.manualFlags,
    };
  });

  // ---- scheduling: resource-constrained, dependency-aware, parallel where capacity allows
  const days = schedule(items, inputs, ctx);

  const roleTotals = new Map<string, number>();
  for (const it of items) for (const [k, h] of Object.entries(it.roleHours)) roleTotals.set(k, (roleTotals.get(k) ?? 0) + h);
  const roles = ctx.roles
    .filter((r) => roleTotals.has(r.key))
    .map((r) => {
      const hours = round1(roleTotals.get(r.key)!);
      return { key: r.key, name: r.name, hours, rate: r.hourly_rate, cost: Math.round(hours * r.hourly_rate),
        days: round1(hours / (r.fte * r.productive_hours_per_day)) };
    });

  const sum = (f: (i: PricedItem) => number) => items.reduce((a, i) => a + f(i), 0);
  const totals = {
    services: items.length, hours: round1(sum((i) => i.hours)), standardHours: round1(sum((i) => i.standardHours)),
    customHours: round1(sum((i) => i.customHours)), effortDays: round1(sum((i) => i.hours) / ctx.hoursPerDay),
    standardCost: sum((i) => i.standardCost), customCost: sum((i) => i.customCost),
    additionalCharges: sum((i) => i.additionalCharge), cost: sum((i) => i.cost),
  };
  const weeks = round1(days / 5);
  const exceeds = items.length > 0 && weeks > ctx.customerType.target_max_weeks;
  const selected = new Set(inputs.map((i) => i.service.id));
  const missingDependencies: CartPricing['missingDependencies'] = [];
  for (const it of inputs) for (const d of it.service.dependsOn) if (!selected.has(d))
    missingDependencies.push({ service: it.service.name, requires: ctx.serviceNames[d] ?? String(d) });

  return {
    items, totals, roles,
    delivery: {
      workingDays: days, weeks, targetMinWeeks: ctx.customerType.target_min_weeks,
      targetMaxWeeks: ctx.customerType.target_max_weeks, customerType: ctx.customerType.name,
      exceedsTarget: exceeds, requiresReview: exceeds,
      warning: exceeds
        ? `Estimated delivery of ${weeks} weeks exceeds the ${ctx.customerType.name} target of ${ctx.customerType.target_min_weeks}–${ctx.customerType.target_max_weeks} weeks. Internal review is required before this estimate is shared. Effort has not been adjusted to fit the window.`
        : null,
    },
    missingDependencies,
    manualScope: items.filter((i) => i.manualFlags.length || i.estimate.manualFlags.length)
      .map((i) => ({ service: i.name, reasons: i.manualFlags })),
  };
}

/** List-scheduling over per-role daily capacity. Returns total elapsed working days. */
function schedule(items: PricedItem[], inputs: CartItemInput[], ctx: PricingContext): number {
  if (!items.length) return 0;
  const cap = new Map(ctx.roles.map((r) => [r.key, r]));
  const used = new Map<string, number[]>();
  const byService = new Map<number, number>(); // service id -> index
  inputs.forEach((i, ix) => byService.set(i.service.id, ix));
  const maxPhase = Math.max(...inputs.map((i) => i.service.phase));
  const order = inputs.map((_, i) => i).sort((a, b) => inputs[a].service.phase - inputs[b].service.phase || a - b);
  const finish: number[] = new Array(inputs.length).fill(0);
  const start: number[] = new Array(inputs.length).fill(0);
  const done = new Set<number>();
  // iterate until all scheduled (explicit dependencies may pull a task behind its phase order)
  let guard = 0;
  while (done.size < order.length && guard++ < order.length * order.length + 5) {
    for (const ix of order) {
      if (done.has(ix)) continue;
      const svc = inputs[ix].service;
      const deps = svc.dependsOn.map((d) => byService.get(d)).filter((d): d is number => d != null);
      if (!deps.every((d) => done.has(d))) continue;
      // later-phase work (deployment) follows everything in earlier phases
      let earliest = 0;
      for (const d of deps) earliest = Math.max(earliest, finish[d]);
      if (svc.phase === maxPhase && maxPhase > 1) {
        inputs.forEach((o, oi) => { if (o.service.phase < svc.phase && done.has(oi)) earliest = Math.max(earliest, finish[oi]); });
        if (!inputs.every((o, oi) => o.service.phase >= svc.phase || done.has(oi))) continue;
      }
      let end = earliest;
      for (const [rk, h] of Object.entries(items[ix].roleHours)) {
        const role = cap.get(rk);
        if (!role || h <= 0) continue;
        const perDay = role.productive_hours_per_day; // one person works one task at a time
        const dayCap = role.fte * role.productive_hours_per_day;
        const u = used.get(rk) ?? [];
        let remaining = h, day = earliest;
        while (remaining > 1e-9) {
          const free = Math.min(perDay, dayCap - (u[day] ?? 0));
          if (free > 1e-9) {
            const take = Math.min(free, remaining);
            u[day] = (u[day] ?? 0) + take; remaining -= take;
            if (remaining <= 1e-9) { end = Math.max(end, day + 1); break; }
          }
          day++;
        }
        used.set(rk, u);
      }
      start[ix] = earliest; finish[ix] = end; done.add(ix);
    }
  }
  items.forEach((it, ix) => { it.startDay = start[ix]; it.endDay = finish[ix]; });
  return Math.max(...finish);
}
