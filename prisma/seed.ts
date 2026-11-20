import { PrismaClient, type Hall, type Vendor } from "@prisma/client";
import { PHOTO_POOLS } from "./photos";

const prisma = new PrismaClient();

// ---------- helpers ----------
let seed = 20261121;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (a: number, b: number) => Math.floor(a + rand() * (b - a + 1));
const round = (n: number, to: number) => Math.round(n / to) * to;
const img = (id: string, w = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
const photosFrom = (pool: string, offset: number, n = 5) => {
  const p = PHOTO_POOLS[pool];
  return Array.from({ length: n }, (_, i) => img(p[(offset + i * 3) % p.length]));
};
const dayKey = (offsetDays: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const code = () => "RSM-" + Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(rand() * 31)]).join("");
const phone = () => `+92 3${between(0, 4)}${between(0, 9)} ${between(1000000, 9999999)}`;

// ---------- data ----------
const AREAS: Record<string, string[]> = {
  Lahore: ["Gulberg", "DHA Phase 6", "Johar Town", "Canal Road", "Model Town", "Raiwind Road"],
  Karachi: ["Clifton", "DHA Phase 8", "Gulshan-e-Iqbal", "PECHS", "Shahrah-e-Faisal", "North Nazimabad"],
  Islamabad: ["F-7", "E-11", "Bahria Enclave", "G-11", "Park Road", "DHA Phase 2"],
};

const HALLS = [
  { name: "Shalimar Grand Banquet", city: "Lahore", type: "banquet", min: 300, max: 1200, pph: 3200, base: 450000 },
  { name: "Noor Mahal Marquee", city: "Lahore", type: "marquee", min: 200, max: 800, pph: 2600, base: 300000 },
  { name: "Bagh-e-Jinnah Lawns", city: "Lahore", type: "lawn", min: 400, max: 1500, pph: 2400, base: 380000 },
  { name: "Royal Palm Pavilion", city: "Lahore", type: "banquet", min: 150, max: 500, pph: 3800, base: 520000 },
  { name: "Clifton Pearl Banquets", city: "Karachi", type: "banquet", min: 250, max: 1000, pph: 3500, base: 480000 },
  { name: "Saba Marquee & Gardens", city: "Karachi", type: "marquee", min: 300, max: 1100, pph: 2800, base: 320000 },
  { name: "Seaview Lawn Club", city: "Karachi", type: "lawn", min: 500, max: 2000, pph: 2500, base: 400000 },
  { name: "Mehran Heritage Hall", city: "Karachi", type: "banquet", min: 120, max: 400, pph: 4200, base: 600000 },
  { name: "Margalla View Marquee", city: "Islamabad", type: "marquee", min: 200, max: 900, pph: 3000, base: 350000 },
  { name: "Daman-e-Koh Gardens", city: "Islamabad", type: "lawn", min: 300, max: 1200, pph: 2700, base: 360000 },
  { name: "Faisal Crown Banquet", city: "Islamabad", type: "banquet", min: 250, max: 1000, pph: 3600, base: 500000 },
  { name: "Serena Courtyard Hall", city: "Islamabad", type: "banquet", min: 100, max: 350, pph: 4800, base: 650000 },
];

const AMENITIES = [
  "Air conditioning", "Valet parking", "Bridal room", "Backup generator", "In-house catering",
  "Stage & lighting", "Sound system", "Wheelchair access", "Prayer area", "Separate family seating",
  "Outdoor seating", "Dedicated event manager", "Fireworks allowed", "Wi-Fi",
];

