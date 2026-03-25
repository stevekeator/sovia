export default function AboutPage() {
  return (
    <div className="page-shell space-y-10 py-18">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end">
        <div className="space-y-5">
          <p className="eyebrow">About</p>
          <h1 className="display max-w-4xl text-5xl leading-tight text-foreground md:text-[4rem]">
            A routine platform designed for real support settings, not for generic productivity culture.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted">
            The product is built to feel clear and steady in use: approachable enough for households, structured enough for real care operations.
          </p>
        </div>
        <div className="panel bg-[rgba(252,251,248,0.95)] p-6">
          <p className="eyebrow">Positioning</p>
          <p className="mt-3 text-base leading-8 text-muted">
            This is not a generic productivity tool. It is a care-oriented routine platform shaped around image-led support, dependable setup, and quiet operational control at different scales.
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="panel bg-[rgba(252,251,248,0.98)] p-8 text-base leading-8 text-muted">
          sovia is built around a simple assumption: when supported users
          need consistency, staff need tools that reduce cognitive load instead of
          adding more configuration overhead. That means image-first steps, clear
          assignments, and reporting that stays close to the work when the situation calls for it.
        </article>
        <article className="panel bg-[rgba(247,250,248,0.92)] p-8 text-base leading-8 text-muted">
          The product aims to feel warm, calm, and professional. It is not a
          consumer habit app, and it is not an enterprise maze. The focus is
          straightforward routine delivery, device linking, offline resilience, and
          clean administrative control.
        </article>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <p className="eyebrow">What it supports</p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Consistency for supported users, clarity for caregivers, and cleaner visibility for the teams reviewing outcomes.
          </p>
        </div>
        <div className="panel p-5">
          <p className="eyebrow">What it avoids</p>
          <p className="mt-3 text-sm leading-7 text-muted">
            Busy dashboards, generic startup styling, and configuration-heavy workflows that make care work harder instead of easier.
          </p>
        </div>
      </div>
    </div>
  );
}
