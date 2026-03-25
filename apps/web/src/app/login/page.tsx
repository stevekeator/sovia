import Link from "next/link";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn } from "@/auth";

async function authenticate(formData: FormData) {
  "use server";

  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/portal",
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect("/login?error=credentials");
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="page-shell flex flex-1 items-center justify-center py-16">
      <div className="panel grid w-full max-w-5xl overflow-hidden rounded-[2rem] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-accent px-8 py-10 text-white">
          <p className="eyebrow !text-[#d6f2ea]">Admin Portal</p>
          <h1 className="display mt-4 text-5xl leading-tight">Sign in to manage routines and review outcomes.</h1>
          <div className="mt-8 space-y-3 text-sm leading-7 text-white/80">
            <p>Demo Org Admin: `avery@sunrisecare.test` / `demo-admin-123`</p>
            <p>Demo Caregiver: `jordan@sunrisecare.test` / `demo-caregiver-123`</p>
            <p>Platform Admin: `super@visualroutine.test` / `super-admin-123`</p>
          </div>
          <Link href="/" className="button-secondary mt-8 !border-white/20 !bg-white/10 !text-white">
            Back to site
          </Link>
        </div>

        <div className="px-8 py-10">
          <div className="space-y-3">
            <p className="eyebrow">Secure Access</p>
            <h2 className="text-3xl font-semibold">Welcome back</h2>
            <p className="text-sm leading-7 text-muted">
              Org-scoped access is enforced after sign-in. Supported users do not log
              into the web application.
            </p>
          </div>

          {params.error ? (
            <div className="mt-6 rounded-[1.2rem] border border-danger/20 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
              Sign-in failed. Check the demo credentials and try again.
            </div>
          ) : null}

          <form action={authenticate} className="mt-8 space-y-4">
            <label className="space-y-2 text-sm font-semibold">
              <span>Email</span>
              <input name="email" type="email" className="field" required />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              <span>Password</span>
              <input name="password" type="password" className="field" required />
            </label>
            <div className="pt-6">
              <button type="submit" className="button-primary w-full">
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
