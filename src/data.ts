import type { Booking, TeamMember } from "./store";

/* ————— imagery ————— */
export const IMG = {
  hero: "https://image.qwenlm.ai/generated-images/1d06e80a-d9ab-413a-b0e5-3708708d9646/_result.png",
  studio: "https://image.qwenlm.ai/generated-images/dd7371bb-a1d8-4fd5-8305-de563b51f96d/_result.png",
  bridal: "https://image.qwenlm.ai/generated-images/36926275-fe9f-4de6-a9fb-d3ac749133f3/_result.png",
  fashion: "https://image.qwenlm.ai/generated-images/b9274cf3-727c-46d5-94a7-7f681624a1d4/_result.png",
  family: "https://image.qwenlm.ai/generated-images/c0f3f69c-0031-46e8-a054-2687efc567e1/_result.png",
  product: "https://image.qwenlm.ai/generated-images/e927488a-0c87-4d25-9ca1-11570c7eabba/_result.png",
  maternity: "https://image.qwenlm.ai/generated-images/f3d0d3de-14ff-4205-b6d5-106b50f7af0a/_result.png",
  headshot: "https://image.qwenlm.ai/generated-images/16327cce-cd49-4685-bc77-6398054f6aba/_result.png",
  event: "https://image.qwenlm.ai/generated-images/305e0060-0f96-473a-9598-a0550501f688/_result.png",
  newborn: "https://image.qwenlm.ai/generated-images/07ab8e40-5d81-4cca-ae2c-9a2e625eb8a4/_result.png",
};

/* ————— services ————— */
export interface Service {
  id: string;
  icon: "lens" | "rings" | "prism" | "hanger" | "sprout" | "stage";
  title: string;
  desc: string;
  from: number;
  duration: string;
  includes: string[];
}

export const SERVICES: Service[] = [
  {
    id: "portrait",
    icon: "lens",
    title: "Portrait Sessions",
    desc: "Headshots, personal branding and character studies — lit slowly, one subject at a time, in our north-light studio.",
    from: 190,
    duration: "1–2 hrs",
    includes: ["2 lighting setups", "Wardrobe consult", "Same-week proofs"],
  },
  {
    id: "wedding",
    icon: "rings",
    title: "Weddings & Elopements",
    desc: "Documentary-first coverage that keeps its nerve in the dark — vows, first looks and the hours nobody plans for.",
    from: 1240,
    duration: "Half / full day",
    includes: ["Second shooter", "Film + digital", "48h teaser set"],
  },
  {
    id: "product",
    icon: "prism",
    title: "Product & Still Life",
    desc: "Bottles, hardware, food and fabric rendered with hard light and long shadows. Built for shelf, web and print.",
    from: 340,
    duration: "Per SKU day",
    includes: ["Art direction", "Retouch included", "Crop variants"],
  },
  {
    id: "fashion",
    icon: "hanger",
    title: "Fashion & Editorial",
    desc: "Lookbooks and campaigns with gel work, movement and mood — produced with our in-house stylist and set builder.",
    from: 780,
    duration: "Half day +",
    includes: ["Set design", "Gel lighting", "Usage licensing"],
  },
  {
    id: "maternity",
    icon: "sprout",
    title: "Maternity & Newborn",
    desc: "Quiet, warm sessions on your schedule — feeds, naps and all. Prop library and heated studio included.",
    from: 260,
    duration: "1–3 hrs",
    includes: ["Prop library", "Heated studio", "Sibling frames"],
  },
  {
    id: "event",
    icon: "stage",
    title: "Events & Concerts",
    desc: "Pit-pass energy for launches, festivals and fundraisers. Fast turnaround, captioned delivery, low-light native.",
    from: 420,
    duration: "2–6 hrs",
    includes: ["Low-light kit", "24h selects", "Press captions"],
  },
];

export const SESSIONS = SERVICES.map((s) => s.title);

/* ————— packages ————— */
export interface Pkg {
  id: string;
  name: string;
  tagline: string;
  price: number;
  hours: string;
  features: string[];
  featured?: boolean;
}

export const PACKAGES: Pkg[] = [
  {
    id: "proof",
    name: "The Proof",
    tagline: "One hour, one look, done right.",
    price: 240,
    hours: "1 hour in studio",
    features: [
      "1 outfit / look",
      "15 hand-retouched frames",
      "Private online gallery",
      "Delivery in 7 days",
      "Print-ready files",
    ],
  },
  {
    id: "contact",
    name: "The Contact Sheet",
    tagline: "The session most clients book.",
    price: 560,
    hours: "3 hours · studio + location",
    featured: true,
    features: [
      "Up to 3 outfits / looks",
      "60 hand-retouched frames",
      "Studio + one location",
      "$75 print credit",
      "Delivery in 5 days",
      "1 round of extra selects",
    ],
  },
  {
    id: "archive",
    name: "The Archive",
    tagline: "A full day, nothing left on the table.",
    price: 1240,
    hours: "Full day · unlimited setups",
    features: [
      "Unlimited looks & setups",
      "200+ retouched frames",
      "Second shooter included",
      "20-page linen album",
      "Priority 72h teaser",
      "Commercial usage license",
    ],
  },
];

