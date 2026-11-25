/**
 * ============================================================================
 *  MEMBERSHIP AGREEMENT — ONE SOURCE FOR THE WEBSITE AND CLUB SYSTEMS
 * ============================================================================
 *  DRAFT FOR ATTORNEY REVIEW. Not legal advice.
 *
 *  This file is the single source of the membership agreement text.
 *  - The website's Membership Terms page shows it:   /legal/membership-terms
 *  - A plain-text copy for Club Systems is at:        /legal/membership-terms.txt
 *    (open it, copy everything, and send it to Club Systems to load as the
 *    agreement template, so both always match word for word).
 *
 *  Prices and fees come from src/config/gym.ts automatically.
 *  Text in **double asterisks** is shown in bold.
 * ============================================================================
 */
import { afterTerm, business, fees, plans, rules } from "@/config/gym";
import { earlyCancellationText, money } from "@/lib/pricing";
import { ordinal } from "@/lib/fee-list";

export const AGREEMENT_VERSION = "DRAFT 2026-11-25";

export type AgreementSection = {
  id: string;
  title: string;
  /** Paragraphs. Lines starting with "- " are shown as bullet points. */
  body: string[];
  /** Member initials this section on the signed agreement. */
  initial?: boolean;
  /** Shown in large bold type (required for the right-to-cancel notice). */
  emphasized?: boolean;
};

