const featureGroups = [
  {
    title: "For admin teams",
    items: [
      "Supported user management with simple status controls",
      "Routine builder with ordered steps, image upload, and publish flow",
      "Routine assignment and linked device visibility",
      "Reporting by routine, user, and date range",
    ],
  },
  {
    title: "For caregivers",
    items: [
      "Device pairing with a short-lived code",
      "Clear visibility into assigned routines and recent completions",
      "Quick relink and revoke controls when devices change hands",
      "Low-friction setup without patient credentials",
    ],
  },
  {
    title: "For supported users",
    items: [
      "Large, image-first mobile routine screens",
      "Done and Not Done responses with minimal copy",
      "Offline storage for linked profile and routine payloads",
      "Queued sync that submits later when the device reconnects",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="page-shell space-y-12 py-18">
      <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-end">
        <div className="space-y-5">
          <p className="eyebrow">Features</p>
          <h1 className="display text-5xl text-foreground md:text-[4rem]">Built for everyday care workflows.</h1>
          <p className="max-w-3xl text-lg leading-8 text-muted">
            The platform focuses on the practical work across different support settings:
            build routines, assign them, keep the mobile side simple, and review results
            only when your setup needs that visibility.
          </p>
        </div>
        <div className="panel bg-[rgba(252,251,248,0.96)] p-6">
          <p className="eyebrow">What matters most</p>
          <p className="mt-3 text-base leading-8 text-muted">
            Every part of the product is designed to reduce setup friction for households
            and staff while keeping the supported-user experience calm and predictable.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {featureGroups.map((group) => (
          <section key={group.title} className="panel p-7">
            <p className="eyebrow">Focus area</p>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">{group.title}</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
              {group.items.map((item) => (
                <li key={item} className="flex gap-3 border border-line bg-white/72 px-4 py-3">
                  <span className="mt-[0.35rem] inline-flex h-2.5 w-2.5 shrink-0 bg-accent-soft" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Keep caregiver setup clear and low-friction.",
          "Keep routine delivery simple on the device.",
          "Keep reporting close to the work being reviewed.",
        ].map((note) => (
          <div key={note} className="panel bg-[rgba(252,251,248,0.94)] p-5 text-sm leading-7 text-muted">
            <p className="eyebrow">Design principle</p>
            <p className="mt-3">{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