export const getPackage = (id: string) => PACKAGES.find((p) => p.id === id);

/* ————— gallery ————— */
export type Category = "Portrait" | "Wedding" | "Fashion" | "Product" | "Maternity" | "Family" | "Event";

export interface GalleryItem {
  id: string;
  title: string;
  cat: Category;
  img: string;
  exif: string;
}

export const GALLERY: GalleryItem[] = [
  { id: "g1", title: "Vows at Dunmore", cat: "Wedding", img: IMG.bridal, exif: "85MM · f/1.8 · 1/250 · ISO 200" },
  { id: "g2", title: "Rust & Velvet", cat: "Fashion", img: IMG.fashion, exif: "50MM · f/2.8 · 1/160 · ISO 400" },
  { id: "g3", title: "The Hour Before Dinner", cat: "Family", img: IMG.family, exif: "35MM · f/2.0 · 1/125 · ISO 800" },
  { id: "g4", title: "Amber No. 9", cat: "Product", img: IMG.product, exif: "90MM MACRO · f/8 · 1/125 · ISO 100" },
  { id: "g5", title: "Second Heartbeat", cat: "Maternity", img: IMG.maternity, exif: "85MM · f/1.4 · 1/200 · ISO 160" },
  { id: "g6", title: "The Chairman", cat: "Portrait", img: IMG.headshot, exif: "105MM · f/2.2 · 1/160 · ISO 100" },
  { id: "g7", title: "Encore, 11:58 PM", cat: "Event", img: IMG.event, exif: "24MM · f/1.4 · 1/320 · ISO 3200" },
  { id: "g8", title: "Nine Days Old", cat: "Maternity", img: IMG.newborn, exif: "50MM · f/1.8 · 1/160 · ISO 400" },
];

export const CATEGORIES: ("All" | Category)[] = ["All", "Portrait", "Wedding", "Fashion", "Product", "Maternity", "Family", "Event"];

/* ————— testimonials ————— */
export interface Quote {
  quote: string;
  name: string;
  meta: string;
}

export const QUOTES: Quote[] = [
  {
    quote: "They shot our wedding like a film crew that forgot to tell us. Every frame feels stolen in the best way.",
    name: "Maya Lindqvist",
    meta: "Wedding · The Archive",
  },
  {
    quote: "I have sat for headshots eleven times. This was the first time I recognised myself and liked what I saw.",
    name: "Daniel Okafor",
    meta: "Portrait · The Proof",
  },
  {
    quote: "Our bottle campaign tripled click-through. The light in those stills does half the selling.",
    name: "Hartline Atelier",
    meta: "Product · The Archive",
  },
  {
    quote: "They waited forty minutes for our daughter to stop crying, then got the photo in ninety seconds.",
    name: "The Ferraro Family",
    meta: "Family · The Contact Sheet",
  },
  {
    quote: "Fastest, calmest turnaround I've had from any studio. Teasers landed before we were home from the venue.",
    name: "Cascade Brew Co.",
    meta: "Event · The Contact Sheet",
  },
  {
    quote: "The maternity set felt like an hour in a warm room with friends. Then the prints made me cry, obviously.",
    name: "Priya Raman",
    meta: "Maternity · The Proof",
  },
];

/* ————— faq ————— */
export interface Faq {
  id?: string;
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "How do deposits and payment work?",
    a: "A 30% deposit locks your date; the balance is due 48 hours before the session. Weddings and Archive days split into thirds. We take card, transfer and studio credit.",
  },
  {
    q: "Can I reschedule a session?",
    a: "Yes — once, free, with 72 hours' notice. Inside 72 hours the deposit moves to a credit valid for six months. Weather calls for outdoor work are always free.",
  },
  {
    q: "When do I receive my photos?",
    a: "The Proof delivers in 7 days, The Contact Sheet in 5, and Archive clients get a 72-hour teaser set plus the full gallery in 10 days. Every frame is hand-retouched in-house.",
  },
  {
    q: "Do you shoot film as well as digital?",
    a: "Both. Every package can include 35mm or 120 roll add-ons — Portra, HP5 or CineStill — developed and scanned in our own darkroom within the week.",
  },
  {
    q: "Do we get printing rights or RAW files?",
    a: "All packages include full personal print rights. RAW files and commercial licensing are available on The Archive or as an add-on to any session.",
  },
  {
    q: "Can you travel for weddings and events?",
    a: "Constantly. Within the state travel is on us; beyond that we quote flights and lodging at cost. About a third of our weddings each year are destination dates.",
  },
];

