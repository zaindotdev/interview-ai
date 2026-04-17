import Link from "next/link";

const sections = [
  {
    title: "1. Acceptance of Terms",
    items: [
      "By accessing or using Interview AI, you agree to be bound by these Terms of Service.",
      "If you do not agree with any part of these terms, you should not use the platform.",
    ],
  },
  {
    title: "2. Eligibility and Accounts",
    items: [
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You agree to provide accurate account information and keep it up to date.",
      "You are responsible for all activity occurring under your account.",
    ],
  },
  {
    title: "3. Service Description",
    items: [
      "Interview AI provides interview preparation tools, including AI mock interviews, resume analysis, and performance feedback.",
      "Some features may require an active paid subscription.",
      "Features may be modified, improved, or discontinued over time.",
    ],
  },
  {
    title: "4. Acceptable Use",
    items: [
      "You must not use the platform for unlawful, abusive, or fraudulent activities.",
      "You must not attempt to reverse engineer, disrupt, or compromise platform security.",
      "You must not upload malicious files or content intended to harm systems or users.",
    ],
  },
  {
    title: "5. User Content",
    items: [
      "You retain ownership of content you upload, including resumes and related text.",
      "You grant Interview AI permission to process uploaded content solely to provide and improve product functionality.",
      "You are responsible for ensuring that your uploaded content does not violate third-party rights.",
    ],
  },
  {
    title: "6. Subscriptions and Billing",
    items: [
      "Paid plans are billed through supported payment providers.",
      "Subscription access is tied to successful payment status.",
      "Pricing, plan limits, and billing cycles may change with notice through the platform.",
    ],
  },
  {
    title: "7. Intellectual Property",
    items: [
      "Interview AI branding, software, and platform content are protected by intellectual property laws.",
      "You may not copy, distribute, or create derivative works from platform materials without permission.",
    ],
  },
  {
    title: "8. Disclaimers",
    items: [
      "Interview AI is provided on an as-is and as-available basis.",
      "We do not guarantee specific interview outcomes, job offers, or uninterrupted availability.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    items: [
      "To the maximum extent permitted by law, Interview AI is not liable for indirect, incidental, or consequential damages.",
      "Our total liability for claims related to the service is limited to amounts you paid for the service in the relevant period.",
    ],
  },
  {
    title: "10. Termination",
    items: [
      "We may suspend or terminate access if these terms are violated or misuse is detected.",
      "You may stop using the service at any time and request account closure.",
    ],
  },
  {
    title: "11. Changes to Terms",
    items: [
      "We may update these terms to reflect legal, technical, or product changes.",
      "Updates become effective when posted, unless otherwise specified.",
    ],
  },
];

const TermsPage = () => {
  return (
    <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        <header className="border-border bg-card/80 rounded-2xl border p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-secondary-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Terms of Service
          </p>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Terms for using Interview AI
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">
            These terms govern your access to and use of Interview AI, including
            both free and subscription-based features.
          </p>
          <p className="text-muted-foreground border-border mt-3 inline-block rounded-full border px-2 py-1 text-xs">
            Effective date: April 17, 2026
          </p>
        </header>

        <div className="space-y-4">
          {sections.map((section) => (
            <article
              key={section.title}
              className="border-border bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur sm:p-6"
            >
              <h2 className="text-card-foreground text-lg font-semibold sm:text-xl">
                {section.title}
              </h2>
              <ul className="text-muted-foreground mt-3 space-y-2 text-sm leading-relaxed sm:text-base">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="border-border bg-card/80 rounded-2xl border p-5 text-sm text-muted-foreground shadow-sm backdrop-blur sm:p-6 sm:text-base">
          <h3 className="text-card-foreground text-lg font-semibold">Questions About These Terms?</h3>
          <p className="mt-2">
            If you need clarification on subscriptions, usage rights, or account
            policies, contact our support team.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="text-primary-foreground inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Contact Support
            </Link>
            <Link
              href="/privacy"
              className="border-border text-foreground hover:bg-muted inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            >
              View Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsPage;