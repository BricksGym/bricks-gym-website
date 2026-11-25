/**
 * Rules for the online membership application. Used by the form (to show
 * errors as you type) and again on the server (so nobody can skip them).
 */
import { z } from "zod";
import { additionalMember, plans, rules, type PlanId } from "@/config/gym";
import { ageStatus } from "@/lib/age";

const name = z.string().trim().min(1, "Required").max(60, "Too long");
const phone = z
  .string()
  .trim()
  .refine((v) => v.replace(/\D/g, "").length === 10, "Enter a 10-digit phone number");
const optionalPhone = z
  .string()
  .trim()
  .refine((v) => v === "" || v.replace(/\D/g, "").length === 10, "Enter a 10-digit phone number");
const email = z.string().trim().max(120).pipe(z.email("Enter a valid email"));
const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email");
const birthdate = z.string().refine((v) => ageStatus(v).kind !== "invalid", "Enter a valid date");
const dlNumber = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{4,20}$/, "Enter a valid license number");
const state = z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Use 2 letters, e.g. CA");

export const addressSchema = z.object({
  street: z.string().trim().min(3, "Required").max(120),
  city: z.string().trim().min(2, "Required").max(60),
  state,
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Enter a 5-digit ZIP"),
});

export const primarySchema = z
  .object({
    firstName: name,
    lastName: name,
    birthdate,
    cellPhone: phone,
    homePhone: optionalPhone,
    email,
    dlNumber: rules.collectDriversLicense ? dlNumber : z.string().optional(),
    dlState: rules.collectDriversLicense ? state : z.string().optional(),
  })
  .extend(addressSchema.shape)
  .superRefine((p, ctx) => {
    const s = ageStatus(p.birthdate);
    if (s.kind === "too-young" || s.kind === "minor") {
      ctx.addIssue({
        code: "custom",
        path: ["birthdate"],
        message: `The Primary member must be ${rules.adultAge} or older. A parent or guardian should apply as the Primary member and add the teen as a family member.`,
      });
    }
  });

export const familyMemberSchema = z
  .object({
    firstName: name,
    lastName: name,
    birthdate,
    relationship: z.string().trim().min(1, "Required").max(40),
    sameAddress: z.boolean(),
    street: z.string().trim().max(120),
    city: z.string().trim().max(60),
    state: z.string().trim().toUpperCase().max(2),
    zip: z.string().trim().max(10),
    cellPhone: optionalPhone,
    email: optionalEmail,
    dlNumber: z.string().trim().toUpperCase().max(20),
    dlState: z.string().trim().toUpperCase().max(2),
  })
  .superRefine((m, ctx) => {
    const s = ageStatus(m.birthdate);
    if (s.kind === "too-young") {
      ctx.addIssue({ code: "custom", path: ["birthdate"], message: `Members must be at least ${rules.minimumAge}.` });
    }
    if (!m.sameAddress) {
      const r = addressSchema.safeParse(m);
      if (!r.success) {
        for (const issue of r.error.issues) ctx.addIssue({ ...issue, code: "custom" } as never);
      }
    }
    // Adults need their own license; minors use the Primary's (parent/guardian).
    if (rules.collectDriversLicense && s.kind === "adult") {
      if (!dlNumber.safeParse(m.dlNumber).success) {
        ctx.addIssue({ code: "custom", path: ["dlNumber"], message: "Enter a valid license number" });
      }
      if (!state.safeParse(m.dlState).success) {
        ctx.addIssue({ code: "custom", path: ["dlState"], message: "Use 2 letters, e.g. CA" });
      }
    }
  });

const planIds = plans.map((p) => p.id) as [PlanId, ...PlanId[]];

export const applicationSchema = z
  .object({
    plan: z.enum(planIds),
    primary: primarySchema,
    family: z.array(familyMemberSchema).max(additionalMember.maxOnlineApplication),
    childCareKids: z.number().int().min(0).max(6),
    notes: z.string().trim().max(1000),
    agreeTermsReviewed: z.literal(true, { error: "Please confirm you've reviewed the membership terms." }),
    agreeAutoRenew: z.literal(true, { error: "Please confirm you understand automatic renewal." }),
    agreeGuardian: z.boolean(),
    agreeContact: z.literal(true, { error: "Please confirm we may contact you about your application." }),
    turnstileToken: z.string().max(4096).optional(),
    company: z.string().max(0).optional(), // hidden spam trap; real people leave it empty
  })
  .superRefine((a, ctx) => {
    const hasMinor = a.family.some((m) => ageStatus(m.birthdate).kind === "minor");
    if (hasMinor && !a.agreeGuardian) {
      ctx.addIssue({
        code: "custom",
        path: ["agreeGuardian"],
        message: "Please confirm you are the parent or legal guardian of the members under 18.",
      });
    }
  });

export type Application = z.infer<typeof applicationSchema>;
export type PrimaryInput = z.input<typeof primarySchema>;
export type FamilyInput = z.input<typeof familyMemberSchema>;

/** Turn validation issues into { "primary.email": "message" }. */
export function issuesToErrors(issues: { path: PropertyKey[]; message: string }[], prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = prefix + i.path.map(String).join(".");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}
