const terms = [
  "This repository is provided as a local v1 implementation and should be reviewed before any production use.",
  "Organizations are responsible for validating their own data, operational, and regulatory requirements before deployment.",
  "The software is designed for visual routine management, assignment, and reporting. It does not provide medical advice or replace clinical judgment.",
];

export default function TermsPage() {
  return (
    <div className="page-shell space-y-6 py-16">
      <p className="eyebrow">Terms</p>
      <h1 className="display text-5xl text-foreground">Terms of use for the v1 build.</h1>
      <div className="grid gap-4">
        {terms.map((item) => (
          <div key={item} className="panel rounded-[1.4rem] p-5 text-sm leading-8 text-muted">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
