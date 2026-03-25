import Link from "next/link";

const pillars = [
  {
    title: "Simple enough for daily use",
    body: "Create step-by-step routines with clear images, optional short text, and predictable flow for one person or an entire support setting.",
  },
  {
    title: "Flexible across support settings",
    body: "Use the same product for an individual household, a family care team, or a larger organization that needs staff visibility.",
  },
  {
    title: "Structured when teams need more",
    body: "Shared caregiver access, reporting, and device linking are available when your routines need more operational support.",
  },
];

const workflow = [
  "Create an image-led routine with ordered steps and optional voice guidance.",
  "Assign it to one person, a household device, or a supported user in a care setting.",
  "Run the routine on a calm mobile screen with low text load.",
  "Review completion activity later if your support setup needs visibility.",
];

export default function HomePage() {
  return (
    <div className="space-y-28 pb-28 pt-12">
      <section className="page-shell grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <p className="eyebrow">Routine support for every support system</p>
          <div className="space-y-6">
            <h1 className="display max-w-3xl text-5xl leading-[1.02] tracking-tight text-foreground md:text-[4.25rem]">
              A calm routine platform for individuals, families, and care teams.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              sovia helps households and care organizations build image-first routines,
              add voice guidance, run them offline, and expand into shared caregiver
              workflows only when they need more support.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/pricing" className="button-primary">
              View Plans
            </Link>
            <Link href="/for-care-orgs" className="button-secondary">
              For Care Orgs
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-muted">
            <span className="border border-line bg-[rgba(252,251,248,0.82)] px-3 py-2">
              Image-first routines
            </span>
            <span className="border border-line bg-[rgba(252,251,248,0.82)] px-3 py-2">
              Voice guidance
            </span>
            <span className="border border-line bg-[rgba(252,251,248,0.82)] px-3 py-2">
              Offline-ready
            </span>
          </div>
          <div className="grid gap-4 pt-3 sm:grid-cols-3">
            <div className="panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Setup</p>
              <p className="mt-3 text-3xl font-bold text-foreground">Minutes</p>
              <p className="mt-2 text-sm leading-6 text-muted">Fast pairing and routine publishing.</p>
            </div>
            <div className="panel bg-[rgba(252,251,248,0.98)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Mobile mode</p>
              <p className="mt-3 text-3xl font-bold text-foreground">Offline-ready</p>
              <p className="mt-2 text-sm leading-6 text-muted">Calm screens that keep working offline.</p>
            </div>
            <div className="panel bg-[rgba(248,252,249,0.96)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Reporting</p>
              <p className="mt-3 text-3xl font-bold text-foreground">Step-level</p>
              <p className="mt-2 text-sm leading-6 text-muted">Review outcomes without extra sprawl.</p>
            </div>
          </div>
        </div>

        <div className="panel relative overflow-hidden border-[#d7d4cb] bg-[linear-gradient(180deg,rgba(252,251,248,0.98)_0%,rgba(244,237,226,0.92)_100%)] p-6">
          <div className="absolute inset-x-8 top-0 h-28 bg-accent-soft/60 blur-3xl" />
          <div className="relative grid gap-4">
            <div className="border border-[#ddd6c8] bg-[#f1e8db] p-5">
              <p className="eyebrow">Admin Portal</p>
              <p className="mt-3 text-2xl font-semibold">Create a morning routine</p>
              <div className="mt-5 grid gap-3">
                {["Brush teeth", "Wash face", "Get dressed"].map((label, index) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 border border-[#ddd6c8] bg-white/94 px-4 py-3"
                  >
                    <div className="flex h-12 w-12 items-center justify-center border border-[#c8ddd6] bg-[#e2f1ec] text-sm font-bold text-accent">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{label}</p>
                      <p className="text-sm text-muted">Image-led step with optional text</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#255b52] bg-[#1f5f52] p-5 text-white">
              <p className="eyebrow !text-[#d6f2ea]">Mobile Experience</p>
              <div className="mt-4 border border-white/10 bg-white/8 p-4">
                <p className="text-lg font-semibold">Morning Reset</p>
                <div className="mt-4 border border-white/8 bg-white/10 p-4">
                  <div className="mb-4 aspect-[4/3] overflow-hidden border border-[#cce1db] bg-[#e6f0ec]">
                    <img
                      src="/demo-images/brush-teeth.jpg"
                      alt="Brush teeth routine step"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="text-xl font-semibold">Brush teeth</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="border border-white/30 bg-white px-4 py-3 text-center font-semibold text-accent">
                      Done
                    </div>
                    <div className="border border-white/30 px-4 py-3 text-center font-semibold">
                      Not Done
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-5 lg:grid-cols-2">
        <article className="panel bg-[rgba(252,251,248,0.98)] p-7">
          <p className="eyebrow">For Individuals</p>
          <h2 className="mt-4 text-[1.9rem] font-semibold text-foreground">
            Start with one person and a simple daily routine.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-8 text-muted">
            The free and individual plans are built for households that need a calm,
            dependable routine tool without committing to a larger organizational setup.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/for-individuals" className="button-secondary">
              Explore Individual Use
            </Link>
            <Link href="/pricing" className="button-primary">
              Start Free
            </Link>
          </div>
        </article>
        <article className="panel bg-[rgba(246,250,248,0.96)] p-7">
          <p className="eyebrow">For Care Orgs</p>
          <h2 className="mt-4 text-[1.9rem] font-semibold text-foreground">
            Add shared access, reporting, and rollout support when the work grows.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-8 text-muted">
            Families, caregiver teams, schools, therapy centers, and care organizations
            can use the same product with broader visibility and operational control.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/for-care-orgs" className="button-secondary">
              Explore Care Org Use
            </Link>
            <Link href="/contact" className="button-primary">
              Request a Demo
            </Link>
          </div>
        </article>
      </section>

      <section className="page-shell grid gap-5 md:grid-cols-3">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="panel p-7"
          >
            <p className="eyebrow">Core value</p>
            <h2 className="mt-4 text-[1.72rem] font-semibold text-foreground">{pillar.title}</h2>
            <p className="mt-4 text-base leading-7 text-muted">{pillar.body}</p>
          </article>
        ))}
      </section>

      <section className="page-shell grid gap-10 border-y border-line/70 py-12 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-5">
          <p className="eyebrow">How it works</p>
          <h2 className="display text-4xl text-foreground md:text-[2.9rem]">
            Predictable flows for staff, simple screens for supported users.
          </h2>
          <p className="max-w-xl text-base leading-8 text-muted">
            The platform is intentionally plain where it matters: routine setup,
            assignment, device linking, offline completion, and quick review of
            results.
          </p>
        </div>
        <div className="panel bg-[rgba(252,251,248,0.96)] p-7">
          <ol className="grid gap-4">
            {workflow.map((step, index) => (
              <li key={step} className="flex gap-4 border border-line bg-white/72 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#d2c09a] bg-[#f5ead3] text-sm font-bold text-[#8b6d34]">
                  {index + 1}
                </div>
                <p className="pt-2 text-sm leading-7 text-muted">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-shell">
        <div className="panel grid gap-8 border-[#d5d3cb] bg-[linear-gradient(180deg,rgba(252,251,248,0.98)_0%,rgba(240,248,244,0.88)_100%)] p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-4">
            <p className="eyebrow">Next step</p>
          <h2 className="display max-w-2xl text-4xl text-foreground md:text-[2.8rem]">
            Bring a calmer routine workflow into your care setting.
          </h2>
          <p className="max-w-2xl text-base leading-8 text-muted">
            Start with the free plan for one person, or talk through a setup that fits your family, caregiver team, or organization.
          </p>
        </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            <Link href="/pricing" className="button-secondary">
              View Plans
            </Link>
            <Link href="/contact" className="button-primary">
              Request a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