const VENDORS: Record<string, { names: string[]; blurb: string; pkgs: [string, string, number][] }> = {
  photographer: {
    names: ["Lens & Lace Studio", "Mehr Photography", "Golden Hour Stories", "Qissa Frames", "Rang Studio"],
    blurb: "Candid storytelling with classic family portraits. Every event is shot by a two-person team with natural light and studio flash.",
    pkgs: [["Single event", "One event, 6 hours, 400+ edited photos, online gallery", 85000], ["Two events", "Mehndi + Baraat, 2 photographers, 800+ photos, 1 album", 160000], ["Full wedding", "Three events, drone shots, 2 premium albums, pre-wedding shoot", 260000]],
  },
  videographer: {
    names: ["Reel Rasm Films", "Saat Phere Cinema", "Dastaan Motion", "Frame by Frame PK", "Noor Films"],
    blurb: "Cinematic wedding films with drone coverage, same-day teasers and a full-length documentary edit.",
    pkgs: [["Highlights", "One event, 3–5 minute cinematic highlight film", 90000], ["Cinematic duo", "Two events, highlights + 30 min documentary, drone", 175000], ["Signature film", "Three events, 4K, drone, teaser in 48 hours, full film", 290000]],
  },
  decorator: {
    names: ["Phool Mahal Decor", "Gulnar Events", "Shamiana Studio", "Taj Decorators", "Mehfil Designs"],
    blurb: "Stage design, fresh florals, fairy lights and grand entrances, themed around your colours.",
    pkgs: [["Classic stage", "Stage backdrop, sofa set, entrance arch, basic florals", 120000], ["Royal floral", "Fresh-flower stage, walkway, centrepieces, fairy lights", 280000], ["Grand theme", "Full venue theme, chandeliers, floral ceiling, photo booth", 550000]],
  },
  fireworks: {
    names: ["Aatish Sky Shows", "Chamak Pyro", "Roshni Fireworks", "Sitara Displays", "Jashn Pyrotechnics"],
    blurb: "Licensed pyrotechnics for baraat entries and send-offs. Cold pyros for indoor halls, sky shows for lawns.",
    pkgs: [["Grand entry", "4 cold pyro fountains + confetti blast for the couple's entry", 45000], ["Sky show", "5-minute aerial show synced to music (outdoor venues)", 120000], ["Royal finale", "Cold pyros + 10-minute sky show + sparkler send-off", 220000]],
  },
  caterer: {
    names: ["Dawat Caterers", "Handi House Catering", "Shahi Dastarkhwan", "Zaiqa Events Kitchen", "Karahi Kings"],
    blurb: "Desi wedding menus cooked fresh on site: biryani, karahi, live BBQ stations, kheer and gulab jamun.",
    pkgs: [["Classic menu", "Per 100 guests: chicken biryani, korma, naan, raita, kheer", 180000], ["Shahi menu", "Per 100 guests: mutton biryani, karahi, BBQ, 2 desserts", 260000], ["Royal feast", "Per 100 guests: live stations, BBQ, Chinese, dessert bar", 380000]],
  },
  dj: {
    names: ["DJ Bass & Dhol", "Sur Sangeet Sound", "Beat Baraat", "DJ Zaroon", "Mehfil Mix Crew"],
    blurb: "DJ with dhol players, moving-head lights, smoke and a playlist built around your family's favourites.",
    pkgs: [["Dholki night", "DJ + sound for up to 150 guests, 4 hours", 35000], ["Mehndi party", "DJ, dhol player, dance floor lights, smoke, 5 hours", 70000], ["Full show", "DJ, 2 dhol players, LED wall, lights, 2 events", 140000]],
  },
  makeup: {
    names: ["Glam by Hina", "Dulhan Studio", "Kajal Beauty Lounge", "Sana Safinaz Makeovers", "Rouge & Rose"],
    blurb: "Long-wear bridal makeup, hairstyling and dupatta setting, at the salon or at your venue.",
    pkgs: [["Party makeup", "Makeup and hairstyling for one guest or family member", 15000], ["Bridal makeup", "Bridal makeup, hair, dupatta setting, trial session", 65000], ["Bridal trio", "Bridal looks for Mehndi, Baraat and Walima + 2 family members", 150000]],
  },
  mehndi: {
    names: ["Henna by Aleena", "Mehndi Rang", "Hina Haath", "Nakhrewali Mehndi", "Zari Henna Art"],
    blurb: "Organic henna in Arabic, Pakistani, Indo-Arabic and minimal styles, with a deep, dark stain.",
    pkgs: [["Guest mehndi", "Simple designs for up to 15 guests, 3 hours", 18000], ["Bridal hands", "Full bridal hands to elbows, detailed portrait work", 35000], ["Bridal full", "Hands + feet bridal design + 10 guest designs", 60000]],
  },
};

const FIRST = ["Ayesha", "Fatima", "Zainab", "Hira", "Maryam", "Sana", "Usman", "Bilal", "Hamza", "Ali", "Ahmed", "Saad", "Mahnoor", "Iqra", "Omar", "Daniyal", "Noor", "Rabia"];
const LAST = ["Khan", "Malik", "Qureshi", "Sheikh", "Butt", "Chaudhry", "Raza", "Siddiqui", "Mirza", "Abbasi", "Hussain", "Aslam"];
const fullName = () => `${pick(FIRST)} ${pick(LAST)}`;

