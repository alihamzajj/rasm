# Rasm — wedding booking marketplace (prototype)

Book a marriage hall and add a photographer, videographer, decorator, fireworks, caterer, DJ,
makeup artist and mehndi artist to **the same booking**, with one 25% advance.

Built with Next.js 14 (App Router) · TypeScript · Tailwind CSS + shadcn/ui-style components ·
Framer Motion · lottie-react · tsParticles (fireworks preset) · Prisma + SQLite · Zustand ·
react-day-picker. Payments are simulated.

## Demo mode (how this prototype runs)

The prototype needs **no database or server data**. All demo data (halls, vendors, packages,
bookings, reviews, availability) is bundled in `src/lib/demo/seed.json` and copied into each
visitor's browser (localStorage) on first visit. Every visitor gets a private sandbox: their
bookings, blocked dates and approvals only change their own copy. **Reset demo** in the top bar
restores the original data. Dates are shifted to today on load, so the demo always looks current.

- Data store: `src/lib/demo/store.ts` (Zustand + localStorage)
- Booking rules (15-minute holds, expiry, no double booking): `src/lib/demo/engine.ts`
- Feature tour for visitors: `/features`

## Setup

```bash
npm install
npm run dev                 # http://localhost:3500
npm run build               # production build (deploys as-is to Vercel)
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3500 |
| `npm run build` / `npm start` | Production build / server |
| `npm run test:booking` | Checks the booking rules of the demo engine |
| `npm run lottie` | Regenerates `public/lottie/mandap.json` |
| `npm run db:seed` then `npm run demo:export` | Regenerate the demo data from the Prisma seed (needs `npx prisma migrate dev` once) |

The Prisma schema and seed (`prisma/`) are kept as the source of the demo data and as the
starting point for the real backend later.

## Demo logins (no passwords)

Open **Log in** and pick a role. You can switch at any time.

| Role | Demo user | Where to go |
| --- | --- | --- |
| Customer | Ayesha Khan | `/bookings`, `/planner`, `/packages` |
| Hall owner | Imran Sheikh (Shalimar Grand Banquet) | `/dashboard` |
| Vendor | Sara Malik (Lens & Lace Studio) | `/dashboard` |
| Admin | Rasm Admin | `/admin` |

If nobody is logged in, customer actions (checkout, my bookings) use the demo customer, so the
booking flow never dead-ends. The chosen role is remembered in the browser.

## Pages

**Customer:** home (`/`), hall search (`/halls`), hall detail (`/halls/[id]`), vendor categories
(`/vendors`), vendor listing (`/vendors/[category]`), vendor detail (`/vendor/[id]`), package
builder (`/packages`), checkout (`/checkout`), confirmation (`/booking/[id]`), my bookings
(`/bookings`), wedding planner (`/planner`), list your business (`/list-your-business`).

**Hall owner / vendor:** overview (`/dashboard`), my listing (`/dashboard/listing`),
availability (`/dashboard/availability`), booking requests (`/dashboard/requests`).

**Admin:** approvals (`/admin`), all bookings (`/admin/bookings`), commission & revenue
(`/admin/settings`).

## The booking rule (no double booking)

1. **Start checkout:** every line is re-priced, each hall/vendor date is checked, a `pending`
   booking is created and each slot is marked `held` with `heldUntil = now + 15 min`.
2. **Pay:** confirm only if every slot is still free or held by *this* booking; then the slots
   become `booked` and the booking `confirmed`. Otherwise nothing is charged.
3. **Expired holds** count as free immediately and are cleaned up on the next change.
4. Booked, held and blocked dates are disabled in every calendar.

In the demo this runs in the browser. For production, the same rules go in a server
transaction (the earlier Prisma version is in git history, commit `104bfad`).

## Data model

`prisma/schema.prisma` has User, Hall, Vendor, Package, Availability, Booking, BookingItem,
Payment, Review and a small Setting table (commission %). Event dates are stored as
`YYYY-MM-DD` strings because they are calendar days, not instants.

Seed data: 3 cities (Lahore, Karachi, Islamabad), 12 approved halls, 5 vendors in each of the
8 categories, one pending hall and one pending vendor for the approval queue, 18 bookings in
every status, reviews and random booked/blocked dates.

### Switching to PostgreSQL later

1. In `prisma/schema.prisma` set `provider = "postgresql"`.
2. Set `DATABASE_URL` in `.env` to your Postgres connection string.
3. Delete `prisma/migrations` and run `npx prisma migrate dev --name init`.
4. Optional: turn the JSON-string columns (`amenities`, `photos`) into `Json` or `String[]`.

## Animations

- Hero: full-width wedding-stage photo, 75% maroon overlay, 14 slow-falling rose petals.
- "How it works": a Lottie mandap with swinging marigold garlands and twinkling lights,
  loaded from `public/lottie/mandap.json`. It was generated from scratch by
  `scripts/make-lottie.mjs`, so it is free to use.
- Fireworks (tsParticles fireworks preset, gold and maroon) on the Fireworks category page
  and on the booking confirmation page.
- Glowing diyas beside "Build your package"; fade-and-slide-up on scroll; gold ornamental
  dividers whose lines draw themselves.
- `prefers-reduced-motion: reduce` turns all of these off (petals and fireworks are not
  rendered, the Lottie shows a still frame, CSS animations and transitions are disabled).

## Images

Hall and vendor photos are free-to-use Unsplash images (Unsplash licence), referenced by URL in
`prisma/photos.ts` and served through `next/image`.

## Notes

- Payments are mocked: the "Pay advance" form accepts any values and never contacts a gateway.
- Everything (data, cart, planner, chosen role) is stored in the visitor's browser.
