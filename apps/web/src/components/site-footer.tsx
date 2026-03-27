import Link from "next/link";

import { ProductWordmark } from "@/components/product-wordmark";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-14 border-t border-[#6f5843] bg-[#4f3d2d] text-[#f7f3ea]">
      <div className="page-shell py-10">
        <div className="grid gap-4 md:grid-cols-[1.55fr_0.75fr_0.75fr]">
          <div className="rounded-[10px] border border-[#6f5843] bg-[rgba(255,248,240,0.05)] p-5">
            <ProductWordmark
              theme="dark"
              descriptor="Care-ready routines and reporting"
            />
            <p className="mt-3 max-w-md text-sm leading-7 text-[#e4d8ca]">
              sovia helps individuals, families, and care organizations deliver calm,
              image-first routines that work on real devices and keep working offline.
            </p>
            <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#ccb9a4]">
              Built for care settings
            </p>
          </div>
          <div className="rounded-[10px] border border-[#6f5843] bg-[rgba(255,248,240,0.05)] p-5 text-sm text-[#e4d8ca]">
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
              <Link className="inline-block transition hover:text-white" href="/contact">
                Contact
              </Link>
            </div>
          </div>
          <div className="rounded-[10px] border border-[#6f5843] bg-[rgba(255,248,240,0.05)] p-5 text-sm text-[#e4d8ca]">
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
        <p className="mt-4 text-[0.72rem] font-medium tracking-[0.02em] text-[#ccb9a4]">
          Copyright © {currentYear} sovia. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
