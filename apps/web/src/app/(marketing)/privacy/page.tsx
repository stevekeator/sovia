const privacySections = [
  "This demo platform stores organization, staff, supported-user, routine, and completion data required to operate the product locally.",
  "Do not treat this v1 repository as a complete HIPAA compliance implementation. It is intentionally conservative about collected data and avoids unnecessary PHI fields.",
  "Pairing codes are short-lived, device links can be revoked, and admin access is role-scoped within organizations.",
];

export default function PrivacyPage() {
  return (
    <div className="page-shell space-y-6 py-16">
      <p className="eyebrow">Privacy</p>
      <h1 className="display text-5xl text-foreground">Privacy statement for the v1 platform.</h1>
      <div className="grid gap-4">
        {privacySections.map((section) => (
          <div key={section} className="panel rounded-[1.4rem] p-5 text-sm leading-8 text-muted">
            {section}
          </div>
        ))}
      </div>
    </div>
  );
}
