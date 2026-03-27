import Link from "next/link";

function GuidanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M5 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 7.5c1.2-1.8 3.4-3 5.9-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function VoiceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M12 4a3 3 0 0 1 3 3v4a3 3 0 1 1-6 0V7a3 3 0 0 1 3-3Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 10.5a5 5 0 0 0 10 0M12 15.5V20M9 20h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function OfflineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M7 17h10M8.5 12.5L12 9l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9v8M4.5 6.5c2-1.8 4.6-2.7 7.5-2.7 2.8 0 5.4.9 7.5 2.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SetupIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4M6.8 6.8l2.8 2.8M14.4 14.4l2.8 2.8M17.2 6.8l-2.8 2.8M9.6 14.4l-2.8 2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <rect x="7.2" y="2.8" width="9.6" height="18.4" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 5.7h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="18" r="0.9" fill="currentColor" />
    </svg>
  );
}

function ReportingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M5 18.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.5 15V10.5M12 15V7.5M16.5 15V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 6.5h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

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
      <section className="page-shell space-y-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
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
            <div className="flex flex-wrap gap-3">
              <span className="marketing-chip">
                <GuidanceIcon />
                Image-first routines
              </span>
              <span className="marketing-chip">
                <VoiceIcon />
                Voice guidance
              </span>
              <span className="marketing-chip">
                <OfflineIcon />
                Offline-ready
              </span>
            </div>
          </div>

          <div className="panel relative overflow-hidden border-[#d7d4cb] bg-[linear-gradient(180deg,rgba(252,251,248,0.98)_0%,rgba(244,237,226,0.92)_100%)] p-6 lg:p-7">
            <div className="absolute inset-x-8 top-0 h-28 bg-accent-soft/60 blur-3xl" />
            <div className="relative flex min-h-[34rem] items-center justify-center rounded-[10px] border border-dashed border-[#cfc5b5] bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(237,246,241,0.45)_100%)] p-8">
              <div className="absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(circle_at_center,rgba(31,95,82,0.16),transparent_68%)]" />
              <div className="relative flex h-[31rem] w-[16rem] items-center justify-center rounded-[2.4rem] border border-[#d5cec1] bg-[#1f2a28] p-3 shadow-[0_22px_52px_rgba(31,42,40,0.22)]">
                <div className="absolute top-3 h-6 w-28 rounded-full bg-[#2d3b38]" />
                <div className="flex h-full w-full flex-col rounded-[2rem] border border-[#d6d0c4] bg-[linear-gradient(180deg,#f7f3ea_0%,#edf6f1_100%)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="eyebrow">Mobile App</p>
                      <p className="mt-1 text-lg font-semibold text-foreground">Morning Routine</p>
                    </div>
                    <div className="rounded-[999px] border border-[#c8ddd6] bg-white/80 px-3 py-1 text-xs font-semibold text-accent">
                      Step 1 of 3
                    </div>
                  </div>
                  <div className="mt-4 flex-1 overflow-hidden rounded-[1.3rem] border border-[#d6d0c4] bg-white/90 p-4">
                    <div className="aspect-[4/5] overflow-hidden rounded-[1rem] border border-[#d8e8e0] bg-[#eef5f1]">
                      <img
                        src="/demo-images/brush-teeth.jpg"
                        alt="Routine screen placeholder"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="mt-4 space-y-3">
                      <p className="text-xl font-semibold text-foreground">Brush teeth</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[10px] border border-[#cfe0d7] bg-[#edf6f1] px-4 py-3 text-center text-sm font-semibold text-accent">
                          Done
                        </div>
                        <div className="rounded-[10px] border border-line bg-white px-4 py-3 text-center text-sm font-semibold text-muted">
                          Not Done
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[10px] border border-dashed border-[#d2d8ce] bg-white/60 px-4 py-3 text-center text-xs font-semibold tracking-[0.08em] text-muted">
                    Final product imagery will replace this placeholder.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 pt-3 sm:grid-cols-3">
          <div className="panel p-6">
            <span className="marketing-icon-badge">
              <SetupIcon />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Setup</p>
            <p className="mt-3 text-3xl font-bold text-foreground">Minutes</p>
            <p className="mt-2 text-sm leading-6 text-muted">Fast pairing and routine publishing.</p>
          </div>
          <div className="panel bg-[rgba(252,251,248,0.98)] p-6">
            <span className="marketing-icon-badge">
              <PhoneIcon />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Mobile mode</p>
            <p className="mt-3 text-3xl font-bold text-foreground">Offline-ready</p>
            <p className="mt-2 text-sm leading-6 text-muted">Calm screens that keep working offline.</p>
          </div>
          <div className="panel bg-[rgba(248,252,249,0.96)] p-6">
            <span className="marketing-icon-badge">
              <ReportingIcon />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Reporting</p>
            <p className="mt-3 text-3xl font-bold text-foreground">Step-level</p>
            <p className="mt-2 text-sm leading-6 text-muted">Review outcomes without extra sprawl.</p>
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
              <li key={step} className="marketing-list-card flex gap-4">
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