const REVIEW_COMMENTS = [
  "Everything was exactly as promised. Our families are still talking about it!",
  "Very professional team, arrived early and handled the rush calmly.",
  "Great value for money. A couple of small delays but the result was beautiful.",
  "They understood our colours and theme perfectly. Highly recommended.",
  "Food and service were excellent, guests kept asking for the caterer's number.",
  "Responsive on WhatsApp, flexible with changes a week before the baraat.",
  "Elegant setup and lovely staff. Parking was a little tight.",
  "Worth every rupee. The photos and the decor looked straight out of a magazine.",
];

async function main() {
  console.log("Clearing old data…");
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.package.deleteMany();
  await prisma.hall.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  // ---- demo users (one per role, used by the role switcher) ----
  const customer = await prisma.user.create({ data: { id: "demo-customer", name: "Ayesha Khan", phone: "+92 300 1234567", email: "ayesha@rasm.pk", role: "customer" } });
  await prisma.user.create({ data: { id: "demo-admin", name: "Rasm Admin", phone: "+92 321 0000000", email: "admin@rasm.pk", role: "admin" } });
  const otherCustomers = await Promise.all(
    Array.from({ length: 6 }, (_, i) =>
      prisma.user.create({ data: { name: fullName(), phone: phone(), email: `guest${i + 1}@example.pk`, role: "customer" } })
    )
  );

  // ---- hall owners & halls ----
  console.log("Creating halls…");
  const halls: Hall[] = [];
  for (let i = 0; i < HALLS.length; i++) {
    const h = HALLS[i];
    const owner = await prisma.user.create({
      data: {
        id: i === 0 ? "demo-hall-owner" : undefined,
        name: i === 0 ? "Imran Sheikh" : fullName(),
        phone: phone(),
        email: `owner${i + 1}@halls.pk`,
        role: "hall_owner",
      },
    });
    const amenities = AMENITIES.filter(() => rand() > 0.45).slice(0, 9);
    if (h.type !== "lawn") amenities.unshift("Air conditioning");
    if (h.type === "lawn") amenities.push("Fireworks allowed", "Outdoor seating");
    const hall = await prisma.hall.create({
      data: {
        ownerId: owner.id,
        name: h.name,
        city: h.city,
        area: pick(AREAS[h.city]),
        type: h.type,
        description:
          h.type === "lawn"
            ? `${h.name} is an open-air lawn with mature trees, a raised stage and space for a separate dinner marquee. Ideal for mehndi nights and large walimas.`
            : h.type === "marquee"
              ? `${h.name} is a fully air-conditioned marquee with crystal chandeliers, a grand entrance and a flexible floor plan for mixed or separate seating.`
              : `${h.name} is a classic banquet hall with high ceilings, a royal stage, bridal suite and an in-house kitchen run by experienced chefs.`,
        capacityMin: h.min,
        capacityMax: h.max,
        pricePerHead: h.pph,
        basePrice: h.base,
        amenities: JSON.stringify([...new Set(amenities)]),
        photos: JSON.stringify(photosFrom(h.type, i * 2, 6)),
        rating: Math.round((4 + rand()) * 10) / 10,
        approved: "approved",
        packages: {
          create: [
            { name: "Classic menu", description: "Chicken biryani, chicken korma, naan, raita, salad, kheer, soft drinks", price: h.pph },
            { name: "Royal menu", description: "Mutton biryani, chicken karahi, seekh kebab, naan, 2 desserts, mineral water", price: round(h.pph * 1.35, 100) },
            { name: "Shahi menu", description: "Mutton pulao, live BBQ, Chinese station, fish, 3 desserts, tea & kahwa", price: round(h.pph * 1.75, 100) },
          ],
        },
      },
    });
    halls.push(hall);
  }

  // pending applications for the admin approval queue
  const pendingOwner = await prisma.user.create({ data: { name: "Kashif Mirza", phone: phone(), email: "kashif@halls.pk", role: "hall_owner" } });
  await prisma.hall.create({
    data: {
      ownerId: pendingOwner.id, name: "Sheesh Mahal Banquets", city: "Lahore", area: "Bahria Town", type: "banquet",
      description: "New banquet hall with a mirror-work ceiling and a 900-guest main hall.",
      capacityMin: 200, capacityMax: 900, pricePerHead: 2900, basePrice: 350000,
      amenities: JSON.stringify(["Air conditioning", "Valet parking", "Bridal room"]),
      photos: JSON.stringify(photosFrom("banquet", 9, 4)), approved: "pending",
      packages: { create: [{ name: "Classic menu", description: "Biryani, korma, naan, kheer", price: 2900 }] },
    },
  });

  // ---- vendors ----
  console.log("Creating vendors…");
  const vendors: Vendor[] = [];
  const cities = ["Lahore", "Karachi", "Islamabad"];
  let vi = 0;
  for (const [category, def] of Object.entries(VENDORS)) {
    for (let j = 0; j < def.names.length; j++) {
      const user = await prisma.user.create({
        data: {
          id: vi === 0 ? "demo-vendor" : undefined,
          name: vi === 0 ? "Sara Malik" : fullName(),
          phone: phone(),
          email: `vendor${vi + 1}@rasm.pk`,
          role: "vendor",
        },
      });
      const mult = 0.8 + j * 0.12;
      const vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          category,
          businessName: def.names[j],
          city: cities[j % 3],
          description: def.blurb,
          photos: JSON.stringify(photosFrom(category, j * 2, 6)),
          rating: Math.round((3.9 + rand() * 1.1) * 10) / 10,
          approved: "approved",
          packages: { create: def.pkgs.map(([name, description, price]) => ({ name, description, price: round(price * mult, 1000) })) },
        },
      });
      vendors.push(vendor);
      vi++;
    }
  }
  const pendingVendorUser = await prisma.user.create({ data: { name: "Laiba Aslam", phone: phone(), email: "laiba@rasm.pk", role: "vendor" } });
  await prisma.vendor.create({
    data: {
      userId: pendingVendorUser.id, category: "photographer", businessName: "Shutter Shaadi", city: "Karachi",
      description: "Young team specialising in candid and documentary wedding photography.",
      photos: JSON.stringify(photosFrom("photographer", 5, 4)), approved: "pending",
      packages: { create: [{ name: "Single event", description: "One event, 300 edited photos", price: 60000 }] },
    },
  });

  // ---- random booked / blocked dates for the next 120 days ----
  console.log("Creating availability…");
  const avail: { hallId?: string; vendorId?: string; date: string; status: string }[] = [];
  for (const h of halls) {
    const used = new Set<number>();
    for (let k = 0; k < 14; k++) {
      const off = between(2, 120);
      if (used.has(off)) continue;
      used.add(off);
      avail.push({ hallId: h.id, date: dayKey(off), status: rand() > 0.15 ? "booked" : "blocked" });
    }
  }
  for (const v of vendors) {
    const used = new Set<number>();
    for (let k = 0; k < 8; k++) {
      const off = between(2, 120);
      if (used.has(off)) continue;
      used.add(off);
      avail.push({ vendorId: v.id, date: dayKey(off), status: rand() > 0.2 ? "booked" : "blocked" });
    }
  }

  // ---- bookings ----
  console.log("Creating bookings…");
  const vendorsOf = (cat: string) => vendors.filter((v) => v.category === cat);
  const hallPkgs = await prisma.package.findMany({ where: { hallId: { not: null } } });
  const vendorPkgs = await prisma.package.findMany({ where: { vendorId: { not: null } } });

  type Spec = { customerId: string; hall: (typeof halls)[number]; vendorList: (typeof vendors)[number][]; offset: number; status: string; name: string; guests: number };
  const specs: Spec[] = [
    { customerId: customer.id, hall: halls[0], vendorList: [vendorsOf("photographer")[0], vendorsOf("decorator")[0], vendorsOf("mehndi")[0]], offset: 45, status: "confirmed", name: "Ayesha & Hamza — Baraat", guests: 500 },
    { customerId: customer.id, hall: halls[2], vendorList: [vendorsOf("dj")[0], vendorsOf("mehndi")[3]], offset: 43, status: "pending", name: "Ayesha & Hamza — Mehndi", guests: 350 },
    { customerId: customer.id, hall: halls[3], vendorList: [vendorsOf("caterer")[0]], offset: -60, status: "completed", name: "Sister's Walima", guests: 300 },
    { customerId: customer.id, hall: halls[1], vendorList: [vendorsOf("photographer")[3]], offset: 20, status: "cancelled", name: "Engagement (Mangni)", guests: 200 },
  ];
  for (let k = 0; k < 14; k++) {
    const hall = halls[k % halls.length];
    const cats = ["photographer", "videographer", "decorator", "fireworks", "caterer", "dj", "makeup", "mehndi"];
    const vendorList = cats.filter(() => rand() > 0.6).map((c) => pick(vendorsOf(c).filter((v) => v.city === hall.city).concat(vendorsOf(c)).slice(0, 3)));
    const offset = k < 4 ? -between(10, 90) : between(5, 110);
    specs.push({
      customerId: pick(otherCustomers).id,
      hall: k % 5 === 0 ? halls[0] : hall,
      vendorList: k % 3 === 0 ? [vendors[0], ...vendorList] : vendorList,
      offset,
      status: offset < 0 ? "completed" : k % 4 === 1 ? "pending" : "confirmed",
      name: pick(["Baraat", "Walima", "Mehndi", "Nikkah", "Mayun"]),
      guests: between(hall.capacityMin, hall.capacityMax),
    });
  }

  const reviewsByBooking: { bookingId: string; type: string; id: string }[] = [];
  for (const s of specs) {
    const date = dayKey(s.offset);
    const hallPkg = pick(hallPkgs.filter((p) => p.hallId === s.hall.id));
    const hallPrice = s.hall.basePrice + hallPkg.price * s.guests;
    const items = [
      { type: "hall", refId: s.hall.id, packageId: hallPkg.id, label: `${s.hall.name} · ${hallPkg.name}`, price: hallPrice },
      ...[...new Map(s.vendorList.map((v) => [v.id, v])).values()].map((v) => {
        const pk = pick(vendorPkgs.filter((p) => p.vendorId === v.id));
        return { type: "vendor", refId: v.id, packageId: pk.id, label: `${v.businessName} · ${pk.name}`, price: pk.price };
      }),
    ];
    const total = items.reduce((a, b) => a + b.price, 0);
    const advance = Math.round(total * 0.25);
    const itemStatus = s.status === "confirmed" || s.status === "completed" ? (rand() > 0.3 ? "accepted" : "requested") : s.status === "cancelled" ? "declined" : "requested";
    const booking = await prisma.booking.create({
      data: {
        code: code(),
        customerId: s.customerId,
        eventName: s.name,
        eventDate: date,
        guests: s.guests,
        status: s.status,
        totalAmount: total,
        advanceAmount: advance,
        createdAt: new Date(Date.now() - between(5, 40) * 86400000),
        items: { create: items.map((it) => ({ ...it, status: s.status === "completed" ? "accepted" : itemStatus })) },
        payments:
          s.status === "pending"
            ? undefined
            : { create: [{ amount: advance, status: s.status === "cancelled" ? "refunded" : "paid", method: pick(["card", "jazzcash", "easypaisa"]) }] },
      },
    });
    if (s.status === "confirmed" || s.status === "completed") {
      for (const it of items) {
        const key = it.type === "hall" ? "hallId" : "vendorId";
        const idx = avail.findIndex((a) => (a as Record<string, string>)[key] === it.refId && a.date === date);
        if (idx >= 0) avail.splice(idx, 1);
        avail.push({ [key]: it.refId, date, status: "booked" } as never);
      }
    }
    if (s.status === "completed") items.forEach((it) => reviewsByBooking.push({ bookingId: booking.id, type: it.type, id: it.refId }));
  }

  // The pending demo booking is an unpaid request (its hold already expired), so no availability row.
  for (const a of avail) {
    await prisma.availability.create({ data: { ...a, heldByBooking: null } });
  }

  // ---- reviews ----
  console.log("Creating reviews…");
  for (const h of halls) {
    for (let k = 0; k < 4; k++) {
      await prisma.review.create({
        data: { authorName: fullName(), targetType: "hall", targetId: h.id, rating: between(4, 5), comment: pick(REVIEW_COMMENTS), createdAt: new Date(Date.now() - between(10, 300) * 86400000) },
      });
    }
  }
  for (const v of vendors) {
    for (let k = 0; k < 3; k++) {
      await prisma.review.create({
        data: { authorName: fullName(), targetType: "vendor", targetId: v.id, rating: between(3, 5), comment: pick(REVIEW_COMMENTS), createdAt: new Date(Date.now() - between(10, 300) * 86400000) },
      });
    }
  }
  for (const r of reviewsByBooking.slice(0, 10)) {
    await prisma.review.create({ data: { bookingId: r.bookingId, authorName: fullName(), targetType: r.type, targetId: r.id, rating: 5, comment: pick(REVIEW_COMMENTS) } });
  }

  await prisma.setting.create({ data: { key: "commissionPercent", value: "10" } });

  console.log(`Done: ${halls.length} halls, ${vendors.length} vendors, ${specs.length} bookings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
