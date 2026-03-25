import Link from "next/link";

import { ProductWordmark } from "@/components/product-wordmark";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[#6f5843] bg-[#4b3a2b] text-[#f7f3ea]">
      <div className="page-shell py-14">
        <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div className="rounded-[10px] border border-[#6f5843] bg-[rgba(255,248,240,0.06)] p-6">
            <ProductWordmark
              theme="dark"
              descriptor="Care-ready routines and reporting"
            />
            <p className="mt-4 max-w-md text-sm leading-7 text-[#e4d8ca]">
              sovia helps individuals, families, and care organizations deliver calm,
              image-first routines that work on real devices and keep working offline.
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#ccb9a4]">
              Built for care settings
            </p>
          </div>
          <div className="rounded-[10px] border border-[#6f5843] bg-[rgba(255,248,240,0.06)] p-6 text-sm text-[#e4d8ca]">
            <p className="text-sm font-semibold tracking-[0.01em] text-[#f7f3ea]">Explore</p>
            <div className="mt-4 flex flex-col items-start gap-2.5">
              <Link className="inline-block transition hover:text-white" href="/for-individuals">
                For Individuals
              </Link>
              <Link className="inline-block transition hover:text-white" href="/for-care-orgs">
                For Care Orgs
              </Link>
              <Link className="inline-block transition hover:text-white" href="/pricing">
                Pricing
              </Link>
              <Link className="inline-block transition hover:text-white" href="/about">
                About
              </Link>
              <Link className="inline-block transition hover:text-white" href="/contact">
                Contact
              </Link>
            </div>
          </div>
          <div className="rounded-[10px] border border-[#6f5843] bg-[rgba(255,248,240,0.06)] p-6 text-sm text-[#e4d8ca]">
            <p className="text-sm font-semibold tracking-[0.01em] text-[#f7f3ea]">
              Access and Policy
            </p>
            <div className="mt-4 flex flex-col items-start gap-2.5">
              <Link className="inline-block transition hover:text-white" href="/privacy">
                Privacy
              </Link>
              <Link className="inline-block transition hover:text-white" href="/terms">
                Terms
              </Link>
              <Link className="inline-block transition hover:text-white" href="/login">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-6 text-xs font-medium tracking-[0.02em] text-[#ccb9a4]">
          Copyright © {currentYear} sovia. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
