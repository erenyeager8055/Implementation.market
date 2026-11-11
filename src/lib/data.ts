import { ALLOC, SERVICES, SS_CATEGORIES, TS_CATEGORIES, TS_MODULES } from './seed-catalog';
import type { Profile, Question, Role, Rule, ServiceModel } from './engine';

export interface ProductInfo { key: 'surveysparrow' | 'thrivesparrow'; name: string; description: string; icon: string }
export interface ServiceView {
  id: number; key: string; product: ProductInfo['key']; category: string; categoryName: string; module: string | null;
  name: string; description: string; icon: string; deliverables: string[]; manualNote: string | null; model: ServiceModel;
}
export interface CustomerType { key: string; name: string; min: number; max: number }

export const PRODUCTS: ProductInfo[] = [
  { key: 'surveysparrow', name: 'SurveySparrow', description: 'Conversational survey, CX and analytics platform.', icon: 'MessageSquareText' },
  { key: 'thrivesparrow', name: 'ThriveSparrow', description: 'Employee engagement and performance platform.', icon: 'Sprout' },
];
export const CATEGORIES: Record<ProductInfo['key'], [string, string][]> = {
  surveysparrow: SS_CATEGORIES as [string, string][], thrivesparrow: TS_CATEGORIES as [string, string][],
};

// Illustrative starter rates and capacity. Editable on the Rates page and persisted in the browser.
export const DEFAULT_ROLES: Role[] = [
  { key: 'consultant', name: 'Implementation Consultant', hourly_rate: 85, fte: 2, productive_hours_per_day: 6 },
  { key: 'architect', name: 'Solution Architect', hourly_rate: 120, fte: 1, productive_hours_per_day: 6 },
  { key: 'integration', name: 'Integration Engineer', hourly_rate: 110, fte: 1, productive_hours_per_day: 6 },
  { key: 'analyst', name: 'Data & Analytics Specialist', hourly_rate: 95, fte: 1, productive_hours_per_day: 6 },
  { key: 'qa', name: 'QA / UAT Lead', hourly_rate: 75, fte: 1, productive_hours_per_day: 6 },
  { key: 'trainer', name: 'Trainer', hourly_rate: 80, fte: 1, productive_hours_per_day: 6 },
  { key: 'pm', name: 'Project Manager', hourly_rate: 100, fte: 1, productive_hours_per_day: 6 },
];
export const DEFAULT_PROFILES: Profile[] = [
  { key: 'basic', label: 'Basic', multiplier: 1.0, auto_threshold: 0 },
  { key: 'medium', label: 'Medium', multiplier: 1.25, auto_threshold: 24 },
  { key: 'advanced', label: 'Advanced', multiplier: 1.6, auto_threshold: 60 },
];
export const DEFAULT_TYPES: CustomerType[] = [
  { key: 'regular', name: 'Regular', min: 2, max: 3 },
  { key: 'enterprise', name: 'Enterprise', min: 3, max: 4 },
];
export const HOURS_PER_DAY = 8;

const idOf = new Map(SERVICES.map((s, i) => [s.key, i + 1]));
const catName = (p: string, k: string) => CATEGORIES[p as ProductInfo['key']].find(([c]) => c === k)?.[1] ?? k;
const moduleName = (k?: string) => TS_MODULES.find(([m]) => m === k)?.[1] ?? null;

export const CATALOG: ServiceView[] = SERVICES.map((s, i) => {
  const questions: Question[] = s.q.map((q) => ({ key: q.key, label: q.label, type: q.type, options: q.options ?? null, min: q.min ?? null, max: q.max ?? null, default: q.default, help: q.help ?? null, manual_when: q.manual_when ?? null }));
  const rules: Rule[] = s.r.map((r, j) => ({ id: j + 1, rule_type: r.rule_type as Rule['rule_type'], question_key: r.question_key ?? null, label: r.label, hours: r.hours ?? 0, params: r.params ?? {}, is_custom: !!r.is_custom, active: true }));
  return {
    id: i + 1, key: s.key, product: s.product, category: s.category, categoryName: catName(s.product, s.category), module: moduleName(s.module),
    name: s.name, description: s.desc, icon: s.icon, deliverables: s.deliverables, manualNote: s.manual ?? null,
    model: {
      id: i + 1, key: s.key, name: s.name, phase: s.phase ?? (s.category === 'deployment' ? 3 : 2), complexity_question: s.complexityQ ?? null,
      manual_note: s.manual ?? null, questions, rules, dependsOn: (s.dependsOn ?? []).map((d) => idOf.get(d)!),
      allocations: Object.entries(ALLOC[s.alloc]).map(([role_key, percentage]) => ({ role_key, percentage })),
    },
  };
});
export const byKey = (k: string) => CATALOG.find((s) => s.key === k);

export const ASSUMPTIONS = [
  'Client will provide requirements, content, data and approvals in the agreed formats and within agreed turnaround times.',
  'Client stakeholders and testers will be available for scheduled workshops, reviews and UAT.',
  'Delivery is remote, in English, during standard business hours unless stated otherwise.',
  'Estimates are based on the configuration inputs recorded in this document; material changes will be re-estimated.',
  'One UAT cycle and one round of consolidated feedback per deliverable is included unless stated otherwise.',
];
export const EXCLUSIONS = [
  'Product licence, subscription and usage fees are not included in this estimate.',
  'Custom software development beyond platform configuration unless explicitly listed in scope.',
  'Third-party licences, vendor professional services and client-side engineering effort.',
  'Data creation, content writing, translation of source content and legal / compliance review.',
  'Support after the agreed hyper-care period and post-go-live change requests.',
];
