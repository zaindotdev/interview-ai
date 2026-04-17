import Link from "next/link";

const sections = [
  {
    title: "1. Information We Collect",
    items: [
      "Account details such as name, email address, and username.",
      "Profile and subscription-related details required for billing and account access.",
      "Resume files and job descriptions you choose to upload for analysis.",
      "Interview session metadata and generated feedback reports.",
    ],
  },
  {
    title: "2. How We Use Information",
    items: [
      "Provide core product features such as mock interviews, transcript-based analysis, and progress tracking.",
      "Personalize interview prompts and feedback based on your uploaded content.",
      "Operate subscription, billing, and account security workflows.",
      "Respond to support requests and improve platform quality over time.",
    ],
  },
  {
    title: "3. Data Sharing",
    items: [
      "We do not sell your personal information.",
      "Limited data may be processed by trusted infrastructure providers for authentication, payments, storage, and email delivery.",
      "We may disclose information when required by law, regulation, or legal process.",
    ],
  },
  {
    title: "4. Data Retention",
    items: [
      "Account and subscription data is retained while your account is active.",
      "Uploaded resume and interview records are retained to support your dashboard history and analytics.",
      "You can request account or data deletion through the support channel listed below.",
    ],
  },
  {
    title: "5. Security",
    items: [
      "We apply reasonable technical and organizational safeguards to protect user data.",
      "No internet service can be fully risk-free, but we continuously work to minimize exposure and unauthorized access.",
    ],
  },
  {
    title: "6. Cookies and Tracking",
    items: [
      "We use essential cookies and similar technologies to maintain authentication and core session functionality.",
      "Analytics and product improvement tooling may collect aggregated usage patterns.",
    ],
  },
  {
    title: "7. Your Choices",
    items: [
      "Update your profile and account settings from your dashboard.",
      "Contact support to request data access, correction, or deletion.",
      "You may stop using the service at any time and request account closure.",
    ],
  },
  {
    title: "8. Policy Updates",
    items: [
      "We may update this Privacy Policy from time to time to reflect product, legal, or infrastructure changes.",
      "Material changes will be reflected on this page with an updated effective date.",
    ],
  },
];

const PrivacyPage = () => {
  return (
    <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        <header className="border-border bg-card/80 rounded-2xl border p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-secondary-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Privacy Policy
          </p>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Your privacy matters at Interview AI
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">
            This policy explains what information we collect, how we use it, and
            the choices you have regarding your data when using Interview AI.
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
          <h3 className="text-card-foreground text-lg font-semibold">Contact Us</h3>
          <p className="mt-2">
            For privacy-related questions, requests, or data deletion support,
            please use our contact form.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="text-primary-foreground inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Contact Support
            </Link>
            <Link
              href="/help"
              className="border-border text-foreground hover:bg-muted inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            >
              Visit Help Center
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPage;
