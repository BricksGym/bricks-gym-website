/**
 * ============================================================================
 *  BRICKS GYM — SITE SETTINGS
 * ============================================================================
 *
 *  This is the ONE file to edit for prices, fees, hours, contact details and
 *  links. Change a number here and it updates everywhere on the site: plan
 *  cards, the comparison table, the join form's cost summary, the FAQ and the
 *  Membership Terms page.
 *
 *  HOW TO EDIT
 *  - Money is written in dollars, e.g. 29.99 (no "$" sign, no commas).
 *  - Text goes inside quotes: "like this".
 *  - Anything marked  // PLACEHOLDER  is filler that still needs a real value.
 *  - After editing, save the file. The site reloads by itself while
 *    `npm run dev` is running.
 *
 *  Search this file for "PLACEHOLDER" to find everything still to fill in.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// 1. LAUNCH SWITCH
// ---------------------------------------------------------------------------
/**
 * While true, the site shows small "sample pricing" notices and "coming soon"
 * placeholders so nobody mistakes filler prices for real ones.
 * Set to false only once every PLACEHOLDER below has a real value.
 */
export const PRELAUNCH = true;

// ---------------------------------------------------------------------------
// 2. BUSINESS DETAILS
// ---------------------------------------------------------------------------
export const business = {
  name: "Bricks Gym",
  /** Shown as "Formerly ___" in the bar at the top of every page. Empty ("") = hidden. */
  formerName: "Body Zone",
  /** Legal owner name for contracts and the privacy policy. */
  legalName: "[LEGAL BUSINESS NAME — PLACEHOLDER]", // PLACEHOLDER (still changing)
  tagline: "Old-school iron. Watsonville strong.",
  description:
    "Bricks Gym is an independent, family-friendly gym on Main Street in Watsonville, CA, with free weights and cardio.",
  address: {
    street: "1810 Main Street",
    city: "Watsonville",
    state: "CA",
    zip: "95076",
  },
  /** From public listings for this address — confirm before launch. */
  phone: "(831) 728-1280", // PLACEHOLDER (from an online listing — confirm)
  /** Public email shown on the site. Empty ("") = hidden. Use a Bricks Gym address, e.g. hello@thebricksgym.com. */
  email: "", // PLACEHOLDER (needed before launch: members must be able to cancel by email)
  /** Where membership applications, contact messages and cancellations are sent. Never shown on the site. */
  inboxEmail: "831bodyzone@gmail.com",
  /** Mailing address for written notices (cancellations, etc.). */
  noticeAddress: "Bricks Gym, Attn: Owner, 1810 Main Street, Watsonville, CA 95076",
  /** Website address once you buy a domain, no trailing slash. */
  siteUrl: "https://thebricksgym.com", // chosen domain — must be purchased and connected in Vercel
  social: {
    instagram: "", // PLACEHOLDER e.g. "https://instagram.com/bricksgym"
    facebook: "", // PLACEHOLDER
    tiktok: "", // PLACEHOLDER
    googleBusinessProfile: "", // PLACEHOLDER (your Google Maps listing link)
  },
};

// ---------------------------------------------------------------------------
// 3. HOURS
// ---------------------------------------------------------------------------
/** From a 2026 online listing for this location — confirm before launch. */
export const hours: { days: string; open: string; close: string }[] = [
  { days: "Monday – Thursday", open: "5:00 AM", close: "11:00 PM" },
  { days: "Friday", open: "5:00 AM", close: "10:00 PM" },
  { days: "Saturday", open: "6:00 AM", close: "8:00 PM" },
  { days: "Sunday", open: "8:00 AM", close: "8:00 PM" },
];
/** Same hours in Google's format (used for search results). Keep in sync. */
export const hoursForGoogle = [
  { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "05:00", closes: "23:00" },
  { dayOfWeek: ["Friday"], opens: "05:00", closes: "22:00" },
  { dayOfWeek: ["Saturday"], opens: "06:00", closes: "20:00" },
  { dayOfWeek: ["Sunday"], opens: "08:00", closes: "20:00" },
];
/** Days the gym is closed (also not counted as "business days" for the right to cancel). */
export const holidaysClosed = ["Thanksgiving Day", "Christmas Day", "New Year's Day"]; // PLACEHOLDER

// ---------------------------------------------------------------------------
// 4. MEMBERSHIP PLANS
// ---------------------------------------------------------------------------
export type PlanId = "month-to-month" | "6-month" | "12-month" | "24-month";

export type Plan = {
  id: PlanId;
  name: string;
  /** Length of the commitment in months. null = month-to-month (no term). */
  termMonths: number | null;
  /** One-time fee paid at signup by the Primary member. */
  enrollmentFee: number;
  /** Monthly dues for the Primary member. */
  monthlyDues: number;
  /** Is the last month's dues collected at signup? */
  lastMonthDueAtSignup: boolean;
  /** Fee to end the contract before the term is over. null = none. */
  earlyCancellation: null | {
    fee: number;
    /** true = "fee or the remaining dues, whichever is less". */
    orRemainingDuesIfLess: boolean;
  };
  /** Short selling point shown on the card. */
  blurb: string;
  /** Highlight this card as the best value. */
  featured?: boolean;
};

