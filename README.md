# Implementation Marketplace

Shopping-cart style implementation estimator for SurveySparrow and ThriveSparrow services.

## Run
    source ~/.nvm/nvm.sh   # Node 22
    npm install
    npm run dev            # http://localhost:3000  (DB auto-created and seeded on first boot)
    npm run seed           # reset the database to the seed catalogue
    npm test               # engine tests (npx tsx scripts/test-engine.ts)

Demo logins (change before any real use): `admin@example.com` / `admin123`, `sales@example.com` / `sales123`.
Override with `SEED_ADMIN_PASSWORD` / `SEED_SALES_PASSWORD` before first boot.

## Architecture
- `src/lib/schema.ts`: relational schema covering all required entities (SQLite now; DDL is Postgres-portable).
- `src/lib/engine.ts`: pure estimation + scheduling engine; all hours, rates and multipliers come from DB rows.
- `src/lib/seed-catalog.ts`: seed data only; after first boot everything is edited in the Admin console.
- Marketplace/config APIs never return rules, hours or rates; only `/api/cart`, `/api/summary` and quote APIs do.
- Link 1: `/` marketplace. Link 2: `/q/[token]` (hashed tokens, expiry, view quota, permissions, quote versions).
- Admin changes to rules, rates, multipliers, targets and overrides require a justification and are audited.
