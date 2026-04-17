import Link from "next/link";
import { ArrowRight, Compass, HeartHandshake, Sparkles, Target } from "lucide-react";

const principles = [
  {
    title: "Practical Feedback",
    description:
      "We focus on feedback you can actually apply in your next interview, not vague scoring.",
    icon: Target,
  },
  {
    title: "Accessible Preparation",
    description:
      "Interview coaching should be available to every job seeker, regardless of background.",
    icon: Compass,
  },
  {
    title: "Human-First Experience",
    description:
      "AI should support your growth with clarity and empathy while keeping you in control.",
    icon: HeartHandshake,
  },
];

const AboutPage = () => {
  return (
    <section className="bg-background relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl space-y-8">
        <header className="border-border bg-card/80 rounded-2xl border p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-secondary-foreground mb-2 inline-flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            About Interview AI
          </p>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Helping candidates prepare with confidence
          </h1>
          <p className="text-muted-foreground mt-3 max-w-4xl text-sm leading-relaxed sm:text-base">
            Interview AI was built to make interview preparation structured,
            realistic, and accessible. From resume-aware prompts to guided
            mock sessions and actionable reports, we help candidates practice
            smarter and present their best selves.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <article className="border-border bg-card/80 rounded-2xl border p-6 shadow-sm backdrop-blur sm:p-8">
            <h2 className="text-card-foreground text-2xl font-semibold">
              Our Story
            </h2>
            <div className="text-muted-foreground mt-4 space-y-4 text-sm leading-relaxed sm:text-base">
              <p>
                Many candidates struggle not because they lack potential, but
                because they do not get enough structured interview practice.
                Traditional prep can be expensive, inconsistent, or hard to fit
                into a busy schedule.
              </p>
              <p>
                Interview AI combines modern AI tooling with a practical learning
                flow so candidates can rehearse real scenarios, track progress,
                and continuously improve communication, clarity, and confidence.
              </p>
              <p>
                Our goal is simple: make high-quality interview coaching
                available to anyone serious about career growth.
              </p>
            </div>
          </article>

          <aside className="border-border bg-card/80 rounded-2xl border p-6 shadow-sm backdrop-blur sm:p-8">
            <h2 className="text-card-foreground text-2xl font-semibold">
              What You Can Do
            </h2>
            <ul className="text-muted-foreground mt-4 space-y-3 text-sm leading-relaxed sm:text-base">
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Run AI mock interviews tailored to your role and level.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Analyze resume alignment against your target job.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Review past sessions, transcripts, and progress trends.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Get structured feedback you can use immediately.</span>
              </li>
            </ul>
          </aside>
        </div>

        <section className="grid gap-5 md:grid-cols-3">
          {principles.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="border-border bg-card/80 rounded-2xl border p-5 shadow-sm backdrop-blur"
              >
                <div className="bg-secondary text-secondary-foreground mb-3 inline-flex rounded-full p-2">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-card-foreground text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {item.description}
                </p>
              </article>
            );
          })}
        </section>

        <div className="border-border bg-card/80 rounded-2xl border p-6 shadow-sm backdrop-blur sm:p-8">
          <h2 className="text-card-foreground text-2xl font-semibold">
            Start Preparing Today
          </h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed sm:text-base">
            Whether you are preparing for your first interview or aiming for your
            next major role, Interview AI is built to support your progress.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="text-primary-foreground inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
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

export default AboutPage;