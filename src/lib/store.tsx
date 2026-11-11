'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CATALOG, CustomerType, DEFAULT_PROFILES, DEFAULT_ROLES, DEFAULT_TYPES, HOURS_PER_DAY, ServiceView, byKey } from './data';
import { CartItemInput, CartPricing, Profile, Role, priceCart, validateConfig } from './engine';

export interface Item { key: string; config: Record<string, any> }
export interface Customer { name: string; company: string; email: string }
interface Persisted { items: Item[]; type: string; customer: Customer; roles: Role[]; profiles: Profile[]; types: CustomerType[] }
const LS = 'im-state-v1';
const initial: Persisted = { items: [], type: 'regular', customer: { name: '', company: '', email: '' }, roles: DEFAULT_ROLES, profiles: DEFAULT_PROFILES, types: DEFAULT_TYPES };

interface Ctx extends Persisted {
  ready: boolean; pricing: CartPricing; query: string; setQuery: (q: string) => void;
  configure: ServiceView | null; openConfigure: (s: ServiceView) => void; closeConfigure: () => void;
  has: (key: string) => boolean; configOf: (key: string) => Record<string, any> | undefined;
  save: (key: string, config: Record<string, any>) => string[]; remove: (key: string) => void; clear: () => void;
  setType: (t: string) => void; setCustomer: (c: Customer) => void;
  setRoles: (r: Role[]) => void; setProfiles: (p: Profile[]) => void; setTypes: (t: CustomerType[]) => void; resetRates: () => void;
  toast: string | null; notify: (m: string) => void;
}
const C = createContext<Ctx>(null as any);
export const useStore = () => useContext(C);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<Persisted>(initial);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [configure, setConfigure] = useState<ServiceView | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    try { const raw = localStorage.getItem(LS); if (raw) setS({ ...initial, ...JSON.parse(raw) }); } catch { /* storage unavailable */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(LS, JSON.stringify(s)); } catch { /* ignore */ } }, [s, ready]);

  const notify = useCallback((m: string) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(null), 2800); }, []);

  const pricing = useMemo(() => {
    const inputs: CartItemInput[] = s.items.flatMap((it, i) => { const v = byKey(it.key); return v ? [{ id: i + 1, service: v.model, config: it.config, overrideHours: null, additionalCharge: 0 }] : []; });
    const ct = s.types.find((t) => t.key === s.type) ?? s.types[0];
    return priceCart(inputs, {
      roles: s.roles, profiles: s.profiles, hoursPerDay: HOURS_PER_DAY,
      customerType: { name: ct.name, target_min_weeks: ct.min, target_max_weeks: ct.max },
      serviceNames: Object.fromEntries(CATALOG.map((x) => [x.id, x.name])),
    });
  }, [s]);

  const value: Ctx = {
    ...s, ready, pricing, query, setQuery, configure, openConfigure: setConfigure, closeConfigure: () => setConfigure(null), toast, notify,
    has: (k) => s.items.some((i) => i.key === k), configOf: (k) => s.items.find((i) => i.key === k)?.config,
    save: (key, config) => {
      const v = byKey(key); if (!v) return ['Unknown service'];
      const r = validateConfig(v.model.questions, config); if (r.errors.length) return r.errors;
      setS((p) => ({ ...p, items: p.items.some((i) => i.key === key) ? p.items.map((i) => (i.key === key ? { key, config: r.config } : i)) : [...p.items, { key, config: r.config }] }));
      return [];
    },
    remove: (key) => setS((p) => ({ ...p, items: p.items.filter((i) => i.key !== key) })),
    clear: () => setS((p) => ({ ...p, items: [] })),
    setType: (type) => setS((p) => ({ ...p, type })), setCustomer: (customer) => setS((p) => ({ ...p, customer })),
    setRoles: (roles) => setS((p) => ({ ...p, roles })), setProfiles: (profiles) => setS((p) => ({ ...p, profiles })), setTypes: (types) => setS((p) => ({ ...p, types })),
    resetRates: () => setS((p) => ({ ...p, roles: DEFAULT_ROLES, profiles: DEFAULT_PROFILES, types: DEFAULT_TYPES })),
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