/* ————— team seed (first run only) ————— */
export const TEAM_SEED: TeamMember[] = [
  {
    id: "tm-1",
    name: "Mara Ellison",
    role: "Founder · Principal Photographer",
    bio: "Started with two strobes and a borrowed Rollei. Fourteen years on, she still insists on metering by hand and knows every client's coffee order.",
    gear: "Leica M6 · Portra 400",
    hue: "deep",
    published: true,
  },
  {
    id: "tm-2",
    name: "Jonah Reyes",
    role: "Second Shooter · Film Specialist",
    bio: "Runs the pit at concerts and the darkroom on Tuesdays. If a frame has honest grain in it, Jonah probably loaded the roll.",
    gear: "Nikon FM2 · HP5 Plus",
    hue: "sky",
    published: true,
  },
  {
    id: "tm-3",
    name: "Suki Tanaka",
    role: "Retouch Lead · Colourist",
    bio: "Grades every select by hand and will quietly remove the exit sign from your wedding photo. Believes skin should look like skin.",
    gear: "Eizo CG2700S · DaVinci",
    hue: "ice",
    published: true,
  },
  {
    id: "tm-4",
    name: "Theo Brandt",
    role: "Studio Manager · Producer",
    bio: "Keeps the calendar sane, the permits filed and the beagle out of the paper-backdrop room. Answers the desk within the hour.",
    gear: "ColourChecker · Espresso",
    hue: "steel",
    published: true,
  },
];

/* ————— booking constants ————— */
export const TIME_SLOTS = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"];

export const STUDIO = {
  name: "IMAGINE",
  addr: "14 Mercer Lane, Pearl District",
  city: "Portland, OR 97209",
  phone: "(503) 555-0114",
  email: "desk@imagine.studio",
  hours: [
    ["Tue – Fri", "10:00 – 19:00"],
    ["Saturday", "09:00 – 17:00"],
    ["Sun – Mon", "By appointment"],
  ] as [string, string][],
};

/* ————— seed bookings (first run only) ————— */
export const SEED_BOOKINGS: Booking[] = [
  { id: "b1", ref: "IM-3F7A", name: "Maya Lindqvist", email: "maya@lindqvist.se", phone: "(503) 555-2210", session: "Weddings & Elopements", packageId: "contact", date: "2026-03-14", time: "10:30", guests: 2, notes: "Ceremony at Dunmore Hall, golden-hour couple portraits are the priority.", status: "confirmed", createdAt: "2026-02-02T10:12:00.000Z" },
  { id: "b2", ref: "IM-K29C", name: "Daniel Okafor", email: "d.okafor@meridian.io", phone: "(503) 555-8841", session: "Portrait Sessions", packageId: "proof", date: "2026-02-27", time: "15:00", guests: 1, notes: "Executive headshots for a board profile — charcoal suit, cool grade.", status: "pending", createdAt: "2026-02-19T15:40:00.000Z" },
  { id: "b3", ref: "IM-91XD", name: "Hartline Atelier", email: "studio@hartline.co", phone: "(503) 555-0392", session: "Product & Still Life", packageId: "archive", date: "2026-03-02", time: "09:00", guests: 2, notes: "14 SKUs, fragrance line. Hard light, long shadows, cobalt glass.", status: "confirmed", createdAt: "2026-02-05T09:03:00.000Z" },
  { id: "b4", ref: "IM-M44E", name: "Priya Raman", email: "priya.r@postbox.com", phone: "(971) 555-1177", session: "Maternity & Newborn", packageId: "proof", date: "2026-02-21", time: "12:00", guests: 2, notes: "34 weeks — pale-blue fabric set requested.", status: "completed", createdAt: "2026-01-28T18:22:00.000Z" },
  { id: "b5", ref: "IM-7QZ2", name: "The Ferraro Family", email: "ferraros@home.net", phone: "(503) 555-6420", session: "Portrait Sessions", packageId: "contact", date: "2026-03-08", time: "13:30", guests: 5, notes: "Two kids (4 & 7), one very opinionated beagle. Location: studio couch set.", status: "pending", createdAt: "2026-02-22T12:51:00.000Z" },
  { id: "b6", ref: "IM-A08H", name: "Voss Magazine", email: "artdesk@voss.press", phone: "(212) 555-9910", session: "Fashion & Editorial", packageId: "archive", date: "2026-03-21", time: "09:00", guests: 4, notes: "Spring cover story. Sky/cobalt gel split, 6 looks, stylist arrives 08:00.", status: "confirmed", createdAt: "2026-02-11T11:11:00.000Z" },
  { id: "b7", ref: "IM-T55B", name: "Elena Brandt", email: "elena@brandt.law", phone: "(503) 555-7702", session: "Portrait Sessions", packageId: "proof", date: "2026-02-18", time: "16:30", guests: 1, notes: "", status: "cancelled", createdAt: "2026-02-01T08:45:00.000Z" },
  { id: "b8", ref: "IM-W13N", name: "Cascade Brew Co.", email: "events@cascadebrew.com", phone: "(503) 555-3131", session: "Events & Concerts", packageId: "contact", date: "2026-04-04", time: "18:00", guests: 3, notes: "Taproom anniversary — live band from 19:00, pit access confirmed.", status: "pending", createdAt: "2026-02-24T16:05:00.000Z" },
];