export function agreementSections(): AgreementSection[] {
  const termPlans = plans.filter((p) => p.termMonths);
  const m2m = plans.find((p) => !p.termMonths);
  const f = fees;
  const gym = business.name;

  return [
    {
      id: "parties",
      title: "About this agreement",
      body: [
        `This Membership Agreement is between ${business.legalName}, doing business as ${gym}, ${business.address.street}, ${business.address.city}, ${business.address.state} ${business.address.zip} ("the Gym", "we"), and the member(s) named on the membership record ("you").`,
        "The **Primary member** is the person who signs this agreement. The Primary member is financially responsible for all additional members on the membership.",
        "The membership record lists: membership number, Primary member number, each member's name, birthdate, mailing address, phone numbers, email, driver's license number (a parent or guardian's if the member is a minor), the plan and term, the enrollment fee, first and last month's dues, total paid at signing, and the payment schedule (number of payments, monthly amount and first payment date).",
      ],
    },

    // ------------------------------------------------------------------
    // Authorizations (each initialed by the member)
    // ------------------------------------------------------------------
    {
      id: "term",
      title: "1. Term memberships",
      initial: true,
      body: [
        `Term memberships are available for ${termPlans.map((p) => `${p.termMonths}`).join(", ").replace(/, ([^,]*)$/, " or $1")} months. Your membership is in force for the full initial term you choose.`,
        `**After the initial term ends, your membership automatically continues month to month at the same monthly rate until you or the Gym gives ${afterTerm.noticeDays} days' written notice.**`,
      ],
    },
    ...(m2m
      ? [
          {
            id: "month-to-month",
            title: "2. Month-to-month memberships",
            initial: true,
            body: [
              `A month-to-month membership has no minimum term. It continues each month until you or the Gym gives ${afterTerm.noticeDays} days' written notice.`,
            ],
          },
        ]
      : []),
    {
      id: "last-month",
      title: "3. Last month's dues",
      initial: true,
      body: [
        "If your plan collects last month's dues at signing, that payment is applied to the final month of your membership when you cancel with the required written notice. The membership record shows whether last month's dues were collected.",
      ],
    },
    {
      id: "annual-fee",
      title: "4. Annual Club Improvement fee",
      initial: true,
      body: [
        `A Club Improvement fee of ${money(f.annualClubImprovement.amount)}${f.annualClubImprovement.perMember ? " per member" : ""} is charged once a year, in ${f.annualClubImprovement.month}. The Primary member pays this fee for all additional members.`,
      ],
    },
    {
      id: "non-payment",
      title: "5. Non-payment",
      initial: true,
      body: [
        `If ${f.collections.consecutiveMonthsUnpaid} consecutive months go unpaid, or the past-due balance is more than ${money(f.collections.pastDueSinglePlan)} on a single membership (${money(f.collections.pastDueMultiplePlan)} on a membership with additional members), the account may be sent to a collection agency for the past-due balance plus the remaining months of the term, cancellation fees and collection fees.`,
      ],
    },
    {
      id: "auto-pay",
      title: "6. Automatic payments and automatic renewal",
      initial: true,
      body: [
        "You authorize the Gym, through its billing provider (Club Systems), to charge your monthly dues, the annual Club Improvement fee and any other fees you agree to, to the card or bank account you provide, until you cancel as described in this agreement.",
        `A fee of ${money(f.returnedPayment)} applies to each returned or failed payment.`,
        "**Automatic renewal:** your membership renews automatically each month after the initial term (or each month, for month-to-month) and will be charged at the same monthly rate until you cancel. **You can cancel online at any time** on our website's cancellation page, as well as in person, by email or by mail (see section 9 of the Conditions).",
        "Your consent to automatic renewal is given separately, by a checkbox or initials, and is not pre-checked.",
        "We will send you an acknowledgment of these terms, including how to cancel, after you join; a yearly reminder of your membership terms; and notice at least 7 days (and no more than 30 days) before any change in price, explaining the change and how to cancel.",
      ],
    },
    {
      id: "manual-billing",
      title: "7. Paying without automatic payments",
      initial: true,
      body: [
        `If you are approved to pay each month yourself, payment is due by the ${ordinal(f.manualBilling.dueDayOfMonth)} of each month. A ${money(f.lateCharge.amount)} late charge applies when a payment is more than ${f.lateCharge.afterDays} days past due, and a ${money(f.manualBilling.monthlyProcessingFee)} monthly processing fee applies.`,
      ],
    },
    {
      id: "release",
      title: "8. Release of liability",
      initial: true,
      body: [
        "You have been advised to consult a physician before starting any exercise program. You understand that exercise and the use of gym equipment and facilities involve risk of injury, illness (including contagious illnesses such as COVID-19) and even death.",
        "You voluntarily accept these risks and release the Gym, its owners, employees and agents from all claims for injury, illness, loss or damage arising from your use of the Gym, including claims based on the Gym's negligence, to the fullest extent permitted by law. This release also applies to your guests and to minors on your membership.",
      ],
    },
    {
      id: "right-to-cancel",
      title: "9. Your right to cancel",
      initial: true,
      emphasized: true,
      body: [
        `**YOU, THE BUYER, MAY CANCEL THIS AGREEMENT AT ANY TIME BEFORE MIDNIGHT OF THE GYM'S ${["", "FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH"][rules.rightToCancelBusinessDays] ?? rules.rightToCancelBusinessDays} BUSINESS DAY AFTER THE DATE YOU SIGN IT, EXCLUDING SUNDAYS AND HOLIDAYS.**`,
        `**To cancel, deliver or mail a signed and dated notice stating that you are cancelling this agreement to: ${business.noticeAddress}, or email it to ${business.email}, or use the cancellation page on our website. If you cancel within this period, all money you paid will be refunded within 10 days of our receiving your notice.**`,
      ],
    },
    {
      id: "conditions-ack",
      title: "10. Club conditions",
      initial: true,
      body: ["You have read and agree to the Conditions of Membership below."],
    },

    // ------------------------------------------------------------------
    // Conditions of membership
    // ------------------------------------------------------------------
    {
      id: "c-rules",
      title: "Conditions 1. General rules",
      body: [
        "- Check in at the front desk on every visit.",
        "- Leave the Gym by closing time.",
        "- No loud, abusive or offensive language.",
        "- No alcohol, smoking, vaping or drugs.",
        "- No posting or handing out flyers or advertising without permission.",
        "- Members are not allowed behind the front desk.",
        "- Management may revoke the membership of anyone whose behavior harms the operation of the Gym or the safety of others.",
      ],
    },
    {
      id: "c-floor",
      title: "Conditions 2. Exercise floor",
      body: [
        "- Athletic clothing and athletic shoes only: no swimsuits, underwear, street clothes or jeans.",
        "- No food on the exercise floor.",
        "- Re-rack your weights and lower them with control. Do not drop or abuse equipment.",
      ],
    },
    {
      id: "c-hours",
      title: "Conditions 3. Hours",
      body: [
        "Hours may change. The Gym may close on holidays and for up to two weeks a year for maintenance.",
      ],
    },
    {
      id: "c-participation",
      title: "Conditions 4. Using the Gym",
      body: ["Not using the Gym is not a reason for a refund or for cancelling this agreement."],
    },
    {
      id: "c-age",
      title: "Conditions 5. Age",
      body: [
        `Members must be at least ${rules.minimumAge}. Members under ${rules.adultAge} need a parent or guardian to sign this agreement. Members aged ${rules.minimumAge}–${rules.accompaniedThroughAge} must be accompanied by a parent or guardian while in the Gym.`,
      ],
    },
    {
      id: "c-childcare",
      title: "Conditions 6. Child care",
      body: [
        `Child care is ${money(f.childCare.perVisit)} per child per visit or ${money(f.childCare.monthly)} per child per month, for children ${f.childCare.minimumAgeMonths} months and older. Rates and availability may change.`,
      ],
    },
    {
      id: "c-guests",
      title: "Conditions 7. Non-members",
      body: [`Non-members pay a ${money(f.dayPass)} day-use fee.`],
    },
    {
      id: "c-nonrefundable",
      title: "Conditions 8. Non-refundable fees",
      body: [
        "The enrollment fee, last month's dues and paid-in-full fees are non-refundable, except (a) when you cancel within the right-to-cancel period in section 9 above, (b) as described in Conditions 11 and 12, and (c) as required by law. Closures ordered by the government or the property owner, and natural disasters, are covered by Condition 16.",
      ],
    },
    {
      id: "c-termination",
      title: "Conditions 9. Ending your membership",
      body: [
        `After the initial term, or for month-to-month memberships, either you or the Gym may end the membership with ${afterTerm.noticeDays} days' written notice. You pay all amounts owed through the end of the notice period.`,
        `To end a term membership before the term is over, give ${afterTerm.noticeDays} days' written, signed notice and pay the early cancellation fee for your plan plus any past-due balance:`,
        ...termPlans.map((p) => `- ${p.name} plan: ${earlyCancellationText(p)}`),
        "**Written notice may be given online through our website's cancellation page, in person at the front desk, by email from the email address on your account, or by first-class mail to " +
          business.noticeAddress +
          ".**",
      ],
    },
    {
      id: "c-freeze",
      title: "Conditions 10. Freezing your membership",
      body: [
        `You may freeze your membership for ${f.freeze.minMonths} to ${f.freeze.maxMonthsPerYear} months per year at ${money(f.freeze.perMonth)} per month, paid in advance. A medical hold is free for up to ${f.freeze.medicalHoldMaxMonths} months with a doctor's note. You may not use the Gym while frozen, and frozen months do not count toward your term.`,
        `If a medical condition prevents you from using the Gym, you may cancel with a doctor's note for ${earlyCancellationLike(f.medicalCancellation)}.`,
      ],
    },
    {
      id: "c-relocation",
      title: "Conditions 11. Moving away",
      body: [
        `If you move more than ${f.relocationCancellation.minMiles} miles from the Gym, you may cancel with proof of your new address for a ${money(f.relocationCancellation.fee)} cancellation fee.`,
      ],
    },
    {
      id: "c-death",
      title: "Conditions 12. Death or disability",
      body: [
        "If a member dies, the member's estate is released from all future payments. If a member becomes disabled and cannot use the Gym, the member may cancel as described in Condition 10.",
      ],
    },
    {
      id: "c-default",
      title: "Conditions 13. Default",
      body: [
        `A payment more than ${f.lateCharge.afterDays} days late is a default. On default, the remaining balance of the term may become due, along with reasonable collection costs, court costs and attorney's fees. Returned-payment and late fees apply as stated above.`,
      ],
    },
    {
      id: "c-amend",
      title: "Conditions 14. Changes to these conditions",
      body: [
        "The Gym may update these conditions and its rules. We will notify you of changes in advance, and of any price change at least 7 days (and no more than 30 days) before it takes effect, with instructions for cancelling.",
      ],
    },
    {
      id: "c-property",
      title: "Conditions 15. Personal property and damage",
      body: [
        "The Gym is not responsible for lost or stolen items. Members are responsible for damage they or their guests cause.",
      ],
    },
    {
      id: "c-unavailability",
      title: "Conditions 16. When the Gym is unavailable",
      body: [
        "The Gym is not liable for closures caused by equipment breakdowns, fire, natural disasters, government orders, actions of the property owner or other events outside its control.",
      ],
    },
    {
      id: "c-binding",
      title: "Conditions 17. Binding agreement",
      body: ["This agreement is legally binding whether or not you use the Gym."],
    },
    {
      id: "c-arbitration",
      title: "Conditions 18. Arbitration",
      body: [
        "Any dispute over $1,000 arising from this agreement will be resolved by binding arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules. You and the Gym each waive the right to a jury trial for those disputes.",
      ],
    },
    {
      id: "signatures",
      title: "Signatures",
      body: [
        "By signing, you confirm that you have read this agreement, including the right-to-cancel notice, and received a copy.",
        "- Primary member signature and date",
        "- Parent or guardian signature and date (if a member is under 18)",
        `- ${gym} representative signature and date`,
      ],
    },
  ];
}

function earlyCancellationLike(x: { fee: number; orRemainingDuesIfLess: boolean }) {
  return x.orRemainingDuesIfLess ? `${money(x.fee)} or the remaining months of your contract, whichever is less` : money(x.fee);
}

/** Plain text version, for pasting into Club Systems. */
export function agreementPlainText(): string {
  const strip = (s: string) => s.replace(/\*\*/g, "");
  const out: string[] = [
    `${business.name.toUpperCase()} MEMBERSHIP AGREEMENT`,
    `Version: ${AGREEMENT_VERSION} (draft for attorney review)`,
    "",
  ];
  let inConditions = false;
  for (const s of agreementSections()) {
    if (!inConditions && s.id.startsWith("c-")) {
      inConditions = true;
      out.push("CONDITIONS OF MEMBERSHIP", "");
    }
    out.push(s.title.toUpperCase().replace(/^CONDITIONS /, ""));
    for (const p of s.body) out.push(strip(p));
    if (s.initial) out.push("Initials: ________");
    out.push("");
  }
  return out.join("\n");
}
