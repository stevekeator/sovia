import Link from "next/link";

const sections = [
  {
    title: "Shared caregiver visibility",
    body: "Support routines across staff or family care teams without losing clarity about who is assigned where.",
  },
  {
    title: "Operational control without clutter",
    body: "Use assignments, linked devices, and reporting only when they add value to the real care workflow.",
  },
  {
    title: "Room to scale",
    body: "Start with small team access and move into organization-ready deployment, onboarding, and custom support when needed.",
  },
];

export default function ForCareOrgsPage() {
  return (
    <div className="page-shell space-y-12 py-18">
      <section className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
        <div className="space-y-5">
          <p className="eyebrow">For Care Orgs</p>
          <h1 className="display max-w-4xl text-5xl text-foreground md:text-[4rem]">
            Operational support for families, care teams, and organizations.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted">
            sovia supports the administrative side of routine delivery when multiple
            caregivers, staff members, or locations need a calmer way to manage setup,
            assignments, device access, and reporting.
          </p>
        </div>
        <div className="panel bg-[rgba(252,251,248,0.96)] p-6">
          <p className="eyebrow">Best fit</p>
          <p className="mt-3 text-base leading-8 text-muted">
            Family care teams, schools, therapy centers, supported-living operations,
            and other organizations that need shared access and structured rollout.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {sections.map((section) => (
          <article key={section.title} className="panel p-7">
            <p className="eyebrow">Operational value</p>
            <h2 className="mt-4 text-[1.72rem] font-semibold text-foreground">{section.title}</h2>
            <p className="mt-4 text-base leading-7 text-muted">{section.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="panel p-7">
          <p className="eyebrow">What organizations can use</p>
          <ul className="mt-5 space-y-3 text-base leading-8 text-muted">
            <li>Supported-user profiles with assignments and linked devices.</li>
            <li>Routine libraries that can be reused and updated across people.</li>
            <li>Shared caregiver access and clearer reporting when outcomes need review.</li>
            <li>Enterprise-ready support for larger organizations that need custom setup.</li>
          </ul>
        </div>
        <div className="panel bg-[rgba(246,250,248,0.96)] p-7">
          <p className="eyebrow">Next step</p>
          <p className="mt-4 text-base leading-8 text-muted">
            Smaller teams can begin with the Family / Care Team plan. Larger organizations
            can use Enterprise for custom onboarding, broader deployment, and pricing shaped
            around the scale of the program.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/pricing" className="button-secondary">
              Compare Plans
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
