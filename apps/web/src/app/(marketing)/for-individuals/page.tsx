import Link from "next/link";

const sections = [
  {
    title: "Start simply",
    body: "Set up routines for one person without introducing a heavy care-management workflow.",
  },
  {
    title: "Use voice guidance when it helps",
    body: "Record familiar prompts or use spoken fallback support when a routine needs more than pictures alone.",
  },
  {
    title: "Grow only when you need to",
    body: "Start with a free or individual plan, then move into shared caregiver access later if support needs expand.",
  },
];

export default function ForIndividualsPage() {
  return (
    <div className="page-shell space-y-12 py-18">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
        <div className="space-y-5">
          <p className="eyebrow">For Individuals</p>
          <h1 className="display max-w-4xl text-5xl text-foreground md:text-[4rem]">
            Built for households that need a calm, dependable routine tool.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted">
            sovia works well when one person, one household, or one primary caregiver
            needs visual routines and optional voice guidance without stepping into a
            larger organizational workflow.
          </p>
        </div>
        <div className="panel bg-[rgba(252,251,248,0.96)] p-6">
          <p className="eyebrow">Best fit</p>
          <p className="mt-3 text-base leading-8 text-muted">
            Individuals, households, and solo caregivers who want a simple path from
            setup to daily routine use.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="panel p-7">
            <p className="eyebrow">Why it works</p>
            <h2 className="mt-4 text-[1.72rem] font-semibold text-foreground">{section.title}</h2>
            <p className="mt-4 text-base leading-7 text-muted">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="panel p-7">
          <p className="eyebrow">What you get</p>
          <ul className="mt-5 space-y-3 text-base leading-8 text-muted">
            <li>Image-first routines that stay easy to follow.</li>
            <li>Free plans support up to 2 routines with up to 6 steps per routine.</li>
            <li>Optional voice guidance with a free-plan taste and unlimited access on paid plans.</li>
            <li>Simple mobile execution with offline-ready routine access.</li>
            <li>A clean upgrade path if more caregivers or more users need to be added later.</li>
          </ul>
        </div>
        <div className="panel bg-[rgba(246,250,248,0.96)] p-7">
          <p className="eyebrow">Getting started</p>
          <p className="mt-4 text-base leading-8 text-muted">
            The free plan is permanent, not time-limited. It gives you a useful starting point
            for trying the platform before deciding whether longer routines, unlimited routines,
            or voice prompts would make everyday use easier.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/pricing" className="button-primary">
              View Individual Plans
            </Link>
            <Link href="/contact" className="button-secondary">
              Ask a Question
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
