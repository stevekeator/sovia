"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

const SOVIA_ICON_PATH =
  "M74 24C66 14 53 10 40 12C26 14 18 22 19 34C20 45 28 50 39 53C48 55 56 57 59 63C63 70 58 77 48 79C38 81 27 78 19 73C19 79 24 85 32 88C43 92 55 91 64 86C75 79 77 67 71 57C65 47 54 43 43 40C35 38 30 35 29 30C28 24 32 19 40 18C48 17 57 19 65 26C67 28 72 28 74 24Z";

export function ProductWordmark({
  href = "/",
  theme = "light",
  compact = false,
  descriptor = "Care-ready routines and reporting",
}: {
  href?: string;
  theme?: "light" | "dark";
  compact?: boolean;
  descriptor?: string;
}) {
  const isDark = theme === "dark";

  return (
    <Link href={href} className="product-wordmark">
      <svg
        viewBox="0 0 96 96"
        aria-hidden="true"
        className="h-10 w-10 shrink-0"
      >
        {!isDark ? (
          <defs>
            <linearGradient id="sovia-mark-fill" x1="18%" y1="16%" x2="82%" y2="84%">
              <stop offset="0%" stopColor="#2E7A68" />
              <stop offset="100%" stopColor="#1F5F52" />
            </linearGradient>
          </defs>
        ) : null}
        <path
          d={SOVIA_ICON_PATH}
          fill={isDark ? "#FFFFFF" : "url(#sovia-mark-fill)"}
          fillRule="nonzero"
        />
        {!isDark ? (
          <path
            d="M68 23C61 16 51 14 42 15C37 16 33 17 29 20C27 21 27 24 29 25C31 27 34 26 36 25C42 22 49 21 56 23C60 24 63 26 65 29C66 30 68 30 69 29C70 28 70 25 68 23Z"
            fill="#FFFFFF"
            opacity="0.18"
          />
        ) : null}
      </svg>
      <span className="min-w-0">
        <span
          className={cn(
            "product-wordmark__name",
            isDark && "product-wordmark__name--dark",
          )}
        >
          sovia
        </span>
        {!compact ? (
          <span
            className={cn(
              "product-wordmark__descriptor",
              isDark && "product-wordmark__descriptor--dark",
            )}
          >
            {descriptor}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
