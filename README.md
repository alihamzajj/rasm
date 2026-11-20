# Rasm — wedding booking marketplace (prototype)

Book a marriage hall and add a photographer, videographer, decorator, fireworks, caterer, DJ,
makeup artist and mehndi artist to **the same booking**, with one 25% advance.

Built with Next.js 14 (App Router) · TypeScript · Tailwind CSS + shadcn/ui-style components ·
Framer Motion · lottie-react · tsParticles (fireworks preset) · Prisma + SQLite · Zustand ·
react-day-picker. Payments are simulated.

## Setup

```bash
npm install
npx prisma migrate dev      # creates prisma/dev.db and runs the seed automatically
npm run db:seed             # (re)seed any time
npm run dev                 # http://localhost:3500
```

Useful scripts:

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on port 3500 |
| `npm run build` / `npm start` | Production build / server |
| `npm run db:seed` | Wipe and reseed demo data |
| `npm run db:reset` | Drop the database, re-migrate and reseed |
| `npm run test:booking` | Checks the double-booking rule against the database |
| `npm run lottie` | Regenerates `public/lottie/mandap.json` |

## Demo logins (no passwords)

Open **Log in** and pick a role. You can switch at any time.

| Role | Demo user | Where to go |
| --- | --- | --- |
| Customer | Ayesha Khan | `/bookings`, `/planner`, `/packages` |
| Hall owner | Imran Sheikh (Shalimar Grand Banquet) | `/dashboard` |
| Vendor | Sara Malik (Lens & Lace Studio) | `/dashboard` |
| Admin | Rasm Admin | `/admin` |

If nobody is logged in, customer actions (checkout, my bookings) use the demo customer, so the
booking flow never dead-ends.

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

All logic lives in [`src/lib/booking.ts`](src/lib/booking.ts).

1. **Start checkout** (`startCheckout`): inside one database transaction, release expired
   holds, re-price every line from the database, check the hall date and every vendor date,
   create a `pending` booking, and mark each slot `held` with `heldUntil = now + 15 min`.
   A unique index on `(hallId, date)` / `(vendorId, date)` stops two customers holding the same
   slot even if they click at the same instant.
2. **Pay** (`confirmPayment`): inside a transaction, confirm only if every slot is still free or
   held by *this* booking. Then mark the slots `booked`, record the payment and set the booking
   to `confirmed`. Otherwise nothing is charged and the customer sees which item was taken.
3. **Expired holds** are released automatically before every availability read or write
   (`releaseExpiredHolds`), so a held date frees itself as soon as its 15 minutes pass.
4. Booked, held and blocked dates are disabled in every calendar.

`npm run test:booking` proves this end to end (hold, block a second customer, expiry, late
payment refused, confirmation, and a two-customer race).

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
- The cart and the wedding planner are stored in the browser (Zustand + localStorage).
- On Node 25, Next's dev server is fine; the stores guard `localStorage` so the server never
  touches it.