export const plans: Plan[] = [
  {
    id: "month-to-month",
    name: "Month-to-Month",
    termMonths: null,
    enrollmentFee: 49, // PLACEHOLDER
    monthlyDues: 44.99, // PLACEHOLDER
    lastMonthDueAtSignup: false, // PLACEHOLDER
    earlyCancellation: null,
    blurb: "No long-term commitment. Cancel with 30 days' written notice.",
  },
  {
    id: "6-month",
    name: "6-Month",
    termMonths: 6,
    enrollmentFee: 49, // PLACEHOLDER
    monthlyDues: 39.99, // PLACEHOLDER
    lastMonthDueAtSignup: true, // PLACEHOLDER
    earlyCancellation: { fee: 149, orRemainingDuesIfLess: true }, // PLACEHOLDER (6-month fee not set yet)
    blurb: "A short commitment to build the habit.",
  },
  {
    id: "12-month",
    name: "12-Month",
    termMonths: 12,
    enrollmentFee: 29, // PLACEHOLDER
    monthlyDues: 34.99, // PLACEHOLDER
    lastMonthDueAtSignup: true, // PLACEHOLDER
    earlyCancellation: { fee: 199, orRemainingDuesIfLess: true }, // from current agreement
    blurb: "Our most popular plan. Lower dues for a year of work.",
    featured: true,
  },
  {
    id: "24-month",
    name: "24-Month",
    termMonths: 24,
    enrollmentFee: 0, // PLACEHOLDER
    monthlyDues: 29.99, // PLACEHOLDER
    lastMonthDueAtSignup: true, // PLACEHOLDER
    // $299 is from the current agreement. PLACEHOLDER: confirm whether
    // "or remaining dues, whichever is less" also applies.
    earlyCancellation: { fee: 299, orRemainingDuesIfLess: true },
    blurb: "The lowest monthly rate. For the long haul.",
  },
];

/** Family / additional members. The Primary member pays for all of them. */
export const additionalMember = {
  /** Enrollment fee per additional member. */
  enrollmentFee: 0, // PLACEHOLDER
  /** Monthly dues per additional member, by plan. */
  monthlyDues: {
    "month-to-month": 29.99, // PLACEHOLDER
    "6-month": 27.99, // PLACEHOLDER
    "12-month": 24.99, // PLACEHOLDER
    "24-month": 19.99, // PLACEHOLDER
  } satisfies Record<PlanId, number>,
  /** Most additional members allowed on one online application. */
  maxOnlineApplication: 5,
};

/** What happens after the initial term ends (from the current agreement). */
export const afterTerm = {
  noticeDays: 30,
  description:
    "After your initial term, your membership continues month to month at the same monthly rate until you or the gym gives 30 days' written notice.",
};

// ---------------------------------------------------------------------------
// 5. FEES (current agreement amounts — all adjustable)
// ---------------------------------------------------------------------------
export const fees = {
  /** Yearly "Club Improvement" fee, charged per member, paid by the Primary. */
  annualClubImprovement: {
    amount: 45, // PLACEHOLDER (subject to change)
    month: "March", // PLACEHOLDER (March, June or November)
    perMember: true,
  },
  dayPass: 15,
  freeze: {
    perMonth: 10,
    minMonths: 1,
    maxMonthsPerYear: 3,
    medicalHoldMaxMonths: 6, // free with a doctor's note
  },
  medicalCancellation: { fee: 149, orRemainingDuesIfLess: true },
  relocationCancellation: { fee: 99, minMiles: 25 },
  returnedPayment: 15,
  lateCharge: { amount: 10, afterDays: 10 },
  /** For members who pay each month themselves instead of auto-pay. */
  manualBilling: { dueDayOfMonth: 5, monthlyProcessingFee: 10 },
  collections: {
    consecutiveMonthsUnpaid: 3,
    pastDueSinglePlan: 100,
    pastDueMultiplePlan: 150,
  },
};

// ---------------------------------------------------------------------------
// 6. MEMBERSHIP RULES
// ---------------------------------------------------------------------------
export const rules = {
  minimumAge: 14,
  /** Members under this age need a parent/guardian signature. */
  adultAge: 18,
  /** Members up to and including this age must be accompanied by a parent. */
  accompaniedThroughAge: 16,
  /** Right to cancel a new contract (California health studio law). */
  rightToCancelBusinessDays: 5,
  /** Collect driver's license numbers on the online application. */
  collectDriversLicense: true,
};

