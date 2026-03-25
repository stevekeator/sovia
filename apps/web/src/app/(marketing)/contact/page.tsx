import { submitDemoRequestAction } from "@/app/(portal)/portal/actions";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="page-shell grid gap-8 py-16 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        <p className="eyebrow">Request a demo</p>
        <h1 className="display text-5xl text-foreground md:text-[4rem]">Tell us about your organization.</h1>
        <p className="max-w-xl text-lg leading-8 text-muted">
          Use this form to start a sales or onboarding conversation. The request is
          stored locally in the platform for v1 without a full external sales stack.
        </p>
        {params.submitted === "1" ? (
          <div className="border border-accent/20 bg-accent-soft px-5 py-4 text-sm font-semibold text-accent">
            Your request has been captured.
          </div>
        ) : null}
        <div className="panel bg-[rgba(252,251,248,0.95)] p-6">
          <p className="eyebrow">Good starting points</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted">
            <li>How many supported users or households are you planning for?</li>
            <li>Will caregivers be setting things up from one location or across a team?</li>
            <li>Do you expect to rely on voice guidance, offline access, or reporting most heavily?</li>
          </ul>
        </div>
      </div>

      <form action={submitDemoRequestAction} className="panel bg-[rgba(252,251,248,0.97)] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold">
            <span>Organization name</span>
            <input name="organizationName" className="field" required />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            <span>Contact name</span>
            <input name="contactName" className="field" required />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            <span>Email</span>
            <input name="email" type="email" className="field" required />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            <span>Phone</span>
            <input name="phone" className="field" />
          </label>
          <label className="space-y-2 text-sm font-semibold md:col-span-2">
            <span>Estimated user count</span>
            <input name="estimatedUserCount" type="number" min="1" className="field" />
          </label>
          <label className="space-y-2 text-sm font-semibold md:col-span-2">
            <span>Message</span>
            <textarea name="message" className="field" required />
          </label>
        </div>
        <button type="submit" className="button-primary mt-6">
          Send request
        </button>
      </form>
    </div>
  );
}
