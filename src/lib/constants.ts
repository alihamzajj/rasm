export const CITIES = ["Lahore", "Karachi", "Islamabad"] as const;
export const HALL_TYPES = [
  { value: "banquet", label: "Banquet" },
  { value: "marquee", label: "Marquee" },
  { value: "lawn", label: "Lawn" },
] as const;

export type CategoryKey =
  | "photographer"
  | "videographer"
  | "decorator"
  | "fireworks"
  | "caterer"
  | "dj"
  | "makeup"
  | "mehndi";

export const CATEGORIES: {
  key: CategoryKey;
  slug: string;
  label: string;
  plural: string;
  blurb: string;
  image: string;
}[] = [
  { key: "photographer", slug: "photographers", label: "Photographer", plural: "Photographers", blurb: "Candid and classic coverage of every rasm.", image: "photo-1519741497674-611481863552" },
  { key: "videographer", slug: "videographers", label: "Videographer", plural: "Videographers", blurb: "Cinematic highlights and full-day films.", image: "photo-1623783356340-95375aac85ce" },
  { key: "decorator", slug: "decorators", label: "Decorator", plural: "Decorators", blurb: "Stages, florals, lighting and entrances.", image: "photo-1591203281954-23fa2ff8ef18" },
  { key: "fireworks", slug: "fireworks", label: "Fireworks", plural: "Fireworks", blurb: "Sky shows and cold pyros for the grand entry.", image: "photo-1439539698758-ba2680ecadb9" },
  { key: "caterer", slug: "caterers", label: "Caterer", plural: "Caterers", blurb: "Biryani, karahi, live BBQ and dessert bars.", image: "photo-1555244162-803834f70033" },
  { key: "dj", slug: "djs", label: "DJ", plural: "DJs", blurb: "Sound, lights and the perfect dholki playlist.", image: "photo-1470225620780-dba8ba36b745" },
  { key: "makeup", slug: "makeup-artists", label: "Makeup artist", plural: "Makeup artists", blurb: "Bridal, party and family makeup and styling.", image: "photo-1512496015851-a90fb38ba796" },
  { key: "mehndi", slug: "mehndi-artists", label: "Mehndi artist", plural: "Mehndi artists", blurb: "Bridal henna in traditional and modern styles.", image: "photo-1505932794465-147d1f1b2c97" },
];

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const categoryByKey = (key: string) => CATEGORIES.find((c) => c.key === key);

export const ADVANCE_RATE = 0.25;
export const HOLD_MINUTES = 15;

export const CANCELLATION_POLICY = [
  "Free cancellation within 48 hours of booking, as long as the event is more than 30 days away.",
  "Cancel 30+ days before the event: full refund of the advance minus a 5% service fee.",
  "Cancel 8–30 days before the event: 50% of the advance is refunded.",
  "Cancel 7 days or less before the event: the advance is non-refundable.",
  "If a hall or vendor cancels on you, your advance for that line is refunded in full.",
];

export const unsplash = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