// ---------------------------------------------------------------------------
// 6b. ONLINE APPLICATION
// ---------------------------------------------------------------------------
/**
 * The website's join form collects the applicant's details and emails them
 * to `business.inboxEmail`. You enter them into Club Systems yourself (and
 * assign the member number there). Payment and the signed agreement happen
 * through Club Systems — the website never takes card or bank details.
 */
export const onlineApplication = {
  responseTime: "within 1 business day",
  nextSteps: [
    "We review your application and set up your membership in our member system.",
    "We contact you to schedule a quick visit to the front desk (bring a photo ID).",
    "You read and sign your membership agreement and set up payment securely with us. Nothing is charged until then.",
    "You get your member number and can start training.",
  ],
};

// ---------------------------------------------------------------------------
// 7. CLUB SYSTEMS LINKS
// ---------------------------------------------------------------------------
/**
 * Fill these in as Club Systems gives them to you. Empty ("") = not available
 * yet, and the site falls back to our own application form / front desk.
 */
export const clubSystems = {
  /** Member Portal link (billing, update card, freeze, cancel). */
  memberPortalUrl: "", // PLACEHOLDER
  /** Member Portal App store links. */
  appStoreUrl: "", // PLACEHOLDER
  googlePlayUrl: "", // PLACEHOLDER
  /** Class scheduling widget link (shown on the Classes page). */
  schedulingWidgetUrl: "", // PLACEHOLDER
  /**
   * Club Systems "Join Now Page" link per plan. While these are empty, Join
   * buttons open our own online application, which emails you the details to
   * enter into Club Systems yourself.
   */
  joinNowUrls: {
    "month-to-month": "",
    "6-month": "",
    "12-month": "",
    "24-month": "",
    "day-pass": "",
  } as Record<PlanId | "day-pass", string>,
  /** Web address Club Systems pages are served from (for security settings). */
  allowedOrigins: [] as string[], // PLACEHOLDER e.g. ["https://xyz.healthclubsystems.com"]
};

// ---------------------------------------------------------------------------
// 8. AMENITIES, CLASSES, PHOTOS, REVIEWS
// ---------------------------------------------------------------------------
/**
 * Shown on the home and Classes & Amenities pages. Edit freely.
 * comingSoon: true shows a "Coming soon" tag (remove it once it's open).
 */
export const amenities: { name: string; description: string; comingSoon?: boolean }[] = [
  { name: "Free Weights", description: "Racks, plates, dumbbells and benches." }, // PLACEHOLDER
  { name: "Cardio", description: "Treadmills, bikes and more." }, // PLACEHOLDER
  { name: "Group Fitness", description: "Class schedule coming soon." }, // PLACEHOLDER
  { name: "Sauna", description: "Heat up and recover after your workout.", comingSoon: true },
];

// ---------------------------------------------------------------------------
// 8b. REMODEL (the "Remodel" tab)
// ---------------------------------------------------------------------------
/** Set show: false to hide the Remodel tab, banner link and home section once it's finished. */
export const remodel = {
  show: true,
  headline: "A huge remodel is underway",
  intro:
    "We're rebuilding the gym from the floor up. New equipment, more space and a whole new look are on the way, and we can't wait to show you.",
  /** Shown on the Remodel page. Add a date like "Spring 2027" when you know it. */
  timeline: "", // PLACEHOLDER e.g. "Finishing early 2027"
  upgrades: [
    { name: "New machines", description: "Brand-new strength and cardio equipment is on its way." },
    { name: "Bigger workout space", description: "More room to lift, stretch and train without waiting." },
    { name: "New flooring", description: "Fresh, durable gym flooring throughout." },
    { name: "Fresh paint", description: "Every wall repainted for a clean new look." },
    { name: "New sound system", description: "Better music to push you through every set." },
    { name: "Sauna", description: "A new sauna for recovery after your workout." },
  ],
  closing: "And that's just the start. Huge things are coming to Bricks Gym.",
};

/** Classes: add one line per class. Empty = "schedule coming soon". */
export const classes: { name: string; when: string; description: string }[] = [];

/** Personal training. Empty description = section hidden. */
export const personalTraining = {
  description: "", // PLACEHOLDER e.g. "One-on-one coaching. Ask at the front desk."
};

/**
 * Photos: put image files in /public/images and list them here, e.g.
 *   { src: "/images/weight-floor.jpg", alt: "The weight floor" }
 */
export const photos: { src: string; alt: string }[] = [];

/**
 * Real member reviews only, copied with permission (e.g. from Google).
 *   { quote: "...", name: "First name L.", source: "Google" }
 */
export const testimonials: { quote: string; name: string; source?: string }[] = [];

// ---------------------------------------------------------------------------
// 9. FREQUENTLY ASKED QUESTIONS (extra ones — the main ones are built in)
// ---------------------------------------------------------------------------
export const extraFaqs: { q: string; a: string }[] = [];
