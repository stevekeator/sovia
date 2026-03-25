import { ProductWordmark } from "@/components/product-wordmark";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-[rgba(247,243,234,0.88)] backdrop-blur-md">
      <div className="page-shell py-4">
        <div className="flex items-center justify-between gap-5 border border-[rgba(217,215,207,0.8)] bg-[rgba(252,251,248,0.82)] px-4 py-3 shadow-[0_8px_18px_rgba(31,42,40,0.04)]">
          <ProductWordmark />
          <SiteNav />
        </div>
      </div>
    </header>
  );
}
